import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Background colors
    "bg-background",
    "bg-foreground",
    "bg-muted",
    "bg-accent",
    "bg-accent-foreground",
    "bg-accent-hover",
    "bg-accent/20",

    // Text colors
    "text-background",
    "text-foreground",
    "text-muted",
    "text-muted-foreground",
    "text-accent",
    "text-accent-foreground",

    // Border colors
    "border-border",
    "border-input",
    "border-accent",

    // Ring color
    "ring-ring",

    // Border radius
    "rounded-radius",

    // Variants
    "hover:bg-accent",
    "hover:bg-accent-hover",
    "focus:ring-ring",

    // Margins
    "mt-3",
    "mb-3",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        "accent-hover": "var(--accent-hover)",
        ring: "var(--ring)",
      },
      borderRadius: {
        radius: "var(--radius)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
