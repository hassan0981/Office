import Link from "next/link";
import { CheckSquare, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-cream-300/70 bg-white/60 backdrop-blur-md py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta-500 text-white shadow-sm">
              <CheckSquare className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-charcoal-900">
                Task<span className="text-terracotta-500">Flow</span>
              </span>
              <p className="text-xs text-charcoal-400">Intelligent Task & Project Management</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-charcoal-600">
            <Link href="/" className="hover:text-terracotta-600 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-terracotta-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-terracotta-600 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-terracotta-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-charcoal-400 flex items-center gap-1">
            <span>© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
