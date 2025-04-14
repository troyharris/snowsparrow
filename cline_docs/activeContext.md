## Current Work Focus

Testing recent features: dynamic prompt injection and profile completion modal.

## Recent Changes

- Modified `middleware.ts` to remove the blanket bypass for `/api/` and `/auth/callback`.
- Implemented authentication checks in all API routes using the `isAuthenticated` function.
- Added validation for the `next` parameter in `app/auth/callback/route.ts` to prevent open redirect vulnerabilities.
- Created a specific list of public paths in middleware that don't require authentication.
- Fixed a foreign key constraint issue in prompt deletion functionality.
- Fixed a potential crash on the login page (`app/login/page.tsx`) by wrapping `decodeURIComponent` calls.
- Corrected the nonce generation logic in `app/api/nonce/route.ts`.
- **Implemented dynamic profile data injection in `app/api/chat/route.ts`:**
  - Fetches `full_name` and `job_title` for the authenticated user.
  - Substitutes `{{fullName}}` and `{{jobTitle}}` placeholders in the final prompt content *after* static injects are processed.
  - Uses separate Supabase clients (standard vs. service role) for appropriate table access.
- **Implemented profile completion modal on root page (`/`):**
  - Modified `app/page.tsx` to fetch user profile (`fullName`, `jobTitle`) server-side.
  - Created `components/shared/ProfileCompletionModal.tsx` client component.
  - Modal appears if `fullName` or `jobTitle` is missing for the logged-in user.
  - Modal allows users to input and save missing profile information using client-side Supabase update.

## Next Steps

- Test the authentication flow thoroughly.
- Verify Google One Tap authentication.
- Test the new dynamic prompt injection with profile data.
- **Test the new profile completion modal functionality.**
- Update relevant prompts/injects to use `{{fullName}}` and `{{jobTitle}}` placeholders where needed.

## Active Decisions and Considerations

- Nonce generation on server-side.
- Whitelist approach for public paths in middleware.
- Prompt deletion requires updating related conversations first.
- **Dynamic profile injection pattern:** Fetch user data in the API route and substitute placeholders (`{{...}}`) after static inject processing via `processPrompt`. This keeps static and dynamic injection separate.
