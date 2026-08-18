import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = {
  title: "gnani Call Copilot",
  description: "Internal CCW follow-up workflow",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><AppShell>{children}</AppShell><Toaster theme="dark" position="bottom-right" /></body></html>; }
