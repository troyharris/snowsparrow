import type { Metadata } from "next";
//import { Manrope } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Nav from "@/components/shared/Nav";

/*
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});
*/
const montserrat = Montserrat({
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snowsparrow - AI Tools for Education",
  description: "Easy-to-use AI tools for K-12 public school district employees",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} font-sans antialiased min-h-screen text-foreground bg-background`}
      >
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
