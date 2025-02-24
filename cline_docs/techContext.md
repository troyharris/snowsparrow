# Technical Context

## Technology Stack

### Frontend

- Next.js 14+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- React Server Components
- Client-side interactivity where needed

### Backend

- Next.js API routes
- Supabase for:
  - PostgreSQL database
  - Authentication
  - File storage
- OpenRouter API integration

### Infrastructure

- Vercel deployment
- GitHub repository
- Environment variables management

## Development Setup

### Required Tools

- Node.js (Latest LTS)
- npm/yarn/pnpm
- Git

### Key Dependencies

- next
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- tailwindcss
- typescript
- eslint
- postcss

### Development Workflow

1. Local development server
2. TypeScript compilation
3. ESLint checking
4. Vercel preview deployments
5. Production deployment

## Technical Constraints

### Performance

- Server-side rendering where possible
- Optimized client-side interactions
- Efficient API calls

### Security

- Authentication required for sensitive operations
- Environment variables protection
- API rate limiting

### Browser Support

- Modern browsers
- Progressive enhancement
- Mobile-first responsive design

## Integration Points

### Supabase

- Authentication system
- Database operations
- File storage system

### OpenRouter

- AI processing
- Mermaid chart generation

### Vercel

- Deployment platform
- Environment configuration
- Edge functions if needed
