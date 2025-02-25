"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { Card, CardContent, CardHeader } from "./Card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  apiEndpoint: string;
  title?: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiEndpoint,
  title = "Chat",
  description,
  placeholder = "Type your message here...",
  className = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assistantName = "Snowsparrow";

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
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
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
            {/* Message history */}
            {messages.length > 0 ? (
              <div className="space-y-6 mb-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-accent-hover dark:bg-accent-hover ml-auto"
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
