"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Card, CardContent, CardHeader } from "./Card";
import { Select } from "./Select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Model {
  id: string;
  display_name: string;
  api_string: string;
  description: string;
}

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  type: "system" | "public" | "user";
}

interface ChatInterfaceProps {
  apiEndpoint: string;
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  showModelSelector?: boolean;
  showPromptSelector?: boolean;
  toolName?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiEndpoint,
  title = "Chat",
  description,
  placeholder = "Type your message here...",
  className = "",
  showModelSelector = false,
  showPromptSelector = false,
  toolName = "chat",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assistantName = "Snowsparrow";
  
  // Model and prompt selection state
  const [models, setModels] = useState<Model[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  
  // Fetch models and prompts on component mount
  useEffect(() => {
    if (showModelSelector) {
      fetchModels();
    }
    
    if (showPromptSelector) {
      fetchPrompts();
    }
  }, [showModelSelector, showPromptSelector, toolName]);
  
  // Fetch available models
  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelError(null);
    
    try {
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      // Handle both formats: direct array or { models: [...] }
      const modelsList = Array.isArray(data) ? data : data.models || [];
      setModels(modelsList);
      
      // Set default selected model if available
      if (modelsList.length > 0) {
        setSelectedModelId(modelsList[0].id);
      }
    } catch (err) {
      setModelError(err instanceof Error ? err.message : 'Failed to load models');
      console.error('Error fetching models:', err);
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // Fetch available prompts for the tool
  const fetchPrompts = async () => {
    setIsLoadingPrompts(true);
    setPromptError(null);
    
    try {
      const response = await fetch(`/api/prompts?tool_name=${toolName}&type=public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      
      const data = await response.json();
      setPrompts(data.prompts);
      
      // Set default selected prompt if available
      if (data.prompts.length > 0) {
        setSelectedPromptId(data.prompts[0].id);
      }
    } catch (err) {
      setPromptError(err instanceof Error ? err.message : 'Failed to load prompts');
      console.error('Error fetching prompts:', err);
    } finally {
      setIsLoadingPrompts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setError(null);

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Send to API
    setIsLoading(true);
    try {
      // Prepare request body based on available selections
      const requestBody: any = { message: userMessage };
      
      // Add model and prompt IDs if they're selected
      if (showModelSelector && selectedModelId) {
        requestBody.modelId = selectedModelId;
      }
      
      if (showPromptSelector && selectedPromptId) {
        requestBody.promptId = selectedPromptId;
      }
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      console.error("Error in chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <Card>
        {title && <CardHeader title={title} description={description} />}
        <CardContent>
          <div className="flex flex-col space-y-6 mt-4">
            {/* Model and Prompt Selectors */}
            {(showModelSelector || showPromptSelector) && (
              <div className="flex flex-col sm:flex-row gap-4 mb-2">
                {showModelSelector && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Model
                    </label>
                    {isLoadingModels ? (
                      <div className="text-sm text-muted-foreground">Loading models...</div>
                    ) : modelError ? (
                      <ErrorMessage message={modelError} />
                    ) : (
                      <Select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        disabled={isLoading || models.length === 0}
                        fullWidth
                        options={models.map((model) => ({
                          value: model.id,
                          label: model.display_name
                        }))}
                      />
                    )}
                  </div>
                )}
                
                {showPromptSelector && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Prompt
                    </label>
                    {isLoadingPrompts ? (
                      <div className="text-sm text-muted-foreground">Loading prompts...</div>
                    ) : promptError ? (
                      <ErrorMessage message={promptError} />
                    ) : (
                      <Select
                        value={selectedPromptId}
                        onChange={(e) => setSelectedPromptId(e.target.value)}
                        disabled={isLoading || prompts.length === 0}
                        fullWidth
                        options={prompts.map((prompt) => ({
                          value: prompt.id,
                          label: prompt.display_name
                        }))}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Message history */}
            {messages.length > 0 ? (
              <div className="space-y-6 mb-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-gray-300 dark:bg-accent-hover ml-auto"
                        : "bg-input dark:bg-border"
                    } ${
                      message.role === "user" ? "max-w-[80%]" : "max-w-[90%]"
                    }`}
                  >
                    <p className="text-sm font-bold text-foreground mb-1">
                      {message.role === "user" ? "You" : assistantName}
                    </p>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No messages yet</p>
                <p className="text-sm mt-2">
                  Type a message to start the conversation
                </p>
              </div>
            )}

            {/* Error message */}
            {error && <ErrorMessage message={error} />}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={placeholder}
                className="min-h-[100px] w-full"
                fullWidth
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputText.trim()}>
                {isLoading ? <LoadingSpinner text="Sending..." /> : "Send"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
