# Active Context

## Current Focus

- Implementing Mermaid flowchart creation tool
- Building out core application pages
- Refining authentication system
- Implemented middleware to protect all routes
- Adding Supabase storage for saving Mermaid flowcharts

## Recent Changes

- Project initialization with Next.js
- Supabase integration setup
- Basic authentication flow implementation
- Created core application pages:
  - Landing page
  - Login page
  - Account page
  - Error page
  - Mermaid tool page
- Basic styling with Tailwind CSS
- Added PNG download functionality for Mermaid flowcharts
- Implemented storage API route for Mermaid flowcharts:
  - User authentication validation
  - File size limit (5MB)
  - Metadata storage (prompt and mermaid code)
  - Unique file naming with user ID and timestamp

## Active Decisions

- Using App Router for modern Next.js features
- Implementing Supabase auth for user management
- Planning modular architecture for future AI tools
- Component-based structure for maintainability
- Using Supabase storage for saving user-generated flowcharts

## Current Considerations

### Technical

- API route structure for OpenRouter integration
- Storage strategy for generated flowcharts:
  - ✓ Create a 'flowcharts' bucket in Supabase storage
  - ✓ Implement storage API route with metadata
  - Next steps:
    - Add save button to UI
    - Implement client-side storage integration
    - Add loading and error states
    - Test storage functionality
- Authentication flow optimization
- Performance monitoring setup
- Component organization and reusability

### Product

- User interface design for flowchart tool
- Error handling and user feedback
- Download and storage functionality for generated charts
- User onboarding experience
- Consistent styling across pages

## Next Steps

1. Complete Mermaid flowchart creation tool implementation
   - Finish OpenRouter API integration
   - Implement flowchart rendering
   - Add PNG download functionality ✓
   - Add Supabase storage integration:
     - Set up storage bucket
     - Create storage API route
     - Add save button UI
     - Implement save functionality
     - Add success/error feedback
2. Enhance user authentication flow
3. Create comprehensive user dashboard
4. Implement robust error handling
5. Add usage analytics
6. Polish application styling
7. Add comprehensive testing

## Open Questions

- Best practices for rate limiting OpenRouter API calls
- Storage strategy for user-generated content
- Metrics for measuring tool effectiveness
- Testing strategy for AI-generated content
