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
    console.log("Users API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role for admin operations
    console.log("Users API: Supabase client created");

    console.log("Users API: Fetching profiles");
    // Get all profiles
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, website, avatar_url, updated_at, is_admin"
      )
      .order("username");

    console.log("Users API: Profiles fetched", {
      count: data?.length,
      error,
    });

    if (error) {
      console.error("Users API: Error fetching users:", error);
      console.error(
        "Users API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Users API: Returning profiles", { count: data?.length });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Users API: Unexpected error:", error);
    console.error("Users API: Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Users API: Processing PATCH request");
    const body = await request.json();
    const { id, is_admin, ...profileData } = body;
    console.log("Users API: Update request for user", { id, is_admin });

    if (!id) {
      console.log("Users API: Missing user ID in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Users API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role for admin operations
    console.log("Users API: Supabase client created");

    console.log("Users API: Updating profile", { id });
    // Update the profile
    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        is_admin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Users API: Error updating user:", error);
      console.error(
        "Users API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Users API: User updated successfully", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users API: Unexpected error:", error);
    console.error("Users API: Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Users API: Processing DELETE request");
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("Users API: Delete request for user", { id });

    if (!id) {
      console.log("Users API: Missing user ID in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("Users API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role for admin operations
    console.log("Users API: Supabase client created");

    console.log("Users API: Deleting user profile", { id });
    // Delete the user profile
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      console.error("Users API: Error deleting profile:", profileError);
      console.error(
        "Users API: Error details:",
        JSON.stringify(profileError, null, 2)
      );
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    console.log("Users API: Deleting auth user", { id });
    // Delete the user from auth.users (requires admin privileges)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
      console.error("Users API: Error deleting auth user:", authError);
      console.error(
        "Users API: Error details:",
        JSON.stringify(authError, null, 2)
      );
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    console.log("Users API: User deleted successfully", { id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users API: Unexpected error:", error);
    console.error("Users API: Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
