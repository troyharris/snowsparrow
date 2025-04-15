import Link from "next/link";
import ClientNav from "./ClientNav";
import UserAvatar from "./UserAvatar";

export default function Nav() {
  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img className="h-8 w-auto" src="/snowsparrow-logo.png" alt="" />
            <span className="text-lg font-semibold text-foreground">
              Snowsparrow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ClientNav />
            <UserAvatar />
          </div>
        </div>
      </div>
    </nav>
  );
}
