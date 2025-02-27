"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Textarea } from "@/components/shared/Textarea";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { Select } from "@/components/shared/Select";

import { PromptInject } from "@/lib/ai/config/prompts";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  content: string;
  tool_name: string;
  tool_id: string | null;
  type: "system" | "public" | "user";
}

interface PromptWithInjects extends Prompt {
  injects: PromptInject[];
  selectedInjectIds: string[];
}

export default function PromptForm({ prompt }: { prompt: Prompt | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PromptWithInjects>>(
    prompt ? 
    {
      ...prompt,
      injects: [],
      selectedInjectIds: []
    } : 
    {
      name: "",
      display_name: "",
      description: "",
      content: "",
      tool_name: "",
      tool_id: null,
      type: "system",
      injects: [],
      selectedInjectIds: []
    }
  );

  const [availableInjects, setAvailableInjects] = useState<PromptInject[]>([]);
  const [isLoadingInjects, setIsLoadingInjects] = useState(false);
  const [linkedInjects, setLinkedInjects] = useState<PromptInject[]>([]);
  const [isLoadingLinkedInjects, setIsLoadingLinkedInjects] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  
  // Fetch all available tools
  useEffect(() => {
    const fetchTools = async () => {
      setIsLoadingTools(true);
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        const data = await response.json();
        setTools(data.tools || []);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError((err as Error).message);
      } finally {
        setIsLoadingTools(false);
      }
    };
    
    fetchTools();
  }, []);
  
  // Fetch all available injects
  useEffect(() => {
    const fetchInjects = async () => {
      if (!prompt) return; // Only fetch for existing prompts
      
      setIsLoadingInjects(true);
      try {
        const response = await fetch('/api/prompt-injects');
        if (!response.ok) {
          throw new Error('Failed to fetch prompt injects');
        }
        const data = await response.json();
        setAvailableInjects(data.injects || []);
      } catch (err) {
        console.error('Error fetching prompt injects:', err);
      } finally {
        setIsLoadingInjects(false);
      }
    };
    
    fetchInjects();
  }, [prompt]);
  
  // Fetch injects linked to this prompt
  useEffect(() => {
    const fetchLinkedInjects = async () => {
      if (!prompt?.id) return; // Only fetch for existing prompts
      
      setIsLoadingLinkedInjects(true);
      try {
        const response = await fetch(`/api/prompt-injects?prompt_id=${prompt.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch linked prompt injects');
        }
        const data = await response.json();
        setLinkedInjects(data.injects || []);
      } catch (err) {
        console.error('Error fetching linked prompt injects:', err);
      } finally {
        setIsLoadingLinkedInjects(false);
      }
    };
    
    fetchLinkedInjects();
  }, [prompt?.id]);
  
  // Link an inject to this prompt
  const linkInject = async (injectId: string) => {
    if (!prompt?.id) return;
    
    try {
      const response = await fetch('/api/prompt-inject-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: prompt.id,
          inject_id: injectId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to link prompt inject');
      }
      
      // Refresh linked injects
      const updatedResponse = await fetch(`/api/prompt-injects?prompt_id=${prompt.id}`);
      const data = await updatedResponse.json();
      setLinkedInjects(data.injects || []);
    } catch (err) {
      console.error('Error linking prompt inject:', err);
      setError((err as Error).message);
    }
  };
  
  // Unlink an inject from this prompt
  const unlinkInject = async (injectId: string) => {
    if (!prompt?.id) return;
    
    try {
      const response = await fetch(`/api/prompt-inject-links?prompt_id=${prompt.id}&inject_id=${injectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unlink prompt inject');
      }
      
      // Refresh linked injects
      const updatedResponse = await fetch(`/api/prompt-injects?prompt_id=${prompt.id}`);
      const data = await updatedResponse.json();
      setLinkedInjects(data.injects || []);
    } catch (err) {
      console.error('Error unlinking prompt inject:', err);
      setError((err as Error).message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = "/api/prompts";
      const method = prompt ? "PUT" : "POST";

      // Extract only the fields that belong to the prompts table
      const promptData = {
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        content: formData.content,
        tool_name: formData.tool_name,
        tool_id: formData.tool_id,
        type: formData.type
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          prompt ? { id: prompt.id, ...promptData } : promptData
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save prompt");
      }

      setSuccess("Prompt saved successfully");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/prompts");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <div>
        <label className="block text-sm font-medium mb-1">
          Name (Internal ID)
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier used in code (e.g., $quot;mermaid_default$quot;)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Display Name</label>
        <input
          type="text"
          name="display_name"
          value={formData.display_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          User-friendly name shown in UI
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          Brief description of what this prompt does
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tool</label>
        {isLoadingTools ? (
          <p className="text-sm text-gray-500">Loading tools...</p>
        ) : (
          <select
            name="tool_id"
            value={formData.tool_id || ""}
            onChange={(e) => {
              const selectedTool = tools.find(tool => tool.id === e.target.value);
              setFormData(prev => ({
                ...prev,
                tool_id: e.target.value,
                // Set tool_name for backward compatibility
                tool_name: selectedTool ? selectedTool.name : prev.tool_name
              }));
            }}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a tool</option>
            {tools.map(tool => (
              <option key={tool.id} value={tool.id}>
                {tool.name} - {tool.description}
              </option>
            ))}
          </select>
        )}
        <p className="text-xs text-gray-500 mt-1">
          The tool this prompt is associated with
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tool Name (Legacy)</label>
        <input
          type="text"
          name="tool_name"
          value={formData.tool_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded bg-gray-50"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Legacy field - will be auto-populated when selecting a tool above
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          name="type"
          value={formData.type || "system"}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="system">System</option>
          <option value="public">Public</option>
          <option value="user">User</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          System: Used by the application, Public: Available to all users, User:
          Created by a specific user
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Prompt Injects
        </label>
        <div className="border rounded p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Injects are reusable text snippets that can be included in multiple prompts.
            Use the format {"{{INJECT:name}}"} in your prompt content to include an inject.
          </p>
          
          {!prompt?.id ? (
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm text-gray-600">
                Prompt injects management will be available after saving the prompt.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Linked Injects</h3>
              {isLoadingLinkedInjects ? (
                <p className="text-sm text-gray-500">Loading linked injects...</p>
              ) : linkedInjects.length === 0 ? (
                <p className="text-sm text-gray-500">No injects linked to this prompt.</p>
              ) : (
                <div className="space-y-2">
                  {linkedInjects.map(inject => (
                    <div key={inject.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{inject.display_name}</p>
                        <p className="text-xs text-gray-500">
                          <code>{"{{INJECT:" + inject.name + "}}"}</code>
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="text-xs py-1 px-2 text-red-600 hover:bg-red-50"
                        onClick={() => unlinkInject(inject.id)}
                      >
                        Unlink
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <h3 className="text-sm font-medium mt-4">Available Injects</h3>
              {isLoadingInjects ? (
                <p className="text-sm text-gray-500">Loading available injects...</p>
              ) : availableInjects.length === 0 ? (
                <p className="text-sm text-gray-500">No injects available.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableInjects
                    .filter(inject => !linkedInjects.some(linked => linked.id === inject.id))
                    .map(inject => (
                      <div key={inject.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{inject.display_name}</p>
                          <p className="text-xs text-gray-500">{inject.description}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="text-xs py-1 px-2 text-blue-600 hover:bg-blue-50"
                          onClick={() => linkInject(inject.id)}
                        >
                          Link
                        </Button>
                      </div>
                    ))}
                </div>
              )}
              
              <div className="flex justify-end mt-2">
                <Link href="/admin/prompt-injects/new" className="text-sm text-blue-600 hover:underline">
                  Create new inject
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <Textarea
          name="content"
          value={formData.content || ""}
          onChange={handleChange}
          rows={10}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The prompt content. Use {"{{INJECT:name}}"} to include content from a prompt inject.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/prompts")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : prompt ? "Update Prompt" : "Create Prompt"}
        </Button>
      </div>
    </form>
  );
}
