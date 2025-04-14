import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/shared/Card";
import { createClient } from "@/utils/supabase/server";
import ProfileCompletionModal from "@/components/shared/ProfileCompletionModal"; // Import the new modal

import { SupabaseClient } from "@supabase/supabase-js"; // Import SupabaseClient type

async function getTools(supabase: SupabaseClient) { // Accept client as argument
  const { data: tools } = await supabase
    .from("tools")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return tools || [];
}

async function getUserProfile(supabase: SupabaseClient) { // Use SupabaseClient type
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, job_title")
    .eq("id", user.id)
    .single();

  // PGRST116 means no row found, which is okay if profile hasn't been created yet
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching profile:", error.message);
    // Decide how to handle errors, maybe return null or throw
    return null;
  }

  // Return null if no profile found, or the profile data
  return profile || null;
}


export default async function Home() {
  const supabase = await createClient(); // Await here
  // Fetch tools and profile concurrently
  const [tools, profile] = await Promise.all([
    getTools(supabase), // Pass awaited client
    getUserProfile(supabase), // Pass awaited client
  ]);
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Add Google Material Icons */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />

      {/* Conditionally render the modal */}
      {profile !== null && ( // Only render if we successfully checked (even if profile is empty)
        <ProfileCompletionModal
          initialFullName={profile?.full_name ?? null}
          initialJobTitle={profile?.job_title ?? null}
        />
      )}

      {/* Tools Grid Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">
          Available Tools
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href} className="block group">
              <Card className="h-full">
                <CardHeader 
                  title={tool.name} 
                  description={tool.description}
                  icon={tool.icon}
                />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Disclaimer Section */}
      <div className="bg-input py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader
              title="Important AI Usage Guidelines"
              description="Please review these important guidelines for using AI tools in our district."
              icon="info"
            />
            <CardContent>
              <div className="space-y-3 text-muted">
                <p>
                  • Do not share sensitive data or personally identifiable
                  information about students or staff.
                </p>
                <p>
                  • Be aware that AI can sometimes hallucinate or make up
                  information. Always verify important information.
                </p>
                <p>
                  • Follow district guidelines for appropriate AI use in
                  education.
                </p>
                <p className="pt-4">
                  <Link
                    href="https://www.fusd1.org/site/handlers/filedownload.ashx?moduleinstanceid=2513&dataid=52908&FileName=FUSD_AI_Guidance.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    View District AI Guidance Document →
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
