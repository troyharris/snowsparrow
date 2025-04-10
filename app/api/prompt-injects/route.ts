import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { invalidateInjectsCache } from "@/lib/ai/config/prompts";
import { isAuthenticated } from "@/utils/supabase/middleware"; // Import isAuthenticated

export async function GET(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Prompt Injects API: Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Injects API: Supabase client created with service role");

    // Get query parameters
    const url = new URL(request.url);
    const promptId = url.searchParams.get("prompt_id");
    console.log("Prompt Injects API: Query parameters", { promptId });

    if (promptId) {
      // Get injects for a specific prompt
      console.log(`Prompt Injects API: Fetching injects for prompt ${promptId}`);
      
      // First get the inject IDs linked to this prompt
      const { data: links, error: linksError } = await supabase
        .from("prompt_inject_links")
        .select("inject_id")
        .eq("prompt_id", promptId);

      if (linksError) {
        console.error("Prompt Injects API: Error fetching prompt inject links:", linksError);
        console.error("Prompt Injects API: Error details:", JSON.stringify(linksError, null, 2));
        return NextResponse.json(
          { error: "Failed to fetch prompt inject links" },
          { status: 500 }
        );
      }

      if (!links || links.length === 0) {
        console.log(`Prompt Injects API: No injects found for prompt ${promptId}`);
        return NextResponse.json({ injects: [] });
      }

      // Get all the injects
      const injectIds = links.map(link => link.inject_id);
      const { data: injects, error: injectsError } = await supabase
        .from("prompt_injects")
        .select("*")
        .in("id", injectIds);

      if (injectsError) {
        console.error("Prompt Injects API: Error fetching prompt injects:", injectsError);
        console.error("Prompt Injects API: Error details:", JSON.stringify(injectsError, null, 2));
        return NextResponse.json(
          { error: "Failed to fetch prompt injects" },
          { status: 500 }
        );
      }

      console.log(`Prompt Injects API: Returning ${injects?.length} injects for prompt ${promptId}`);
      return NextResponse.json({ injects: injects || [] });
    } else {
      // Get all injects
      console.log("Prompt Injects API: Fetching all injects");
      const { data, error } = await supabase.from("prompt_injects").select("*");
      
      if (error) {
        console.error("Prompt Injects API: Error fetching all injects:", error);
        console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
        return NextResponse.json(
          { error: "Failed to fetch prompt injects" },
          { status: 500 }
        );
      }

      console.log(`Prompt Injects API: Returning ${data?.length} injects`);
      return NextResponse.json({ injects: data || [] });
    }
  } catch (error) {
    console.error("Prompt Injects API: API error:", error);
    console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
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
    console.log("Prompt Injects API: Creating Supabase client with service role for POST");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Injects API: Supabase client created with service role for POST");

    const json = await request.json();
    console.log("Prompt Injects API: Creating inject:", json);

    const { data, error } = await supabase
      .from("prompt_injects")
      .insert(json)
      .select("*")
      .single();

    if (error) {
      console.error("Prompt Injects API: Error creating inject:", error);
      console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to create prompt inject" },
        { status: 500 }
      );
    }

    console.log("Prompt Injects API: Inject created successfully:", data);

    // Invalidate cache
    if (typeof invalidateInjectsCache === 'function') {
      invalidateInjectsCache();
    }

    return NextResponse.json({ inject: data });
  } catch (error) {
    console.error("Prompt Injects API: Error in POST:", error);
    console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
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
    console.log("Prompt Injects API: Creating Supabase client with service role for PUT");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Injects API: Supabase client created with service role for PUT");

    const json = await request.json();
    const { id, ...updateData } = json;
    console.log("Prompt Injects API: Updating inject:", { id, updateData });

    if (!id) {
      return NextResponse.json(
        { error: "Inject ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("prompt_injects")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Prompt Injects API: Error updating inject:", error);
      console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to update prompt inject" },
        { status: 500 }
      );
    }

    console.log("Prompt Injects API: Inject updated successfully:", data);

    // Invalidate cache
    if (typeof invalidateInjectsCache === 'function') {
      invalidateInjectsCache();
    }

    return NextResponse.json({ inject: data });
  } catch (error) {
    console.error("Prompt Injects API: Error in PUT:", error);
    console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
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
    console.log("Prompt Injects API: Creating Supabase client with service role for DELETE");
    const supabase = await createClient(true); // Use service role
    console.log("Prompt Injects API: Supabase client created with service role for DELETE");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("Prompt Injects API: Deleting inject with ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "Inject ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("prompt_injects").delete().eq("id", id);

    if (error) {
      console.error("Prompt Injects API: Error deleting inject:", error);
      console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Failed to delete prompt inject" },
        { status: 500 }
      );
    }

    console.log("Prompt Injects API: Inject deleted successfully");

    // Invalidate cache
    if (typeof invalidateInjectsCache === 'function') {
      invalidateInjectsCache();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prompt Injects API: Error in DELETE:", error);
    console.error("Prompt Injects API: Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
