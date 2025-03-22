export interface ConversationMessage {
    role: string;
    content: string;
}

export interface DatabaseConversation {
    id: string
    title: string
    created_at: string
    updated_at: string
    tool: { name: string | null, href: string | null } | null
}

export interface Conversation {
    id: string;
    title: string;
    model_id: string | null;
    prompt_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    messages: ConversationMessage[];
  }
