"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckSquare, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface NavbarProps {
  user?: {
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const res = await logoutAction();
    setIsLoggingOut(false);
    if (res?.success) {
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    }
  };

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-300/60 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-500 text-white shadow-md shadow-terracotta-500/20"
          >
            <CheckSquare className="h-5 w-5 stroke-[2.5]" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-charcoal-900">
            Task<span className="text-terracotta-500">Flow</span>
          </span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant={pathname === "/dashboard" ? "default" : "outline"}
                  size="sm"
                  className="gap-2 font-medium"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-100/70 px-3 py-1.5 text-xs text-charcoal-800">
                <User className="h-3.5 w-3.5 text-terracotta-500" />
                <span className="font-semibold">{userName}</span>
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="gap-2 text-charcoal-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="font-semibold">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
