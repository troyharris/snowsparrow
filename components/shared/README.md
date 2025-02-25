# Shared Components

This directory contains reusable UI components that are shared across the application.

## Components

### Button

A customizable button component with different variants and states.

```tsx
<Button
  variant="primary" // "primary" | "secondary" | "outline"
  fullWidth={false} // boolean
  disabled={false} // boolean
  onClick={() => {}} // function
>
  Button Text
</Button>
```

### Card

A container component with optional header and content sections.

```tsx
<Card>
  <CardHeader title="Card Title" description="Optional description" />
  <CardContent>Card content goes here</CardContent>
</Card>
```

### ChatInterface

A reusable chat interface component for AI-powered tools.

```tsx
<ChatInterface
  apiEndpoint="/api/endpoint" // API endpoint to send messages to
  title="Chat Title" // Optional title for the chat card
  description="Description text" // Optional description
  placeholder="Type your message..." // Optional placeholder for the input
  className="optional-classes" // Optional additional classes
/>
```

### ErrorMessage

A component for displaying error messages with a consistent style.

```tsx
<ErrorMessage message="Error message here" className="optional-classes" />
```

### LoadingSpinner

A loading indicator with optional text.

```tsx
<LoadingSpinner text="Loading..." className="optional-classes" />
```

### Select

A styled select dropdown component.

```tsx
<Select
  label="Label Text"
  value={value}
  onChange={handleChange}
  fullWidth={false}
  options={[
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]}
/>
```

### SuccessMessage

A component for displaying success messages with a consistent style.

```tsx
<SuccessMessage message="Success message here" className="optional-classes" />
```

### Textarea

A styled textarea component with optional label and error state.

```tsx
<Textarea
  label="Label Text"
  value={value}
  onChange={handleChange}
  fullWidth={false}
  error="Optional error message"
  placeholder="Placeholder text"
/>
```

## Usage

Import components from the shared directory:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  ChatInterface,
  ErrorMessage,
  LoadingSpinner,
  Select,
  SuccessMessage,
  Textarea,
} from "@/components/shared";
```

All components are designed to work with Tailwind CSS and follow the project's theme configuration.
