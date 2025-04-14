"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/shared/Button"; // Assuming Button component exists

interface ProfileCompletionModalProps {
  initialFullName: string | null;
  initialJobTitle: string | null;
}

export default function ProfileCompletionModal({
  initialFullName,
  initialJobTitle,
}: ProfileCompletionModalProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [jobTitle, setJobTitle] = useState(initialJobTitle ?? "");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID on mount
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, [supabase]);

  // Check if modal should open
  useEffect(() => {
    // Only open if we have a user ID and profile data is missing
    if (userId && (!initialFullName || !initialJobTitle)) {
      setIsOpen(true);
    }
  }, [userId, initialFullName, initialJobTitle]);

  const handleSave = async () => {
    if (!userId) {
      alert("Error: User not identified.");
      return;
    }
    if (!fullName.trim() || !jobTitle.trim()) {
      alert("Please enter both your first name and job title.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim(),
        job_title: jobTitle.trim(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      alert("Profile updated successfully!");
      setIsOpen(false); // Close modal on success
    } catch (error) {
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null; // Don't render anything if the modal shouldn't be open
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Please provide your first name and job title to personalize your experience.
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="modalFullName"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Full Name
            </label>
            <input
              id="modalFullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label
              htmlFor="modalJobTitle"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Job Title
            </label>
            <input
              id="modalJobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-input border border-border rounded-md text-foreground text-sm px-3 py-2 focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Your job title"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading || !fullName.trim() || !jobTitle.trim()}
            variant="primary" // Assuming a primary variant exists
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
