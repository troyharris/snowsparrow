"use client";

import React, { Suspense } from "react";
import { ChatInterface } from "@/components/shared";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// TODO: Replace with the actual toolId once created in the database
const TOOL_ID_PLACEHOLDER = "b3a1afb0-d0b4-48c6-a944-4b09e70275c8"; 

function JobChatContent() {
  // In a real scenario, you might fetch tool details if needed,
  // but for static config, we pass the ID directly.
  
  // Basic check to ensure placeholder is replaced
  /* if (TOOL_ID_PLACEHOLDER === "YOUR_MACBOOK_BASICS_TOOL_ID_HERE") {
     console.warn("Macbook Basics page: TOOL_ID_PLACEHOLDER needs to be replaced with the actual tool ID.");
     // Optionally render an error or loading state until ID is set
  }
     */

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-4xl">
            Personalized Job Chat
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            An AI assistant tailored specificly to your job.
          </p>
        </div>

        <ChatInterface
          apiEndpoint="/api/chat"
          title="Job Based Chat"
          description="An AI chatbot personalized to your FUSD job."
          placeholder="e.g., What are some important things to know about my job?"
          showModelSelector={false} // Static model defined by tool
          showPromptSelector={false} // Static prompt defined by tool
          toolId={TOOL_ID_PLACEHOLDER} // Crucial: Links to the correct model/prompt via API
          enableSave={true} // Allow saving conversations
          // initialMessages, initialModelId, initialPromptId could be used if loading a saved conversation
        />
      </div>
    </div>
  );
}

export default function MacBasicsPage() {
  return (
    // Suspense boundary for potential async operations within ChatInterface or future enhancements
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text="Loading Macbook Basics tool..." />
      </div>
    }>
      <JobChatContent />
    </Suspense>
  );
}
