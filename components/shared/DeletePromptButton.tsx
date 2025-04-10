"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/shared/Button";

interface DeletePromptButtonProps {
  id: string;
}

export function DeletePromptButton({ id }: DeletePromptButtonProps) {
  async function handleDelete(id: string) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to delete prompts.");
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        alert("Failed to check admin status.");
        return;
      }

      if (!profile?.is_admin) {
        alert("You must be an admin to delete prompts.");
        return;
      }

      // Use the API endpoint which has service role permissions
      const response = await fetch(`/api/prompts?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Error deleting prompt:", result.error);
        alert(`Failed to delete prompt: ${result.error}`);
      } else {
        alert("Prompt deleted successfully");
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.error("Unexpected error deleting prompt:", error);
      alert("Unexpected error deleting prompt.");
    }
  }

  return (
    <Button
      className="text-sm py-1.5 px-3 bg-red-500 text-white hover:bg-red-700"
      onClick={() => handleDelete(id)}
    >
      Delete
    </Button>
  );
}
