import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow — Intelligent Task Management System",
  description:
    "Organize, prioritize, and track your daily tasks effortlessly with TaskFlow's production-ready full-stack task manager.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex min-h-full flex-col font-sans antialiased selection:bg-terracotta-200 selection:text-terracotta-900`}>
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E8DEC9",
              color: "#2D2621",
              borderRadius: "1rem",
              boxShadow: "0 10px 30px -10px rgba(58, 50, 41, 0.12)",
            },
          }}
        />
      </body>
    </html>
  );
}
