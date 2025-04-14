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
  const [jobTitle, setJobTitle] = useState<string | null>(null); // Added jobTitle state, removed username/website
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, job_title, avatar_url`) // Fetch job_title instead of username, website
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setJobTitle(data.job_title); // Set jobTitle state
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
    fullname, // Removed username, website
    jobTitle, // Added jobTitle
    avatar_url,
  }: {
    fullname: string | null;
    jobTitle: string | null; // Added jobTitle type
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        job_title: jobTitle, // Update job_title instead of username, website
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
              First name
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

          {/* Replaced Username and Website with Job Title */}
          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="jobTitle"
            >
              Job Title
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle || ""}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              placeholder="Your job title"
            />
          </div>

          <div className="pt-4">
            <button
              className="w-full bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-ring"
              onClick={() =>
                updateProfile({ fullname, jobTitle, avatar_url }) // Pass jobTitle instead of username, website
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
