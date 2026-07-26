# Antigravity Build Prompt — TaskFlow (Task Management System)

Copy everything below into Antigravity as your project prompt.

---

## Project Overview

Build a **production-ready, full-stack Task Management System** called **"TaskFlow"** using:

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma (with Prisma Migrate for schema migrations)
- **Auth:** Supabase Auth (email/password + optional Google OAuth), integrated via `@supabase/ssr` for Next.js App Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **Deployment target:** Vercel (must build with zero errors, zero warnings that break the build)
- **Package manager:** npm

The app must be fully functional, visually polished, and deployable immediately after `git push` with no manual fixes required.

---

## 1. Core Functionality (Data Flow)

Implement full CRUD for tasks, scoped per authenticated user:

- **Create** a task (title, description, priority, due date, status)
- **Read** — dashboard listing all tasks for the logged-in user, with filtering (by status: To Do / In Progress / Done, and by priority: Low / Medium / High) and sorting (by due date, priority, created date)
- **Update** — edit task fields inline or via a modal/drawer; toggle status via drag-drop or a status dropdown
- **Delete** — with a confirmation dialog before removal

Each task belongs to exactly one user (`userId` foreign key). Users must only ever see and modify their own tasks — enforce this both in Prisma queries AND with Supabase Row Level Security (RLS) policies as a second layer of defense.

---

## 2. Database Schema (Prisma)

Create a `prisma/schema.prisma` using PostgreSQL (Supabase connection string), and generate the initial migration with Prisma Migrate.

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  tasks     Task[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  status      Status   @default(TODO)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Status {
  TODO
  IN_PROGRESS
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

Notes for Antigravity:
- Set up two env vars: `DATABASE_URL` (pooled, for the app) and `DIRECT_URL` (direct connection, for migrations) since Supabase requires connection pooling via PgBouncer — configure `datasource db` in `schema.prisma` with both `url` and `directUrl`.
- Sync `User.id` with Supabase's `auth.users.id` (use the Supabase auth UID as the Prisma `User.id`, not a separate auto-generated one) so there's a single source of truth for identity.
- Add a Postgres trigger or a Next.js server action that creates a matching `User` row in the Prisma-managed table right after Supabase Auth sign-up (handle both to be safe).

---

## 3. Authentication

- Use **Supabase Auth** with `@supabase/ssr` for cookie-based session handling in the App Router (middleware + server components + client components all correctly wired).
- Support:
  - Email/password sign-up and login
  - Google OAuth login (optional but include the button and config; if credentials aren't available, gracefully disable it rather than breaking the build)
  - Password reset flow
  - Logout
- Protect all `/dashboard/*` routes with middleware — unauthenticated users get redirected to `/login`.
- Show a loading state during session checks (no flash of unauthenticated content).
- After login, redirect to `/dashboard`.

---

## 4. Pages & Routes

- `/` — Landing page: brief hero section explaining TaskFlow, with "Get Started" / "Login" CTAs
- `/login` — Login form
- `/signup` — Sign-up form
- `/dashboard` — Main task board/list (protected)
- `/dashboard/tasks/[id]` — Optional task detail view (protected)

---

## 5. UI/UX Requirements

**Theme:** Warm **beige/cream base palette** with a bright accent color for good contrast and visual interest — do NOT make it flat or muddy. Suggested palette:

- Background: warm beige/cream (`#F5F1E8`, `#FAF6EF`)
- Cards/surfaces: slightly lighter warm white with soft shadow
- Primary accent: a bright, energetic color that pops against beige — e.g., **coral/terracotta** (`#FF6B4A`) or **emerald green** (`#2E7D5B`) for primary actions and status highlights
- Secondary accent: muted gold or sage green for tags/priority badges
- Text: warm dark brown/charcoal (`#3A3229`) instead of pure black, for a softer look
- Status colors: To Do (neutral gray-beige), In Progress (amber/gold), Done (green)
- Priority colors: Low (sage), Medium (amber), High (coral/red)

**Design requirements:**
- Clean, modern, minimal — generous whitespace, rounded corners (`rounded-xl`/`rounded-2xl`), soft shadows, no clutter
- Responsive (mobile-first, works cleanly on phone/tablet/desktop)
- Use shadcn/ui components (Button, Card, Dialog, Dropdown, Input, Badge, Toast) styled to match the beige theme via Tailwind config, not default shadcn colors
- Typography: a clean sans-serif (e.g., Inter or Geist) with clear hierarchy

**Animations** (use Framer Motion):
- Smooth page transitions
- Task cards animate in on load (staggered fade/slide-up)
- Task creation: new card animates in
- Task deletion: card animates out before removal
- Status change: subtle color transition + micro-bounce
- Hover states on buttons/cards (scale/shadow lift)
- Toast notifications slide in for success/error feedback (create, update, delete, auth actions)
- Loading skeletons (not spinners) while data fetches

---

## 6. Technical / Production Requirements

- **TypeScript strict mode** — no `any` left unresolved, no type errors
- **Server Actions** for mutations (create/update/delete tasks) instead of separate API routes where possible, for simplicity and performance
- **Form validation** with `zod` + `react-hook-form`
- **Error handling** — try/catch on all server actions and DB calls, user-facing error toasts, no unhandled promise rejections
- **Environment variables** — provide a `.env.example` listing:
  ```
  DATABASE_URL=
  DIRECT_URL=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- **No hardcoded secrets** anywhere in the codebase
- **`npm run build` must succeed with zero errors** — verify this before considering the task done. Run the build locally as a final check.
- **ESLint** configured and passing (no blocking errors)
- **Prisma Client generation** must be wired into the build script (`"build": "prisma generate && next build"`) so Vercel builds don't fail due to a missing generated client
- **README.md** including:
  - Project description
  - Tech stack
  - Setup instructions (clone, install, env vars, `npx prisma migrate dev`, run dev server)
  - Deployment instructions for Vercel (env vars to set, build command)
- **Folder structure** should be clean and conventional (`app/`, `components/`, `lib/`, `prisma/`, `types/`)
- Include a `.gitignore` that excludes `.env`, `node_modules`, `.next`, etc.

---

## 7. Deployment Checklist (must confirm before finishing)

1. `npm run build` completes with no errors
2. Prisma migrations are committed to `prisma/migrations/`
3. All environment variables are documented in `.env.example`
4. Supabase RLS policies are included as SQL (either in a `supabase/` folder or documented in the README) so they can be applied in the Supabase dashboard
5. No console errors in the browser on any page
6. Auth flow tested end-to-end: sign up → verify session → create task → edit task → delete task → logout
7. Confirm the app works with Vercel's default settings (Node runtime, no unsupported native dependencies)

---

## 8. Deliverable

A complete, working Next.js project I can:
1. Push directly to a GitHub repository
2. Import into Vercel
3. Set the environment variables listed above
4. Deploy with zero build errors and a fully working, animated, beige-themed Task Management System with authentication and full CRUD.

Please build this now, step by step, and double-check that the build passes before finishing.