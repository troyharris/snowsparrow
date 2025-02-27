"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Textarea } from "@/components/shared/Textarea";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { SuccessMessage } from "@/components/shared/SuccessMessage";
import { PromptInject } from "@/lib/ai/config/prompts";

export default function PromptInjectForm({ inject }: { inject: PromptInject | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PromptInject>>(
    inject || {
      name: "",
      display_name: "",
      description: "",
      content: "",
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
      const endpoint = "/api/prompt-injects";
      const method = inject ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          inject ? { id: inject.id, ...formData } : formData
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save prompt inject");
      }

      setSuccess("Prompt inject saved successfully");

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/prompt-injects");
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
          Unique identifier used in prompts (e.g., &quot;handbook_text&quot;)
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
          Brief description of what this inject contains
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <Textarea
          name="content"
          value={formData.content || ""}
          onChange={handleChange}
          rows={15}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The content to be injected into prompts
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/prompt-injects")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : inject ? "Update Inject" : "Create Inject"}
        </Button>
      </div>
    </form>
  );
}
