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
  - Database-driven model configuration
  - Database-driven prompt management
  - Prompt templates
  - Prompt injects for reusable components
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

## Database Schema

### Core Tables

- `tools`: Application tools configuration
  - `id`: UUID
  - `name`: String
  - `description`: Text
  - `icon`: String (Material Icon name)
  - `href`: String (URL path)
  - `sort_order`: Integer
  - `is_active`: Boolean
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- `profiles`: User profiles with admin flag
  - `id`: UUID (linked to auth.users)
  - `email`: String
  - `is_admin`: Boolean
  - `created_at`: Timestamp

- `models`: AI model configurations
  - `id`: UUID
  - `name`: String (unique identifier)
  - `display_name`: String
  - `provider`: String
  - `context_length`: Integer
  - `description`: Text
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- `prompts`: System prompts for AI tools
  - `id`: UUID
  - `name`: String (unique identifier)
  - `display_name`: String
  - `description`: Text
  - `content`: Text
  - `tool_name`: String
  - `type`: Enum ('system', 'public', 'user')
  - `user_id`: UUID (nullable)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- `prompt_injects`: Reusable prompt components
  - `id`: UUID
  - `name`: String (unique identifier)
  - `display_name`: String
  - `description`: Text
  - `content`: Text
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- `prompt_inject_links`: Links between prompts and injects
  - `id`: UUID
  - `prompt_id`: UUID (foreign key to prompts)
  - `inject_id`: UUID (foreign key to prompt_injects)
  - `created_at`: Timestamp

## Integration Points

### Supabase

- Authentication system
- Database operations
  - Row-level security policies
  - Service role access for admin operations
  - Enhanced client with role selection
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
