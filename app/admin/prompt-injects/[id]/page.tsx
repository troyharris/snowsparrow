import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/shared/Card";
import PromptInjectForm from "../PromptInjectForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function EditPromptInjectPage({ params }: Props) {
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

  // Fetch prompt inject if editing
  let inject = null;
  if (id !== "new") {
    const { data, error } = await supabase
      .from("prompt_injects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching prompt inject:", error);
      return <div>Error loading prompt inject</div>;
    }

    inject = data;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {inject ? "Edit Prompt Inject" : "Add New Prompt Inject"}
      </h1>

      <Card>
        <div className="p-6">
          <PromptInjectForm inject={inject} />
        </div>
      </Card>
    </div>
  );
}
