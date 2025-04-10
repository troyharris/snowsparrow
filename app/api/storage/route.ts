import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import crypto from "crypto";
import { UploadRequest } from "@/lib/types";
import { isAuthenticated } from "@/utils/supabase/middleware"; // Import isAuthenticated

// 5MB in bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function generateUniqueFileName(userId: string): string {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString("hex");
  return `${userId}_${timestamp}_${randomString}.png`;
}

function isValidBase64Image(base64String: string): boolean {
  // Check if it's a valid base64 PNG string
  const pngSignature = "data:image/png;base64,";
  if (!base64String.startsWith(pngSignature)) {
    return false;
  }

  // Remove the data URL prefix
  const base64Data = base64String.replace(/^data:image\/png;base64,/, "");

  try {
    // Check if it's valid base64
    const buffer = Buffer.from(base64Data, "base64");
    return buffer.length <= MAX_FILE_SIZE;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // Add authentication check
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { imageData, prompt, mermaidCode } = body as UploadRequest;

    if (!imageData || !prompt || !mermaidCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidBase64Image(imageData)) {
      return NextResponse.json(
        { error: "Invalid image data or file too large" },
        { status: 400 }
      );
    }

    // Generate unique file name
    const fileName = generateUniqueFileName(user.id);
    const filePath = `${user.id}/${fileName}`;

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("flowcharts")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: false,
        metadata: {
          prompt,
          mermaidCode,
        },
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("flowcharts").getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
