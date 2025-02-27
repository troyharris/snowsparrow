"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Textarea } from "@/components/shared/Textarea";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  content: string;
  filepath: string | null;
  tool_name: string;
  type: "system" | "public" | "user";
}

export default function PromptForm({ prompt }: { prompt: Prompt | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Prompt>>(
    prompt || {
      name: "",
      display_name: "",
      description: "",
      content: "",
      filepath: "",
      tool_name: "",
      type: "system",
    }
  );

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

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          prompt ? { id: prompt.id, ...formData } : formData
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
          Unique identifier used in code (e.g., "mermaid_default")
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
        <label className="block text-sm font-medium mb-1">Tool Name</label>
        <input
          type="text"
          name="tool_name"
          value={formData.tool_name || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The tool this prompt is for (e.g., "mermaid", "handbook")
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
          File Path (Optional)
        </label>
        <input
          type="text"
          name="filepath"
          value={formData.filepath || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to a file whose content should be injected into the prompt (e.g.,
          "lib/ai/data/handbook.txt")
        </p>
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
          The prompt content. Use {"{{FILE_CONTENT}}"} to indicate where file
          content should be injected.
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
