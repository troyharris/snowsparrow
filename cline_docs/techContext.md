# Technical Context

## Technology Stack

### Frontend

- Next.js 14+ (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- React Server Components
- Client-side interactivity where needed
- Shared component library:
  - Button, Card components
  - Form components (Select, Textarea)
  - Feedback components (Error, Success, Loading)
  - Component documentation

### Backend

- Next.js API routes
- AI service layer:
  - Model configuration
  - Prompt templates
  - OpenRouter client
- Supabase for:
  - PostgreSQL database
  - Authentication
  - File storage

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
- mermaid (for flowchart rendering)

### Development Workflow

1. Local development server
2. TypeScript compilation
3. ESLint checking
4. Component development
5. API integration
6. Testing (planned)
7. Vercel preview deployments
8. Production deployment

## Technical Constraints

### Performance

- Server-side rendering where possible
- Optimized client-side interactions
- Efficient API calls
- Component reusability
- Modular architecture

### Security

- Authentication required for sensitive operations
- Environment variables protection
- API rate limiting
- Input validation
- Error handling

### Browser Support

- Modern browsers
- Progressive enhancement
- Mobile-first responsive design
- Accessibility compliance

## Integration Points

### Supabase

- Authentication system
- Database operations
- File storage system
- Storage access policies

### AI Services

- OpenRouter integration
- Model configuration
- Prompt templates
- Error handling
- Rate limiting

### Vercel

- Deployment platform
- Environment configuration
- Edge functions if needed
- Performance monitoring
