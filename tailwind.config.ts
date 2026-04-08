import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        "success-muted": "var(--success-muted)",
        warning: "var(--warning)",
        "warning-muted": "var(--warning-muted)",
        danger: "var(--danger)",
        "danger-muted": "var(--danger-muted)",
        partner: "var(--partner)",
        "partner-muted": "var(--partner-muted)",
        "nav-bg": "var(--nav-bg)",
        "nav-border": "var(--nav-border)",
        "nav-foreground": "var(--nav-foreground)",
        "nav-muted": "var(--nav-muted)",
      },
      borderRadius: {
        lg: "calc(var(--radius) + 3px)",
        md: "var(--radius)",
        sm: "2px",
      },
      boxShadow: {
        sm: "var(--shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
