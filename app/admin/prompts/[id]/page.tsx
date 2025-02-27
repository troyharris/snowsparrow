import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/shared/Card";
import PromptForm from "./PromptForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditPromptPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin by querying the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  // Fetch prompt if editing
  let prompt = null;
  if (id !== "new") {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
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
