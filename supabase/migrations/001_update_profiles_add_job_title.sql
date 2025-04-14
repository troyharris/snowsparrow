-- Add job_title column to profiles table
alter table public.profiles
add column job_title text null;

-- Drop username column from profiles table
alter table public.profiles
drop column if exists username;

-- Drop website column from profiles table
alter table public.profiles
drop column if exists website;

-- Optional: Add a comment to the new column for clarity
comment on column public.profiles.job_title is 'User''s job title';
