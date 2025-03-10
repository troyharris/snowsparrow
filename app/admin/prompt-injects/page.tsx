import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Card, CardContent } from "@/components/shared/Card";

export default async function PromptInjectsAdminPage() {
  // Create a service role client for database operations
  const supabase = await createClient(true);

  // Fetch prompt injects
  console.log("Admin Prompt Injects Page: Fetching prompt injects");
  try {
    const { data: injects, error } = await supabase.from("prompt_injects").select("*");
    console.log("Admin Prompt Injects Page: Prompt injects fetched", {
      count: injects?.length,
      error,
    });

    if (error) {
      console.error("Admin Prompt Injects Page: Error fetching prompt injects:", error);
      console.error(
        "Admin Prompt Injects Page: Error details:",
        JSON.stringify(error, null, 2)
      );
      return <div>Error loading prompt injects: {JSON.stringify(error)}</div>;
    }

    console.log("Admin Prompt Injects Page: Rendering prompt injects list");
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Prompt Injects</h1>
          <div className="space-x-2">
            <Link href="/admin/prompt-injects/new">
              <Button>Add New Inject</Button>
            </Link>
            <Link href="/admin/prompts">
              <Button variant="outline">Manage Prompts</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {injects.map((inject) => (
            <Card key={inject.id}>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{inject.display_name}</h2>
              </div>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {inject.description}
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Name: <code>{inject.name}</code>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Content Preview: <code>{inject.content.substring(0, 50)}...</code>
                </div>
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/prompt-injects/${inject.id}`}>
                    <Button variant="outline" className="text-sm py-1.5 px-3">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Admin Prompt Injects Page: Unexpected error:", error);
    console.error(
      "Admin Prompt Injects Page: Error details:",
      JSON.stringify(error, null, 2)
    );
    return <div>An unexpected error occurred: {JSON.stringify(error)}</div>;
  }
}
