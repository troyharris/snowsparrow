import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function UserAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get initials or first letter of email
  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0].toUpperCase() || "?";

  return (
    <Link
      href="/account"
      className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
    >
      <span className="text-sm font-medium">{initials}</span>
    </Link>
  );
}
