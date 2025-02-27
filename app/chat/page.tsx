"use client";

import React from "react";
import { ChatInterface } from "@/components/shared";

export default function ChatPage() {
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
          toolName="chat"
        />
      </div>
    </div>
  );
}
