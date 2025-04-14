"use client";

import React, { Suspense } from "react";
import { ChatInterface } from "@/components/shared";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// TODO: Replace with the actual toolId once created in the database
const TOOL_ID_PLACEHOLDER = "YOUR_MACBOOK_BASICS_TOOL_ID_HERE"; 

function MacBasicsContent() {
  // In a real scenario, you might fetch tool details if needed,
  // but for static config, we pass the ID directly.
  
  // Basic check to ensure placeholder is replaced
  if (TOOL_ID_PLACEHOLDER === "YOUR_MACBOOK_BASICS_TOOL_ID_HERE") {
     console.warn("Macbook Basics page: TOOL_ID_PLACEHOLDER needs to be replaced with the actual tool ID.");
     // Optionally render an error or loading state until ID is set
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-4xl">
            Macbook Basics
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            An AI assistant designed to assist PC users transition to the Mac platform. Ask questions about macOS features, keyboard shortcuts, settings, and more.
          </p>
        </div>

        <ChatInterface
          apiEndpoint="/api/chat"
          title="Macbook Basics"
          description="Ask questions about using a Mac"
          placeholder="e.g., How do I right-click on a Mac? What's the equivalent of Ctrl+Alt+Delete?"
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
      <MacBasicsContent />
    </Suspense>
  );
}
