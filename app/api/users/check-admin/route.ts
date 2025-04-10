import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/utils/supabase/middleware"; // Import isAuthenticated

export async function GET(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Check Admin API: Processing GET request");
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    console.log("Check Admin API: Checking admin status for user", { userId });

    if (!userId) {
      console.log("Check Admin API: Missing user ID in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Check Admin API: Creating Supabase client with service role");
    // Use service role to bypass RLS policies
    const supabase = await createClient(true);
    console.log("Check Admin API: Supabase client created");

    console.log("Check Admin API: Fetching user admin status", { userId });
    // Get the user's admin status
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    console.log("Check Admin API: Admin status fetched", {
      userId,
      data,
      error,
    });

    if (error) {
      console.error("Check Admin API: Error checking admin status:", error);
      console.error(
        "Check Admin API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Check Admin API: Returning admin status", {
      userId,
      isAdmin: data?.is_admin || false,
    });
    return NextResponse.json({ isAdmin: data?.is_admin || false });
  } catch (error) {
    console.error("Check Admin API: Unexpected error:", error);
    console.error(
      "Check Admin API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
