"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const Mermaid = dynamic(() => import("@/app/mermaid/MermaidComponent"), {
  ssr: false,
});

export default function MermaidPage() {
  const [inputText, setInputText] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");

  const generateDiagram = async () => {
    // Call the API route to get the Mermaid code from OpenRouter
    const response = await fetch("/api/mermaid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputText }),
    });

    const data = await response.json();
    setMermaidCode(data.mermaidCode);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Flowchart Creator
          </h1>
          <p className="text-muted mt-2">
            Describe your workflow in plain English, and we&apos;ll turn it into
            a professional flowchart.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card">
              <label
                htmlFor="workflow"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Workflow Description
              </label>
              <textarea
                id="workflow"
                className="w-full h-48 resize-y"
                placeholder="Example: First, the user logs in. If login is successful, they see their dashboard. If login fails, they return to the login page with an error message."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                className="mt-4 w-full bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateDiagram}
                disabled={!inputText.trim()}
              >
                Generate Flowchart
              </button>
            </div>

            <div className="card bg-input">
              <h3 className="text-sm font-medium text-foreground mb-2">Tips</h3>
              <ul className="text-sm text-muted space-y-2">
                <li>• Be specific about the steps in your process</li>
                <li>• Include decision points and their outcomes</li>
                <li>• Mention any loops or repetitive steps</li>
                <li>• Keep descriptions clear and concise</li>
              </ul>
            </div>
          </div>

          <div className="card w-full flex items-center justify-center">
            {mermaidCode ? (
              <Mermaid mermaidCode={mermaidCode} />
            ) : (
              <div className="text-center text-muted">
                <p>Your flowchart will appear here</p>
                <p className="text-sm mt-2">
                  Enter a workflow description and click Generate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
