import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { invalidatePromptsCache } from "@/lib/ai/config/prompts";
import { isAuthenticated } from "@/utils/supabase/middleware"; // Import isAuthenticated

export async function GET(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Prompts API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Prompts API: Supabase client created with service role");

    // Get query parameters
    const url = new URL(request.url);
    const toolName = url.searchParams.get("tool_name");
    const toolId = url.searchParams.get("tool_id");
    const type = url.searchParams.get("type");
    console.log("Prompts API: Query parameters", { toolName, toolId, type });

    // Build query
    console.log("Prompts API: Building query");
    let query = supabase.from("prompts").select("*");

    if (toolId) {
      query = query.eq("tool_id", toolId);
    } else if (toolName) {
      // Fall back to tool_name if tool_id is not provided
      query = query.eq("tool_name", toolName);
    }

    if (type) {
      query = query.eq("type", type);
    }

    console.log("Prompts API: Executing query");
    const { data, error } = await query;
    console.log("Prompts API: Query executed", {
      dataLength: data?.length,
      error,
    });

    if (error) {
      console.error("Prompts API: Error fetching prompts:", error);
      console.error(
        "Prompts API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 }
      );
    }

    console.log("Prompts API: Returning prompts", { count: data?.length });
    return NextResponse.json({ prompts: data });
  } catch (error) {
    console.error("Prompts API: API error:", error);
    console.error(
      "Prompts API: Error details:",
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
      "Prompts API: Creating Supabase client with service role for POST"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Prompts API: Supabase client created with service role for POST"
    );

    const json = await request.json();
    console.log("Prompts API: Inserting prompt:", json);

    const { data, error } = await supabase
      .from("prompts")
      .insert(json)
      .select("*")
      .single();

    if (error) {
      console.error("Prompts API: Error creating prompt:", error);
      console.error(
        "Prompts API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to create prompt" },
        { status: 500 }
      );
    }

    console.log("Prompts API: Prompt created successfully:", data);

    // Invalidate cache
    invalidatePromptsCache();

    return NextResponse.json({ prompt: data });
  } catch (error) {
    console.error("Prompts API: Error in POST:", error);
    console.error(
      "Prompts API: Error details:",
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
      "Prompts API: Creating Supabase client with service role for PUT"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Prompts API: Supabase client created with service role for PUT"
    );

    const json = await request.json();
    const { id, ...updateData } = json;
    console.log("Prompts API: Updating prompt:", { id, updateData: JSON.stringify(updateData) });

    if (!id) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("prompts")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Prompts API: Error updating prompt:", error);
      console.error(
        "Prompts API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to update prompt" },
        { status: 500 }
      );
    }

    console.log("Prompts API: Prompt updated successfully:", data);

    // Invalidate cache
    invalidatePromptsCache();

    return NextResponse.json({ prompt: data });
  } catch (error) {
    console.error("Prompts API: Error in PUT:", error);
    console.error(
      "Prompts API: Error details:",
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
      "Prompts API: Creating Supabase client with service role for DELETE"
    );
    const supabase = await createClient(true); // Use service role
    console.log(
      "Prompts API: Supabase client created with service role for DELETE"
    );

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("Prompts API: Deleting prompt with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Prompt ID is required" },
        { status: 400 }
      );
    }

    try {
      // Use a direct SQL query to update all conversations that reference this prompt
      console.log("Prompts API: Updating conversations with direct SQL");
      const { error: sqlError } = await supabase.from('conversations')
        .update({ prompt_id: null })
        .eq('prompt_id', id);
      
      if (sqlError) {
        console.error("Prompts API: Error updating conversations with SQL:", sqlError);
        console.error(
          "Prompts API: SQL Error details:",
          JSON.stringify(sqlError, null, 2)
        );
        return NextResponse.json(
          { error: `Failed to update conversations: ${sqlError.message}` },
          { status: 500 }
        );
      }
      
      console.log("Prompts API: Conversations updated, now attempting to delete prompt");
      
      // Now try to delete the prompt
      console.log("Prompts API: Deleting prompt");
      const { error } = await supabase.from("prompts").delete().eq("id", id);
      
      if (error) {
        console.error("Prompts API: Error deleting prompt:", error);
        console.error(
          "Prompts API: Error details:",
          JSON.stringify(error, null, 2)
        );
        
        // If we still get a constraint error, try to provide more specific information
        if (error.code === "23503") { // Foreign key violation
          return NextResponse.json(
            { error: "This prompt is still referenced by other records in the database. Please remove those references first." },
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          { error: `Failed to delete prompt: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log("Prompts API: Prompt deleted successfully");
      
      // Invalidate cache
      invalidatePromptsCache();
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Prompts API: Error in DELETE:", error);
      console.error(
        "Prompts API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Prompts API: Error in DELETE:", error);
    console.error(
      "Prompts API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
