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
    console.log("Tools API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Tools API: Supabase client created with service role");

    // Get query parameters
    const url = new URL(request.url);
    const isActive = url.searchParams.get("is_active");
    console.log("Tools API: Query parameters", { isActive });

    // Build query
    console.log("Tools API: Building query");
    let query = supabase.from("tools").select("*");

    if (isActive === "true") {
      query = query.eq("is_active", true);
    } else if (isActive === "false") {
      query = query.eq("is_active", false);
    }

    // Order by sort_order
    query = query.order("sort_order", { ascending: true });

    console.log("Tools API: Executing query");
    const { data, error } = await query;
    console.log("Tools API: Query executed", {
      dataLength: data?.length,
      error,
    });

    if (error) {
      console.error("Tools API: Error fetching tools:", error);
      console.error(
        "Tools API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to fetch tools" },
        { status: 500 }
      );
    }

    console.log("Tools API: Returning tools", { count: data?.length });
    return NextResponse.json({ tools: data });
  } catch (error) {
    console.error("Tools API: API error:", error);
    console.error(
      "Tools API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(
      "Tools API: Creating Supabase client with service role for POST"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Tools API: Supabase client created with service role for POST"
    );

    const json = await request.json();
    console.log("Tools API: Inserting tool:", json);

    const { data, error } = await supabase
      .from("tools")
      .insert(json)
      .select("*")
      .single();

    if (error) {
      console.error("Tools API: Error creating tool:", error);
      console.error(
        "Tools API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to create tool" },
        { status: 500 }
      );
    }

    console.log("Tools API: Tool created successfully:", data);

    return NextResponse.json({ tool: data });
  } catch (error) {
    console.error("Tools API: Error in POST:", error);
    console.error(
      "Tools API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(
      "Tools API: Creating Supabase client with service role for PUT"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Tools API: Supabase client created with service role for PUT"
    );

    const json = await request.json();
    const { id, ...updateData } = json;
    console.log("Tools API: Updating tool:", { id, updateData: JSON.stringify(updateData) });

    if (!id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tools")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Tools API: Error updating tool:", error);
      console.error(
        "Tools API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to update tool" },
        { status: 500 }
      );
    }

    console.log("Tools API: Tool updated successfully:", data);

    return NextResponse.json({ tool: data });
  } catch (error) {
    console.error("Tools API: Error in PUT:", error);
    console.error(
      "Tools API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
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
    console.log(
      "Tools API: Creating Supabase client with service role for DELETE"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Tools API: Supabase client created with service role for DELETE"
    );

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("Tools API: Deleting tool with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("tools").delete().eq("id", id);

    if (error) {
      console.error("Tools API: Error deleting tool:", error);
      console.error(
        "Tools API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to delete tool" },
        { status: 500 }
      );
    }

    console.log("Tools API: Tool deleted successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tools API: Error in DELETE:", error);
    console.error(
      "Tools API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
