import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Oops!</h1>
        <p className="text-xl text-muted mb-8">
          Sorry, something went wrong. We&apos;re working on fixing it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
