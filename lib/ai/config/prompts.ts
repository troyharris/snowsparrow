import { createClient } from "@/utils/supabase/server";

export interface AIPrompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  content: string;
  tool_name: string;
  tool_id: string | null;
  type: "system" | "public" | "user";
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptInject {
  id: string;
  name: string;
  display_name: string;
  description: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PromptInjectLink {
  id: string;
  prompt_id: string;
  inject_id: string;
  created_at: string;
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
export async function getPromptsForTool(toolIdentifier: string): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter((prompt) => 
    // Support both tool_id and tool_name for backward compatibility
    prompt.tool_id === toolIdentifier || prompt.tool_name === toolIdentifier
  );
}

/**
 * Gets prompts for a specific tool by ID
 */
export async function getPromptsByToolId(toolId: string): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter((prompt) => prompt.tool_id === toolId);
}

/**
 * Gets system prompts for a specific tool
 */
export async function getSystemPromptsForTool(
  toolIdentifier: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) => 
      (prompt.tool_id === toolIdentifier || prompt.tool_name === toolIdentifier) && 
      prompt.type === "system"
  );
}

/**
 * Gets public prompts for a specific tool
 */
export async function getPublicPromptsForTool(
  toolIdentifier: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) => 
      (prompt.tool_id === toolIdentifier || prompt.tool_name === toolIdentifier) && 
      prompt.type === "public"
  );
}

/**
 * Gets user prompts for a specific tool and user
 */
export async function getUserPromptsForTool(
  toolIdentifier: string,
  userId: string
): Promise<AIPrompt[]> {
  const prompts = await getAllPrompts();
  return prompts.filter(
    (prompt) =>
      (prompt.tool_id === toolIdentifier || prompt.tool_name === toolIdentifier) &&
      prompt.type === "user" &&
      prompt.user_id === userId
  );
}

// Cache for prompt injects to avoid frequent database calls
let injectsCache: PromptInject[] | null = null;
let injectsLastFetchTime = 0;

/**
 * Fetches all prompt injects from the database
 */
export async function getAllPromptInjects(): Promise<PromptInject[]> {
  const now = Date.now();

  // Return cached injects if available and not expired
  if (injectsCache && now - injectsLastFetchTime < CACHE_TTL) {
    console.log("Returning cached prompt injects", injectsCache);
    return injectsCache;
  }

  try {
    console.log("Creating Supabase client with service role for injects");
    const supabase = await createClient(true); // Use service role
    console.log("Supabase client created with service role for injects");

    try {
      console.log("Executing query to fetch prompt injects");
      const { data, error } = await supabase.from("prompt_injects").select("*");
      console.log("Query executed for injects", {
        dataLength: data?.length,
        error,
      });

      if (error) {
        console.error("Error fetching prompt injects:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }

      // Update cache
      injectsCache = data;
      injectsLastFetchTime = now;

      console.log("Returning prompt injects from database", { count: data?.length });
      return data;
    } catch (queryError) {
      console.error("Query error for injects:", queryError);
      console.error(
        "Query error details:",
        JSON.stringify(queryError, null, 2)
      );
      throw queryError;
    }
  } catch (error) {
    console.error("Failed to fetch prompt injects:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    // Fallback to empty array instead of throwing
    console.warn("Using empty prompt injects array as fallback");
    return [];
  }
}

/**
 * Gets prompt injects for a specific prompt
 */
export async function getInjectsForPrompt(promptId: string): Promise<PromptInject[]> {
  try {
    console.log("Creating Supabase client with service role for prompt injects");
    const supabase = await createClient(true); // Use service role
    console.log("Supabase client created with service role for prompt injects");

    // Get the inject IDs linked to this prompt
    const { data: links, error: linksError } = await supabase
      .from("prompt_inject_links")
      .select("inject_id")
      .eq("prompt_id", promptId);

    if (linksError) {
      console.error("Error fetching prompt inject links:", linksError);
      console.error("Error details:", JSON.stringify(linksError, null, 2));
      throw linksError;
    }

    if (!links || links.length === 0) {
      return [];
    }

    // Get all the injects
    const injectIds = links.map(link => link.inject_id);
    const { data: injects, error: injectsError } = await supabase
      .from("prompt_injects")
      .select("*")
      .in("id", injectIds);

    if (injectsError) {
      console.error("Error fetching prompt injects:", injectsError);
      console.error("Error details:", JSON.stringify(injectsError, null, 2));
      throw injectsError;
    }

    return injects || [];
  } catch (error) {
    console.error("Failed to fetch injects for prompt:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return [];
  }
}

/**
 * Processes a prompt by injecting content from linked prompt injects
 */
export async function processPrompt(prompt: AIPrompt): Promise<string> {
  let content = prompt.content;

  // Get injects for this prompt
  const injects = await getInjectsForPrompt(prompt.id);
  
  // Process each inject
  for (const inject of injects) {
    // Replace the placeholder with the inject content
    // The placeholder format is {{INJECT:name}}
    const placeholder = `{{INJECT:${inject.name}}}`;
    content = content.replace(placeholder, inject.content);
  }

  return content;
}

/**
 * Invalidates the injects cache
 */
export function invalidateInjectsCache(): void {
  injectsCache = null;
  injectsLastFetchTime = 0;
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
