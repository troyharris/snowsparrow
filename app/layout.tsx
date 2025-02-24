import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Snowsparrow - AI Tools for Education",
  description: "Easy-to-use AI tools for K-12 public school district employees",
};

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased min-h-screen`}
      >
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <img className="h-8 w-auto" src="/file.svg" alt="" />
                  <span className="text-lg font-semibold text-gray-900">
                    Snowsparrow
                  </span>
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    href="/account"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Account
                  </Link>
                  <Link
                    href="/mermaid"
                    className="bg-accent text-white hover:bg-accent/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Create Flowchart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
