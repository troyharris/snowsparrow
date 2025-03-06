"use client";

import React, { useEffect, useState, Suspense } from "react";
import type { Tool } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { ChatInterface } from "@/components/shared";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Conversation } from "@/lib/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [toolId, setToolId] = useState<string | null>(null);
  
  // Fetch tool ID for "chat"
  useEffect(() => {
    const fetchToolId = async () => {
      try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        const chatTool = data.tools.find((t: Tool) => t.name === 'AI Chat');
        if (chatTool) {
          setToolId(chatTool.id);
        } else {
          console.error('Chat tool not found');
        }
      } catch (err) {
        console.error('Error fetching tool ID:', err);
      }
    };
    
    fetchToolId();
  }, []);
  
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/conversations?id=${conversationId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load conversation");
        }
        
        setConversation({
          id: data.conversation.id,
          title: data.conversation.title,
          model_id: data.conversation.model_id,
          prompt_id: data.conversation.prompt_id,
          created_at: data.conversation.created_at,
          updated_at: data.conversation.updated_at,
          messages: data.messages
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        console.error("Error loading conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversation();
  }, [conversationId]);
  
  // Show loading state while fetching toolId or conversation
  if (isLoading || !toolId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text={isLoading ? "Loading conversation..." : "Loading chat..."} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
        <ErrorMessage message={error} />
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-4xl">
            AI Chat
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            Chat with AI models using different prompts. Select a model and prompt to customize your experience.
          </p>
        </div>

        <ChatInterface
          apiEndpoint="/api/chat"
          title="AI Chat"
          description="Select a model and prompt, then start chatting"
          placeholder="Type your message here..."
          showModelSelector={true}
          showPromptSelector={true}
          toolId={toolId || ''}
          enableSave={true}
          initialMessages={conversation?.messages}
          initialModelId={conversation?.model_id || undefined}
          initialPromptId={conversation?.prompt_id || undefined}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
