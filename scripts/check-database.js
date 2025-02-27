#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Checking Supabase database...");

  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
  }

  console.log("Supabase URL:", supabaseUrl);
  console.log("Creating Supabase client...");

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check if prompts table exists
  console.log("Checking prompts table...");
  try {
    const { data: promptsData, error: promptsError } = await supabase
      .from("prompts")
      .select("*");

    if (promptsError) {
      console.error("Error fetching prompts:", promptsError);
    } else {
      console.log("Prompts table exists");
      console.log("Number of prompts:", promptsData.length);
      console.log("Prompts:", promptsData);
    }
  } catch (error) {
    console.error("Error checking prompts table:", error);
  }

  // Check if models table exists
  console.log("\nChecking models table...");
  try {
    const { data: modelsData, error: modelsError } = await supabase
      .from("models")
      .select("*");

    if (modelsError) {
      console.error("Error fetching models:", modelsError);
    } else {
      console.log("Models table exists");
      console.log("Number of models:", modelsData.length);
      console.log("Models:", modelsData);
    }
  } catch (error) {
    console.error("Error checking models table:", error);
  }

  // Check if handbook_default prompt exists
  console.log("\nChecking for handbook_default prompt...");
  try {
    const { data: handbookPrompt, error: handbookError } = await supabase
      .from("prompts")
      .select("*")
      .eq("name", "handbook_default")
      .single();

    if (handbookError) {
      console.error("Error fetching handbook_default prompt:", handbookError);
    } else if (handbookPrompt) {
      console.log("handbook_default prompt exists:", handbookPrompt);
    } else {
      console.log("handbook_default prompt does not exist");

      // Create handbook_default prompt
      console.log("\nCreating handbook_default prompt...");
      const { data: newPrompt, error: createError } = await supabase
        .from("prompts")
        .insert({
          name: "handbook_default",
          display_name: "Employee Handbook Assistant",
          description: "Answers questions about the FUSD employee handbook",
          content:
            "Below is the employee handbook for Flagstaff Unified School District. Your job is to be a helpful AI assistant and answer any questions about employment at FUSD that is contained in the handbook. If the handbook does not cover the topic, simply let the user know that it is not covered in the handbook and to contact the FUSD HR department for more information.\n\n{{FILE_CONTENT}}",
          filepath: "lib/ai/data/handbook.txt",
          tool_name: "handbook",
          type: "system",
        })
        .select();

      if (createError) {
        console.error("Error creating handbook_default prompt:", createError);
      } else {
        console.log("handbook_default prompt created:", newPrompt);
      }
    }
  } catch (error) {
    console.error("Error checking handbook_default prompt:", error);
  }
}

main().catch(console.error);
