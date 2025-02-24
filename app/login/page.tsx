import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-background border border-border rounded-md p-6 shadow-sm w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-9 font-semibold tracking-tight text-foreground">
            Welcome to Snowsparrow
          </h1>
          <p className="text-muted mt-2 text-foreground leading-relaxed">
            Sign in to access AI tools for education
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@school.edu"
            />
          </div>

          <div className="space-y-1">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full bg-input border border-border rounded-md text-foreground text-sm leading-5 px-3 py-2 transition-all duration-150 ease-in-out focus:border-accent focus:ring-2 focus:ring-ring"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 focus:ring-2 focus:ring-ring"
              formAction={login}
            >
              Sign in
            </button>
            <button
              className="bg-accent hover:bg-border text-accent-foreground font-medium py-2 px-4 rounded-md transition-all duration-150 focus:ring-2 focus:ring-ring"
              formAction={signup}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
