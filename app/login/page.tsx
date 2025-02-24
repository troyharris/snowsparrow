import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome to Snowsparrow</h1>
          <p className="text-muted mt-2">
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
              className="w-full"
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
              className="w-full"
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
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
              formAction={login}
            >
              Sign in
            </button>
            <button
              className="bg-input hover:bg-border text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors"
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
