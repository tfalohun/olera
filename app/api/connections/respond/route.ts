import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/connections/respond
 *
 * Accepts or declines a connection request. Only the recipient
 * (to_profile_id) can respond. Updates status to "accepted" or "declined".
 *
 * This uses the server client (with the user's auth cookie) to ensure
 * the write goes through even if client-side RLS has issues.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, action } = body as {
      connectionId?: string;
      action?: "accepted" | "declined";
    };

    if (!connectionId || !action) {
      return NextResponse.json(
        { error: "connectionId and action are required" },
        { status: 400 }
      );
    }

    if (action !== "accepted" && action !== "declined") {
      return NextResponse.json(
        { error: "action must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    // Get user's active profile
    const { data: account } = await supabase
      .from("accounts")
      .select("active_profile_id")
      .eq("user_id", user.id)
      .single();

    if (!account?.active_profile_id) {
      return NextResponse.json(
        { error: "No active profile" },
        { status: 400 }
      );
    }

    // Fetch the connection
    const { data: connection, error: fetchError } = await supabase
      .from("connections")
      .select("id, from_profile_id, to_profile_id, status")
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Only the recipient can accept/decline
    if (connection.to_profile_id !== account.active_profile_id) {
      return NextResponse.json(
        { error: "Only the recipient can respond" },
        { status: 403 }
      );
    }

    // Can only respond to pending connections
    if (connection.status !== "pending") {
      return NextResponse.json(
        { error: "Can only respond to pending connections" },
        { status: 400 }
      );
    }

    // Update status
    const { error: updateError } = await supabase
      .from("connections")
      .update({ status: action })
      .eq("id", connectionId);

    if (updateError) {
      console.error("Respond error:", updateError);
      return NextResponse.json(
        { error: "Failed to update connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: action });
  } catch (err) {
    console.error("Respond error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
