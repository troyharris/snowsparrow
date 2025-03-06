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

export interface Prompt {
    id: string;
    name: string;
    display_name: string;
    description: string;
    content: string;
    tool_name: string | null;
    tool_id: string | null;
    type: "system" | "public" | "user";
}
  
export interface PromptWithInjects extends Prompt {
    injects: PromptInject[];
    selectedInjectIds: string[];
}