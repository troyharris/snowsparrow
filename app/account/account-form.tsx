"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Script from 'next/script';

// Global types for window.google are now defined in lib/types/google.types.ts

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  // Function to handle sign out click
  const handleSignOut = () => {
    // Disable Google One Tap auto sign-in to prevent issues after logout
    if (window.google?.accounts?.id) {
      console.log('Disabling Google One Tap auto select.');
      window.google.accounts.id.disableAutoSelect();
    }
    // Form submission will proceed naturally after this handler
  };

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string | null;
    fullname: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      alert("Error updating the data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-background border border-border rounded-md p-6 shadow-sm w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl leading-9 font-semibold tracking-tight text-foreground">
              Account Settings
            </h1>
            <p className="text-muted mt-1 text-foreground leading-relaxed">
              Manage your profile information
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button
              className="bg-accent hover:bg-border text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 focus:ring-2 focus:ring-ring"
              type="submit"
              onClick={handleSignOut} // Correctly placed onClick handler
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Load Google Sign-In client library */}
        <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />

        <div className="space-y-6">
          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              id="email"
              type="text"
              value={user?.email}
              disabled
              className="w-full bg-muted cursor-not-allowed bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="fullName"
            >
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullname || ""}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              placeholder="@username"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="website"
            >
              Website
            </label>
            <input
              id="website"
              type="url"
              value={website || ""}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              placeholder="https://your-website.com"
            />
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-ring"
              onClick={() =>
                updateProfile({ fullname, username, website, avatar_url })
              }
              disabled={loading}
            >
              {loading ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
