import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/admin";

/**
 * POST /api/connections/get
 *
 * Fetches a single connection by ID using the service client (bypasses RLS).
 * Authenticates via the user's session cookie, then verifies participation.
 * Returns the connection with from/to profile data.
 *
 * Using POST (not GET) because Next.js App Router aggressively caches GET
 * route handlers, which would return stale connection data.
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
    const { connectionId } = body as { connectionId?: string };

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
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

    // Use service client to bypass RLS entirely
    const adminDb = getServiceClient();

    const { data: connection, error: fetchError } = await adminDb
      .from("connections")
      .select(
        "id, type, status, from_profile_id, to_profile_id, message, metadata, created_at, updated_at"
      )
      .eq("id", connectionId)
      .single();

    if (fetchError || !connection) {
      console.error("Connection fetch error:", fetchError);
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Verify the user is a participant
    const profileId = account.active_profile_id;
    if (
      connection.from_profile_id !== profileId &&
      connection.to_profile_id !== profileId
    ) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch profiles for both participants
    const profileIds = [connection.from_profile_id, connection.to_profile_id];
    const { data: profiles } = await adminDb
      .from("business_profiles")
      .select(
        "id, display_name, description, image_url, city, state, type, email, phone, website, slug, care_types, category, source_provider_id"
      )
      .in("id", profileIds);

    let profileList = profiles || [];

    // For profiles missing image_url, try to get image from iOS olera-providers
    const missingImageIds = profileList
      .filter((p: any) => !p.image_url && p.source_provider_id)
      .map((p: any) => p.source_provider_id as string);

    if (missingImageIds.length > 0) {
      const { data: iosProviders } = await adminDb
        .from("olera-providers")
        .select("provider_id, provider_logo, provider_images")
        .in("provider_id", missingImageIds);

      if (iosProviders?.length) {
        const iosMap = new Map(
          iosProviders.map(
            (p: {
              provider_id: string;
              provider_logo: string | null;
              provider_images: string | null;
            }) => [
              p.provider_id,
              p.provider_logo ||
                p.provider_images?.split(" | ")[0] ||
                null,
            ]
          )
        );
        profileList = profileList.map((p: any) => {
          if (
            !p.image_url &&
            p.source_provider_id &&
            iosMap.has(p.source_provider_id)
          ) {
            return {
              ...p,
              image_url: iosMap.get(p.source_provider_id) || null,
            };
          }
          return p;
        });
      }
    }

    const profileMap = new Map(
      profileList.map((p: { id: string }) => [p.id, p])
    );

    return NextResponse.json({
      connection: {
        ...connection,
        fromProfile: profileMap.get(connection.from_profile_id) || null,
        toProfile: profileMap.get(connection.to_profile_id) || null,
      },
    });
  } catch (err) {
    console.error("Connection get error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
