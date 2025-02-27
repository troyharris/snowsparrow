import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { invalidateInjectsCache, invalidatePromptsCache } from "@/lib/ai/config/prompts";

export async function GET(request: NextRequest) {
  try {
    console.log("Prompt Inject Links API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Inject Links API: Supabase client created with service role");

    // Get query parameters
    const url = new URL(request.url);
    const promptId = url.searchParams.get("prompt_id");
    const injectId = url.searchParams.get("inject_id");
    console.log("Prompt Inject Links API: Query parameters", { promptId, injectId });

    // Build query
    console.log("Prompt Inject Links API: Building query");
    let query = supabase.from("prompt_inject_links").select("*");

    if (promptId) {
      query = query.eq("prompt_id", promptId);
    }

    if (injectId) {
      query = query.eq("inject_id", injectId);
    }

    console.log("Prompt Inject Links API: Executing query");
    const { data, error } = await query;
    console.log("Prompt Inject Links API: Query executed", {
      dataLength: data?.length,
      error,
    });

    if (error) {
      console.error("Prompt Inject Links API: Error fetching links:", error);
      console.error(
        "Prompt Inject Links API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to fetch prompt inject links" },
        { status: 500 }
      );
    }

    console.log("Prompt Inject Links API: Returning links", { count: data?.length });
    return NextResponse.json({ links: data });
  } catch (error) {
    console.error("Prompt Inject Links API: API error:", error);
    console.error(
      "Prompt Inject Links API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Prompt Inject Links API: Creating Supabase client with service role for POST");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Inject Links API: Supabase client created with service role for POST");

    const json = await request.json();
    console.log("Prompt Inject Links API: Creating link:", json);

    // Validate required fields
    if (!json.prompt_id || !json.inject_id) {
      return NextResponse.json(
        { error: "prompt_id and inject_id are required" },
        { status: 400 }
      );
    }

    // Check if the link already exists
    const { data: existingLink, error: checkError } = await supabase
      .from("prompt_inject_links")
      .select("*")
      .eq("prompt_id", json.prompt_id)
      .eq("inject_id", json.inject_id)
      .maybeSingle();

    if (checkError) {
      console.error("Prompt Inject Links API: Error checking existing link:", checkError);
      console.error(
        "Prompt Inject Links API: Error details:",
        JSON.stringify(checkError, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to check for existing link" },
        { status: 500 }
      );
    }

    // If the link already exists, return it
    if (existingLink) {
      console.log("Prompt Inject Links API: Link already exists:", existingLink);
      return NextResponse.json({ link: existingLink });
    }

    // Create the link
    const { data, error } = await supabase
      .from("prompt_inject_links")
      .insert(json)
      .select("*")
      .single();

    if (error) {
      console.error("Prompt Inject Links API: Error creating link:", error);
      console.error(
        "Prompt Inject Links API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to create prompt inject link" },
        { status: 500 }
      );
    }

    console.log("Prompt Inject Links API: Link created successfully:", data);

    // Invalidate caches
    if (typeof invalidateInjectsCache === 'function') {
      invalidateInjectsCache();
    }
    if (typeof invalidatePromptsCache === 'function') {
      invalidatePromptsCache();
    }

    return NextResponse.json({ link: data });
  } catch (error) {
    console.error("Prompt Inject Links API: Error in POST:", error);
    console.error(
      "Prompt Inject Links API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("Prompt Inject Links API: Creating Supabase client with service role for DELETE");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Inject Links API: Supabase client created with service role for DELETE");

    const url = new URL(request.url);
    const promptId = url.searchParams.get("prompt_id");
    const injectId = url.searchParams.get("inject_id");
    const id = url.searchParams.get("id");
    
    console.log("Prompt Inject Links API: Delete parameters", { promptId, injectId, id });

    if (id) {
      // Delete by ID
      console.log("Prompt Inject Links API: Deleting link by ID:", id);
      const { error } = await supabase
        .from("prompt_inject_links")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Prompt Inject Links API: Error deleting link by ID:", error);
        console.error(
          "Prompt Inject Links API: Error details:",
          JSON.stringify(error, null, 2)
        );
        return NextResponse.json(
          { error: "Failed to delete prompt inject link" },
          { status: 500 }
        );
      }
    } else if (promptId && injectId) {
      // Delete by prompt_id and inject_id
      console.log("Prompt Inject Links API: Deleting link by prompt_id and inject_id:", { promptId, injectId });
      const { error } = await supabase
        .from("prompt_inject_links")
        .delete()
        .eq("prompt_id", promptId)
        .eq("inject_id", injectId);

      if (error) {
        console.error("Prompt Inject Links API: Error deleting link by prompt_id and inject_id:", error);
        console.error(
          "Prompt Inject Links API: Error details:",
          JSON.stringify(error, null, 2)
        );
        return NextResponse.json(
          { error: "Failed to delete prompt inject link" },
          { status: 500 }
        );
      }
    } else if (promptId) {
      // Delete all links for a prompt
      console.log("Prompt Inject Links API: Deleting all links for prompt:", promptId);
      const { error } = await supabase
        .from("prompt_inject_links")
        .delete()
        .eq("prompt_id", promptId);

      if (error) {
        console.error("Prompt Inject Links API: Error deleting links for prompt:", error);
        console.error(
          "Prompt Inject Links API: Error details:",
          JSON.stringify(error, null, 2)
        );
        return NextResponse.json(
          { error: "Failed to delete prompt inject links" },
          { status: 500 }
        );
      }
    } else if (injectId) {
      // Delete all links for an inject
      console.log("Prompt Inject Links API: Deleting all links for inject:", injectId);
      const { error } = await supabase
        .from("prompt_inject_links")
        .delete()
        .eq("inject_id", injectId);

      if (error) {
        console.error("Prompt Inject Links API: Error deleting links for inject:", error);
        console.error(
          "Prompt Inject Links API: Error details:",
          JSON.stringify(error, null, 2)
        );
        return NextResponse.json(
          { error: "Failed to delete prompt inject links" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either id, prompt_id, or inject_id is required" },
        { status: 400 }
      );
    }

    console.log("Prompt Inject Links API: Links deleted successfully");

    // Invalidate caches
    if (typeof invalidateInjectsCache === 'function') {
      invalidateInjectsCache();
    }
    if (typeof invalidatePromptsCache === 'function') {
      invalidatePromptsCache();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prompt Inject Links API: Error in DELETE:", error);
    console.error(
      "Prompt Inject Links API: Error details:",
      JSON.stringify(error, null, 2)
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
