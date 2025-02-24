"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardContent,
} from "@/components/shared";

const Mermaid = dynamic(() => import("@/app/mermaid/MermaidComponent"), {
  ssr: false,
});

export default function MermaidPage() {
  const [inputText, setInputText] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [promptType, setPromptType] = useState<"default" | "technical">(
    "default"
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateDiagram = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/mermaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputText, promptType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate diagram");
      }

      setMermaidCode(data.mermaidCode);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error generating diagram:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-4xl">
            Flowchart Creator
          </h1>
          <p className="text-muted mt-2 leading-relaxed">
            Describe your workflow in plain English, and we will turn it into a
            professional flowchart.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader title="Workflow Description" />
              <CardContent>
                <Select
                  id="promptType"
                  label="Diagram Type"
                  value={promptType}
                  onChange={(e) =>
                    setPromptType(e.target.value as "default" | "technical")
                  }
                  fullWidth
                  options={[
                    { value: "default", label: "Standard Flowchart" },
                    { value: "technical", label: "Technical System Diagram" },
                  ]}
                />

                <Textarea
                  id="workflow"
                  label="Description"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    promptType === "default"
                      ? "Example: First, the user logs in. If login is successful, they see their dashboard. If login fails, they return to the login page with an error message."
                      : "Example: The web client sends requests to the API gateway, which routes them to microservices. Each microservice connects to its own database and communicates through a message queue."
                  }
                  fullWidth
                  className="h-48"
                />

                {error && <ErrorMessage message={error} />}

                <Button
                  onClick={generateDiagram}
                  disabled={!inputText.trim() || isLoading}
                  fullWidth
                >
                  {isLoading ? (
                    <LoadingSpinner text="Generating..." />
                  ) : (
                    "Generate Flowchart"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Tips" />
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Standard Flowchart
                  </h4>
                  <ul className="text-sm text-muted space-y-2 leading-relaxed">
                    <li>• Be specific about the steps in your process</li>
                    <li>• Include decision points and their outcomes</li>
                    <li>• Mention any loops or repetitive steps</li>
                    <li>• Keep descriptions clear and concise</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Technical System Diagram
                  </h4>
                  <ul className="text-sm text-muted space-y-2 leading-relaxed">
                    <li>
                      • Describe system components and their relationships
                    </li>
                    <li>• Specify data flow directions</li>
                    <li>• Include important technical details</li>
                    <li>• Mention any system constraints or requirements</li>
                  </ul>
                </div>

                <div className="text-sm text-muted pt-4 border-t border-border">
                  <p>
                    Choose the diagram type that best fits your needs. Standard
                    flowcharts are great for processes and workflows, while
                    technical diagrams are better for system architecture and
                    data flow.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="w-full">
            <CardContent className="items-center justify-center bg-white text-black">
              {mermaidCode ? (
                <Mermaid mermaidCode={mermaidCode} prompt={inputText} />
              ) : (
                <div className="text-center py-8">
                  <p>Your flowchart will appear here</p>
                  <p className="text-sm mt-2">
                    Enter a workflow description and click Generate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
