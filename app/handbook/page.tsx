"use client";

import React, { useState, useEffect, Suspense } from "react";
import type { Tool } from "@/components/shared/types";
import { ChatInterface } from "@/components/shared";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

function HandbookContent() {
  const [toolId, setToolId] = useState<string | null>(null);
  
  // Fetch tool ID for "handbook"
  useEffect(() => {
    const fetchToolId = async () => {
      try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        const handbookTool = data.tools.find((t: Tool) => t.name === 'Employee Handbook Chat');
        if (handbookTool) {
          setToolId(handbookTool.id);
        } else {
          console.error('Handbook tool not found');
        }
      } catch (err) {
        console.error('Error fetching tool ID:', err);
      }
    };
    
    fetchToolId();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-4xl">
            Employee Handbook Assistant
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            Ask questions about the Flagstaff Unified School District employee
            handbook. Get quick answers about policies, procedures, benefits,
            and more.
          </p>
        </div>

        <ChatInterface
          apiEndpoint="/api/handbook"
          title="Handbook Q&A"
          description="Ask any question about the FUSD employee handbook"
          placeholder="Example: What is the policy on bereavement leave? How do I request time off? What are the district's core values?"
          toolId={toolId || ''}
          enableSave={true}
        />
      </div>
    </div>
  );
}

export default function HandbookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <HandbookContent />
    </Suspense>
  );
}
