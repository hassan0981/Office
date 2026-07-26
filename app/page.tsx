import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative overflow-hidden pt-8 pb-20 sm:pt-16 sm:pb-28">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta-200/40 blur-[120px]" />
      <div className="pointer-events-none absolute top-2/3 right-10 -z-10 h-[350px] w-[350px] rounded-full bg-sage-200/30 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Banner Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-white/80 px-4 py-1.5 text-xs font-semibold text-charcoal-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-terracotta-500" />
            <span>Built with Next.js 14, Supabase & Prisma</span>
          </div>
        </div>

        {/* Main Hero Header */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-charcoal-900 sm:text-6xl sm:leading-tight">
            Streamline your productivity with{" "}
            <span className="text-terracotta-500 underline decoration-terracotta-300 decoration-wavy decoration-2">
              TaskFlow
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-charcoal-500 max-w-2xl mx-auto leading-relaxed">
            The elegant, warm-toned task management system designed to keep your projects organized with priority tracking, drag-and-drop status flow, and real-time security.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard" id="hero-dashboard-btn">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow">
                  Go to Your Dashboard <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" id="hero-signup-btn">
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow">
                    Start for Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" id="hero-login-btn">
                  <Button variant="outline" size="lg">
                    Sign In to Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Showcase Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-100 text-terracotta-600 mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900">Instant CRUD Operations</h3>
            <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
              Create, filter, sort, and update your tasks seamlessly using server actions with zero page reloads.
            </p>
          </div>

          <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-600 mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900">Dual-Layer Security</h3>
            <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
              Protected both at the application layer with Prisma queries and at the database layer with Supabase Row Level Security (RLS).
            </p>
          </div>

          <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-charcoal-900">Tailored Beige Aesthetic</h3>
            <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
              Warm cream palettes, terracotta accents, soft charcoal typography, and Framer Motion micro-animations.
            </p>
          </div>
        </div>

        {/* Interactive Mockup Banner */}
        <div className="mt-20 rounded-3xl border border-cream-300 bg-white/90 p-8 shadow-warm-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta-500">
                Ready to organize your day?
              </span>
              <h2 className="text-3xl font-extrabold text-charcoal-900">
                Experience TaskFlow today.
              </h2>
              <p className="text-charcoal-500 text-sm">
                Get started in under 30 seconds with email authentication or instant social login.
              </p>
            </div>
            <Link href={user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="whitespace-nowrap gap-2">
                {user ? "Open Dashboard" : "Create Account Now"} <MoveRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
