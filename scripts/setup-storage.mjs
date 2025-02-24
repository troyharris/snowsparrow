import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(dirname(__dirname), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Required environment variables are missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  try {
    // Create the flowcharts bucket if it doesn't exist
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) throw bucketsError;

    const flowchartsBucket = buckets.find(
      (bucket) => bucket.name === "flowcharts"
    );

    if (!flowchartsBucket) {
      console.log("Creating flowcharts bucket...");
      const { error: createError } = await supabase.storage.createBucket(
        "flowcharts",
        {
          public: false,
          allowedMimeTypes: ["image/png"],
          fileSizeLimit: 5242880, // 5MB
        }
      );

      if (createError) throw createError;
      console.log("Flowcharts bucket created successfully");
    } else {
      console.log("Flowcharts bucket already exists");
    }

    console.log("\nStorage bucket setup completed!");
    console.log(
      "\nIMPORTANT: You must now set up the storage policies manually."
    );
    console.log(
      "\nPlease execute the following SQL in your Supabase Dashboard SQL editor:"
    );
    console.log(`
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload their own flowcharts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'flowcharts' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can view their own flowcharts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'flowcharts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);`);
  } catch (error) {
    console.error("Error setting up storage:", error);
    process.exit(1);
  }
}

setupStorage();
