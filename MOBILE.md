# Antigravity Build Prompt — TaskFlow Mobile (React Native + Expo)

**Create this inside the `mobile/` folder of my existing TaskFlow repo, as an independent Expo project with its own `package.json` — do NOT merge its dependencies or build config with the Next.js web app.** It's a separate toolchain living in the same repo for submission purposes only.

Minimum working Android version of TaskFlow, reusing the same Supabase backend (same database, same `auth.users` and `Task` table) — no new backend needed.

---

## Project Overview

- **Framework:** React Native with **Expo** (managed workflow, use Expo Router for navigation)
- **Language:** TypeScript
- **Backend:** Same Supabase project as the TaskFlow web app — reuse the existing `Task` table and Supabase Auth directly (no Prisma needed here; the mobile app talks to Supabase directly via the JS client, same tables the web app already uses)
- **Goal:** A minimum working Android app — functional and explainable, not visually elaborate. Simple, clean UI is enough.

---

## 1. Core Functionality

- **Auth:** Login screen (email + password) and Sign-up screen, using `@supabase/supabase-js` directly (`supabase.auth.signInWithPassword`, `supabase.auth.signUp`)
- **Session persistence:** Configure the Supabase client with an AsyncStorage-based storage adapter (`@react-native-async-storage/async-storage`) so the user stays logged in between app opens
- **Task list screen:** Fetch and display the logged-in user's tasks (`supabase.from('Task').select('*').eq('userId', session.user.id)`), showing title, status, priority
- **Add task:** Simple form/modal — title, priority dropdown, optional due date — inserts a new row
- **Update task:** Tap a task to toggle status (To Do → In Progress → Done) or open a simple edit screen
- **Delete task:** Swipe-to-delete or a delete button with a confirmation alert
- **Logout button**

Keep navigation minimal: Login/Signup stack → Task List screen → (optional) Task Detail/Edit screen. Use Expo Router's file-based routing.

---

## 2. Technical Requirements

- `npx create-expo-app` as the starting point, TypeScript template
- Install: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `expo-router`
- Store Supabase URL and anon key in a `.env` file loaded via `expo-constants` / `app.config.ts` (never hardcode keys directly in source — use environment config so they can be swapped safely)
- Basic loading and error states on every screen (no silent failures)
- App must run via `npx expo start` and be testable in Expo Go on an Android phone, or built to an installable `.apk` via `eas build -p android --profile preview` if the user wants an actual installable file
- Keep styling simple (`StyleSheet` or NativeWind) — functional and legible over decorative

---

## 3. Deliverable

A working Expo project that:
1. Runs with `npx expo start`
2. Logs in against the same Supabase project as TaskFlow web
3. Shows, adds, updates, and deletes tasks tied to the logged-in user
4. Can be explained end-to-end: how auth session is stored, how a task read/write call flows from the screen to Supabase and back

Please build this now, and after finishing, give a short plain-English explanation of the folder structure and how a task update flows through the app (screen → Supabase client → database → UI refresh) so it can be reviewed and explained.