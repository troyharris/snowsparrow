"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { SuccessMessage } from "./SuccessMessage";
import { Card, CardContent, CardHeader } from "./Card";
import { Select } from "./Select";
import { ConversationMessage, AIModel, Prompt } from "@/lib/types";

interface ChatInterfaceProps {
  apiEndpoint: string;
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  showModelSelector?: boolean;
  showPromptSelector?: boolean;
  toolId: string; // UUID of the tool
  enableSave?: boolean;
  initialMessages?: ConversationMessage[];
  initialModelId?: string;
  initialPromptId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiEndpoint,
  title = "Chat",
  description,
  placeholder = "Type your message here...",
  className = "",
  showModelSelector = false,
  showPromptSelector = false,
  toolId,
  enableSave = false,
  initialMessages = [],
  initialModelId,
  initialPromptId,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assistantName = "Snowsparrow";
  
  // Model and prompt selection state
  const [models, setModels] = useState<AIModel[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || "");
  const [selectedPromptId, setSelectedPromptId] = useState<string>(initialPromptId || "");
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  
  // Save conversation state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [showTitleInput, setShowTitleInput] = useState(false);

  // Function to generate conversation title using AI
  const generateConversationTitle = async (messages: ConversationMessage[]): Promise<string> => {
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Generate a short title for this conversation. Include just the title in plain-text. Do not use Markdown. Make sure you return just one or two sentences",
          history: messages,
          toolId: toolId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate title");
      }

      return data.response;
    } catch (error) {
      console.error("Error generating conversation title:", error);
      return "Untitled Conversation"; // Fallback title
    }
  };
  
  // Fetch available models
  const fetchModels = useCallback(async () => {
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
  }, []);
  
  // Fetch available prompts for the tool
  const fetchPrompts = useCallback(async () => {
    if (!toolId) {
      setPromptError('Tool ID is required');
      return;
    }
    
    setIsLoadingPrompts(true);
    setPromptError(null);
    
    try {
      const response = await fetch(`/api/prompts?tool_id=${toolId}&type=public`);
      
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
  }, [toolId]);

  // Fetch models and prompts when dependencies change
  useEffect(() => {
    if (showModelSelector) {
      fetchModels();
    }
    
    if (showPromptSelector) {
      fetchPrompts();
    }
  }, [showModelSelector, showPromptSelector, fetchModels, fetchPrompts]);

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
      interface RequestBody {
        message: string;
        history?: ConversationMessage[];
        modelId?: string;
        promptId?: string;
        toolId: string;
      }
      
      const requestBody: RequestBody = {
        message: userMessage,
        history: messages.length > 0 ? messages : undefined,
        modelId: showModelSelector && selectedModelId ? selectedModelId : undefined,
        promptId: showPromptSelector && selectedPromptId ? selectedPromptId : undefined,
        toolId: toolId
      };
      
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
    <div className={`flex flex-col w-full max-w-5xl mx-auto ${className}`}>
      <Card>
        {title && <CardHeader title={title} description={description} className="text-lg" />}
        <CardContent>
          <div className="flex flex-col space-y-8 mt-6">
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
                    className={`p-4 ${
                      message.role === "user"
                        ? "dark:bg-slate-700 bg-slate-100 rounded-md"
                        : ""
                    } `}
                  >
                    <p className="text-base font-semibold text-foreground mb-6 border-b-2">
                      {message.role === "user" ? "You" : assistantName}
                    </p>
                    <div className="">
                      {message.role === "assistant" ? (
                        <div className="prose dark:prose-invert">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              pre: ({ children, ...props }) => (
                                <pre className="overflow-auto p-2 rounded" {...props}>
                                  {children}
                                </pre>
                              ),
                              code: ({ children, className, ...props }) => (
                                <code className={`${className || ""} ${!className ? "rounded px-1" : ""}`} {...props}>
                                  {children}
                                </code>
                              )
                            } as Components}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No messages yet</p>
                <p className="text-base mt-3">
                  Type a message to start the conversation
                </p>
              </div>
            )}

            {/* Save conversation UI */}
            {enableSave && messages.length > 0 && (
              <div className="flex flex-col space-y-2">
                {showTitleInput ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={conversationTitle}
                      onChange={(e) => setConversationTitle(e.target.value)}
                      placeholder="Enter conversation title"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      disabled={isSaving}
                    />
                    <Button
                      onClick={async () => {
                        setIsSaving(true);
                        setSaveError(null);
                        setSaveSuccess(false);

                        try {
                          // Generate conversation title
                          const generatedTitle = await generateConversationTitle(messages);

                          const response = await fetch('/api/conversations', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              title: generatedTitle || "Untitled Conversation",
                              messages,
                              toolId: toolId,
                              modelId: selectedModelId || undefined,
                              promptId: selectedPromptId || undefined
                            }),
                          });

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || "Failed to save conversation");
                          }

                          setSaveSuccess(true);
                          setConversationTitle("");
                          setShowTitleInput(false);

                          setTimeout(() => {
                            setSaveSuccess(false);
                          }, 3000);
                        } catch (err) {
                          setSaveError(err instanceof Error ? err.message : "Failed to save conversation");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className="whitespace-nowrap"
                    >
                      {isSaving ? <LoadingSpinner text="Saving..." /> : "Save"}
                    </Button>
                    <Button 
                      onClick={() => setShowTitleInput(false)}
                      disabled={isSaving}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button
                      onClick={async () => {
                        // Generate conversation title
                        const generatedTitle = await generateConversationTitle(messages);
                        setConversationTitle(generatedTitle);
                        setShowTitleInput(true);
                      }}
                      disabled={isSaving}
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <span>Save Conversation</span>
                    </Button>
                  </div>
                )}
                
                {saveError && <ErrorMessage message={saveError} />}
                {saveSuccess && <SuccessMessage message="Conversation saved successfully!" />}
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
                className="min-h-[120px] w-full text-base"
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
