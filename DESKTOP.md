Antigravity Build Prompt — TaskFlow Desktop (Tauri + Rust)

Create this inside the desktop/ folder of my existing TaskFlow repo, as an independent Tauri project with its own package.json and src-tauri/ — do NOT merge its dependencies or build config with the Next.js web app. It's a separate toolchain living in the same repo for submission purposes only.

Minimum working desktop version of TaskFlow, reusing the same Supabase backend (same database, same auth.users and Task table) — no new backend needed.

Project Overview
Framework: Tauri (Rust backend shell + a lightweight web frontend rendered in a native window)
Frontend: React + TypeScript + Vite (kept simple — no need to duplicate the full TaskFlow web app's design system, a clean minimal UI is enough)
Rust layer: Used for the Tauri application shell/config, plus at least one real Rust command (a function callable from the frontend) so there's genuine Rust code to review and explain — not just boilerplate
Backend: Same Supabase project as TaskFlow web/mobile — the frontend calls Supabase directly via the JS client, same tables already in use
Goal: A minimum working desktop app — functional and explainable, not visually elaborate
1. Core Functionality (Frontend, calling Supabase directly)
Auth: Login and Sign-up forms using @supabase/supabase-js (signInWithPassword, signUp)
Session persistence: Store the Supabase session in a local file via a simple Rust command (see below) OR in localStorage within the Tauri webview — either is fine for a minimum version, but the Rust file-based option is preferred so there's a genuine Rust command to point to
Task list: Fetch and display the logged-in user's tasks
Add / Update / Delete task: Basic form and list actions, same as the web app's core CRUD
Logout button
2. Required Rust Command (so there's real Rust to explain)

Implement at least one custom Tauri command in src-tauri/src/main.rs, for example:

get_pending_task_count(tasks: Vec<Task>) -> usize — takes the fetched tasks from the frontend and returns a count of non-done tasks, used to update the window title or a system tray badge (e.g., "TaskFlow (3 pending)")
Wire this up with #[tauri::command] and register it in the invoke_handler, and call it from the frontend via invoke('get_pending_task_count', { tasks })

This keeps the Rust piece small, real, and easy to explain: frontend fetches tasks from Supabase → passes them to a Rust function via Tauri's IPC bridge → Rust does a simple computation → returns it → frontend uses it to update the window title.

3. Technical Requirements
Scaffold with npm create tauri-app@latest (React + TypeScript template)
Install @supabase/supabase-js in the frontend
Store Supabase URL/anon key in a .env file (Vite env vars, VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) — never hardcoded
Basic loading/error states on all screens
App must run via npm run tauri dev and build a real installable desktop binary via npm run tauri build (produces a .msi/.exe on Windows, .dmg/.app on macOS, or .deb/.AppImage on Linux depending on the build machine's OS)
Keep styling simple and clean — functional over decorative
4. Deliverable

A working Tauri project that:

Runs with npm run tauri dev
Logs in against the same Supabase project as TaskFlow web/mobile
Shows, adds, updates, and deletes tasks tied to the logged-in user
Uses at least one real Rust command bridging frontend and backend logic
Builds to an installable desktop binary via npm run tauri build

Please build this now, and after finishing, give a short plain-English explanation of:

How the Tauri IPC bridge works (frontend invoke() call → Rust #[tauri::command] → response back to frontend)
How a task CRUD action flows from a UI action to Supabase and back so it can be reviewed and explained without needing prior Rust experience.