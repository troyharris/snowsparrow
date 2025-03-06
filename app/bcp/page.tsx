"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatInterface } from "@/components/shared";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  model_id: string | null;
  prompt_id: string | null;
  messages: Message[];
}

function BCPContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
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
  
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text="Loading conversation..." />
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
            Business Continuity Plan Creator
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            Create a comprehensive business continuity plan by answering a series of questions. The AI will guide you through the process and help you develop a detailed plan for your department.
          </p>
        </div>

        <ChatInterface
          apiEndpoint="/api/bcp"
          title="Business Continuity Plan"
          description="I'll help you create a business continuity plan by asking you a series of questions. You can save your progress at any time and come back to it later."
          placeholder="Type your response here..."
          showModelSelector={false}
          showPromptSelector={false}
          toolName="bcp"
          enableSave={true}
          initialMessages={conversation?.messages}
          initialModelId={conversation?.model_id || undefined}
          initialPromptId={conversation?.prompt_id || undefined}
        />
      </div>
    </div>
  );
}

export default function BCPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <BCPContent />
    </Suspense>
  );
}
