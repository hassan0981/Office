import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers, Sparkles, MoveRight, Clock, Star, Users, Check, LayoutDashboard, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative overflow-hidden pt-10 pb-20 sm:pt-20 sm:pb-28">
      {/* Background Subtle Radial Lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta-200/35 blur-[140px]" />
      <div className="pointer-events-none absolute top-3/4 right-5 -z-10 h-[400px] w-[400px] rounded-full bg-sage-200/25 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          {/* Professional Status Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-cream-300 bg-white/90 px-4 py-1.5 text-xs font-semibold text-charcoal-700 shadow-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-terracotta-500" />
            <span>Smart Task & Workflow Management for Teams & Individuals</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-charcoal-900 sm:text-6xl sm:leading-[1.15]">
            Master your workflow with clarity and{" "}
            <span className="text-terracotta-500 underline decoration-terracotta-300 decoration-wavy decoration-2">
              unmatched precision
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-charcoal-500 max-w-2xl mx-auto leading-relaxed font-normal">
            TaskFlow combines intuitive priority scheduling, real-time status tracking, and seamless organization into one beautiful workspace.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {user ? (
              <Link href="/dashboard" id="hero-dashboard-btn">
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow px-8 text-base">
                  Open Workspace <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup" id="hero-signup-btn">
                  <Button size="lg" className="gap-2 shadow-lg hover:shadow-glow px-8 text-base font-semibold">
                    Get Started Free <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" id="hero-login-btn">
                  <Button variant="outline" size="lg" className="px-8 text-base font-medium">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-charcoal-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> Instant Workspace Setup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600 stroke-[3]" /> Enterprise Encryption
            </span>
          </div>
        </div>

        {/* INTERACTIVE DASHBOARD PREVIEW CARD */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-cream-300/90 bg-white/90 p-4 sm:p-6 shadow-warm-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cream-200/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-charcoal-400">TaskFlow — Live Dashboard Preview</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-charcoal-500">
              <Activity className="h-4 w-4 text-terracotta-500" /> Real-time Sync Active
            </div>
          </div>

          {/* Mock Task List Rows */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-cream-50/70 p-4 transition-all hover:bg-cream-100/60">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-500 bg-emerald-500 text-white">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900 line-through">Finalize Q3 Product Roadmap & Strategy</h4>
                  <p className="text-xs text-charcoal-400 mt-0.5">Aligned design sprints and backend milestone targets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800">Done</span>
                <span className="rounded-full bg-terracotta-100 px-2.5 py-0.5 font-semibold text-terracotta-800">High Priority</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-md border border-cream-400 bg-white" />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Review Executive Dashboard Analytics</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">Verify metric accuracy across daily team tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">In Progress</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-semibold text-amber-800">Medium</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-md border border-cream-400 bg-white" />
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Deploy Production Release v2.4</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">Zero downtime deployment with automated health checks</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-cream-200 px-2.5 py-0.5 font-semibold text-charcoal-700">To Do</span>
                <span className="rounded-full bg-sage-100 px-2.5 py-0.5 font-semibold text-sage-800">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* VALUE PROPOSITION GRID */}
        <div className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-charcoal-900 sm:text-4xl tracking-tight">
              Engineered for seamless productivity
            </h2>
            <p className="mt-3 text-base text-charcoal-500">
              Everything you need to capture ideas, prioritize objectives, and track execution without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm transition-all hover:shadow-warm-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta-100 text-terracotta-600 mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">Priority Matrix</h3>
              <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
                Categorize your work into Low, Medium, and High priorities so critical milestones always stay top of mind.
              </p>
            </div>

            <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm transition-all hover:shadow-warm-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-600 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">Isolated Data Protection</h3>
              <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
                Your workspace is strictly private. Strict user scoping ensures total confidentiality across your tasks.
              </p>
            </div>

            <div className="rounded-3xl border border-cream-300 bg-white/80 p-8 shadow-warm backdrop-blur-sm transition-all hover:shadow-warm-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">Schedule & Due Dates</h3>
              <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
                Set target deadlines, filter tasks by due date, and never miss an important project deadline again.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <div className="rounded-3xl border border-cream-300 bg-gradient-to-r from-white/95 to-cream-100/90 p-8 sm:p-12 shadow-warm-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta-500">
                Transform Your Daily Workflow
              </span>
              <h2 className="text-3xl font-extrabold text-charcoal-900 sm:text-4xl">
                Ready to organize your workspace?
              </h2>
              <p className="text-charcoal-500 text-sm leading-relaxed">
                Join thousands of individuals and teams managing their day with TaskFlow.
              </p>
            </div>
            <Link href={user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="whitespace-nowrap gap-2 text-base font-semibold px-8 shadow-lg">
                {user ? "Open Dashboard" : "Get Started Now"} <MoveRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
