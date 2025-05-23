import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card, CardContent } from "@/components/shared/Card";
import { DeletePromptButton } from "@/components/shared/DeletePromptButton";

export default async function PromptsAdminPage() {
  // Create a service role client for database operations
  const supabase = await createClient(true);

  // Fetch prompts
  console.log("Admin Prompts Page: Fetching prompts");
  try {
    const { data: prompts, error } = await supabase.from("prompts").select("*");
    console.log("Admin Prompts Page: Prompts fetched", {
      count: prompts?.length,
      error,
    });

    if (error) {
      console.error("Admin Prompts Page: Error fetching prompts:", error);
      console.error(
        "Admin Prompts Page: Error details:",
        JSON.stringify(error, null, 2)
      );
      return <div>Error loading prompts: {JSON.stringify(error)}</div>;
    }

    console.log("Admin Prompts Page: Rendering prompts list");
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Prompts</h1>
          <div className="space-x-2">
            <Link href="/admin/prompts/new">
              <Button>Add New Prompt</Button>
            </Link>
            <Link href="/admin/prompt-injects">
              <Button variant="outline">Manage Injects</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id}>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{prompt.display_name}</h2>
                <div className="flex space-x-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {prompt.tool_name}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    {prompt.type}
                  </span>
                </div>
              </div>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {prompt.description}
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Name: <code>{prompt.name}</code>
                </div>
                {prompt.filepath && (
                  <div className="text-xs text-gray-500 mb-4">
                    File: <code>{prompt.filepath}</code>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/prompts/${prompt.id}`}>
                    <Button variant="outline" className="text-sm py-1.5 px-3">
                      Edit
                    </Button>
                  </Link>
                  <DeletePromptButton id={prompt.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Admin Prompts Page: Unexpected error:", error);
    console.error(
      "Admin Prompts Page: Error details:",
      JSON.stringify(error, null, 2)
    );
    return <div>An unexpected error occurred: {JSON.stringify(error)}</div>;
  }
}
