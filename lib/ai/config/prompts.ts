import { createClient } from "@/utils/supabase/server";
import fs from "fs/promises";
import path from "path";

export interface AIPrompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  content: string;
  filepath: string | null;
  tool_name: string;
  type: "system" | "public" | "user";
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// Cache for prompts to avoid frequent database calls
let promptsCache: AIPrompt[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

/**
 * Fetches all prompts from the database
 */
export async function getAllPrompts(): Promise<AIPrompt[]> {
  const now = Date.now();

  // Return cached prompts if available and not expired
  if (promptsCache && now - lastFetchTime < CACHE_TTL) {
    console.log("Returning cached prompts", promptsCache);
    return promptsCache;
  }

  try {
    console.log("Creating Supabase client with service role");
    const supabase = await createClient(true); // Use service role
    console.log("Supabase client created with service role");

    try {
      console.log("Executing query to fetch prompts");
      const { data, error } = await supabase.from("prompts").select("*");
      console.log("Query executed", {
        dataLength: data?.length,
        error,
      });

      if (error) {
        console.error("Error fetching prompts:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // Update cache
      promptsCache = data;
      lastFetchTime = now;

      console.log("Returning prompts from database", { count: data?.length });
      return data;
    } catch (queryError) {
      console.error("Query error:", queryError);
      console.error(
        "Query error details:",
        JSON.stringify(queryError, null, 2)
      );
      throw queryError;
    }
  } catch (error) {
    console.error("Failed to fetch prompts:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    // Fallback to empty array instead of throwing
    console.warn("Using empty prompts array as fallback");
    return [];
  }
}

/**
 * Gets a prompt by its name
 */
export async function getPromptByName(
  name: string
): Promise<AIPrompt | undefined> {
  const prompts = await getAllPrompts();
  return prompts.find((prompt) => prompt.name === name);
}

/**
 * Gets prompts for a specific tool
 */
export async function getPromptsForTool(toolName: string): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter((prompt) => prompt.tool_name === toolName);
}

/**
 * Gets system prompts for a specific tool
 */
export async function getSystemPromptsForTool(
  toolName: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) => prompt.tool_name === toolName && prompt.type === "system"
  );
}

/**
 * Gets public prompts for a specific tool
 */
export async function getPublicPromptsForTool(
  toolName: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) => prompt.tool_name === toolName && prompt.type === "public"
  );
}

/**
 * Gets user prompts for a specific tool and user
 */
export async function getUserPromptsForTool(
  toolName: string,
  userId: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) =>
      prompt.tool_name === toolName &&
      prompt.type === "user" &&
      prompt.user_id === userId
  );
}

/**
 * Processes a prompt by injecting file content if filepath is specified
 */
export async function processPrompt(prompt: AIPrompt): Promise<string> {
  let content = prompt.content;

  // If filepath is specified, read the file and inject its content
  if (prompt.filepath) {
    try {
      const filePath = path.join(process.cwd(), prompt.filepath);
      const fileContent = await fs.readFile(filePath, "utf-8");
      content = content.replace("{{FILE_CONTENT}}", fileContent);
    } catch (error) {
      console.error(`Error reading file ${prompt.filepath}:`, error);
      throw new Error(`Failed to read file: ${prompt.filepath}`);
    }
  }

  return content;
}

/**
 * Gets a processed prompt by name
 */
export async function getProcessedPromptByName(name: string): Promise<string> {
  const prompt = await getPromptByName(name);

  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }

  return processPrompt(prompt);
}

/**
 * Gets a prompt for a specific task and formats it for use with OpenRouter
 */
export async function getPromptForTask(
  toolName: string,
  promptName: string,
  userInput: string
): Promise<{ messages: Array<{ role: string; content: string }> }> {
  const prompt = await getPromptByName(`${toolName}_${promptName}`);

  if (!prompt) {
    throw new Error(`Prompt not found for task: ${toolName}_${promptName}`);
  }

  const processedContent = await processPrompt(prompt);

  // Format the prompt for OpenRouter
  return {
    messages: [
      {
        role: "system",
        content: processedContent,
      },
      {
        role: "user",
        content: userInput,
      },
    ],
  };
}

/**
 * Invalidates the prompts cache
 */
export function invalidatePromptsCache(): void {
  promptsCache = null;
  lastFetchTime = 0;
}
