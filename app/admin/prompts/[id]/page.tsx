import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/shared/Card";
import PromptForm from "./PromptForm";

export default async function EditPromptPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email?.endsWith("@schooldistrict.org")) {
    redirect("/");
  }

  // Fetch prompt if editing
  let prompt = null;
  if (params.id !== "new") {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("Error fetching prompt:", error);
      return <div>Error loading prompt</div>;
    }

    prompt = data;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {prompt ? "Edit Prompt" : "Add New Prompt"}
      </h1>

      <Card>
        <div className="p-6">
          <PromptForm prompt={prompt} />
        </div>
      </Card>
    </div>
  );
}
