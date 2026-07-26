# TaskFlow — Production-Ready Task Management System

TaskFlow is a modern, production-ready, full-stack Task Management System built with Next.js 14 (App Router), Supabase Auth, Prisma ORM, Tailwind CSS, and Framer Motion animations. Designed with a warm beige/terracotta aesthetic, TaskFlow provides full CRUD functionality for user tasks backed by dual-layer authorization (Server Actions + Supabase Row Level Security).

---

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router, React 18, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma ORM (with Prisma Migrate)
- **Authentication:** Supabase Auth (`@supabase/ssr`)
- **Styling:** Tailwind CSS + custom shadcn/ui inspired design system
- **Animations:** Framer Motion (staggered cards, modal dialogs, status badges)
- **Form Validation:** Zod + React Hook Form
- **Toasts:** Sonner
- **Icons:** Lucide React

---

## 🛠️ Environment Variables Setup

Copy `.env.example` to `.env` and fill in your Supabase connection strings:

```bash
# Supabase Database Connection
DATABASE_URL="postgresql://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgboiler=true"
DIRECT_URL="postgresql://postgres.[YOUR-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth & Client Keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

---

## ⚙️ Local Development Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client & Run Database Migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Supabase RLS Setup (Optional / SQL Editor)

To apply Row Level Security (RLS) policies and automatic user creation triggers in Supabase:
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run the SQL statements provided in [`supabase/rls_policies.sql`](./supabase/rls_policies.sql).

---

## 📦 Vercel Deployment Checklist

1. Push your code to a GitHub repository.
2. Import the project into **Vercel**.
3. Configure the Environment Variables listed in `.env.example` under Vercel Project Settings.
4. Verify the build command is set to default:
   ```json
   "build": "prisma generate && next build"
   ```
5. Click **Deploy**. Vercel will build and deploy the app with zero errors!
