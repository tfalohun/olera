import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/admin";

/**
 * POST /api/connections/respond
 *
 * Accepts or declines a connection request. Only the recipient
 * (to_profile_id) can respond. Updates status to "accepted" or "declined".
 *
 * Uses the service client to bypass RLS for the write (UPDATE policy
 * only allows from_profile_id, but the recipient is to_profile_id).
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

    // Use service client to bypass RLS for both read and write
    const adminDb = getServiceClient();

    // Fetch the connection using service client
    const { data: connection, error: fetchError } = await adminDb
      .from("connections")
      .select("id, from_profile_id, to_profile_id, status")
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      console.error("Respond fetch error:", fetchError);
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

    // Write using service client and verify with .select()
    const { data: updated, error: updateError } = await adminDb
      .from("connections")
      .update({ status: action })
      .eq("id", connectionId)
      .select("id, status")
      .single();

    if (updateError || !updated) {
      console.error("Respond update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: updated.status });
  } catch (err) {
    console.error("Respond error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
