import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center sm:text-left max-w-3xl">
          <h1 className="text-3xl leading-10 font-bold tracking-tight text-foreground sm:text-5xl">
            AI Tools for Education,{" "}
            <span className="text-accent">Made Simple</span>
          </h1>
          <p className="text-xl text-foreground mb-8 leading-relaxed">
            Streamline your workflow with easy-to-use AI tools designed
            specifically for K-12 school district staff. No technical expertise
            required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
            <Link
              href="/mermaid"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Flowchart
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-input text-foreground font-medium rounded-lg hover:bg-border transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="bg-input py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-md p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-foreground leading-8">
                Flowchart Creator
              </h3>
              <p className="text-muted">
                Transform text descriptions into professional flowcharts
                instantly. Perfect for documenting processes and procedures.
              </p>
            </div>
            <div className="bg-background border border-border rounded-md p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-foreground leading-8">
                Easy to Use
              </h3>
              <p className="text-muted">
                No complex setup or training needed. Just describe what you
                want, and let AI do the work.
              </p>
            </div>
            <div className="bg-background border border-border rounded-md p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2 text-foreground leading-8">
                More Coming Soon
              </h3>
              <p className="text-muted">
                We are building more AI tools to help streamline your work. Stay
                tuned for updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
