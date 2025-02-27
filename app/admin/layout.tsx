import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/shared";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First create a regular client to check authentication
  const regularClient = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await regularClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin by querying the profiles table
  const { data: profile } = await regularClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
