import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/models - Get all models
export async function GET() {
  try {
    console.log("Models API: Creating Supabase client");
    const supabase = await createClient();
    console.log("Models API: Supabase client created");

    console.log("Models API: Fetching models");
    const { data, error } = await supabase.from("models").select("*");
    console.log("Models API: Models fetched", {
      count: data?.length,
      error,
    });

    if (error) {
      console.error("Models API: Error fetching models:", error);
      console.error(
        "Models API: Error details:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to fetch models" },
        { status: 500 }
      );
    }

    console.log("Models API: Returning models", { count: data?.length });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Models API: API error:", error);
    console.error("Models API: Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// POST /api/models - Create a new model
export async function POST(request: Request) {
  try {
    const model = await request.json();

    // Validate required fields
    if (!model.display_name || !model.api_string) {
      return NextResponse.json(
        { error: "Display name and API string are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("models")
      .insert([
        {
          display_name: model.display_name,
          api_string: model.api_string,
          description: model.description || "",
          supports_vision: model.supports_vision || false,
          supports_thinking: model.supports_thinking || false,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating model:", error);
      return NextResponse.json(
        { error: "Failed to create model" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/models - Update a model
export async function PATCH(request: Request) {
  try {
    const model = await request.json();

    // Validate required fields
    if (!model.id) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("models")
      .update({
        display_name: model.display_name,
        api_string: model.api_string,
        description: model.description,
        supports_vision: model.supports_vision,
        supports_thinking: model.supports_thinking,
      })
      .eq("id", model.id)
      .select();

    if (error) {
      console.error("Error updating model:", error);
      return NextResponse.json(
        { error: "Failed to update model" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/models - Delete a model
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("models").delete().eq("id", id);

    if (error) {
      console.error("Error deleting model:", error);
      return NextResponse.json(
        { error: "Failed to delete model" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
