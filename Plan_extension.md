# Antigravity Addendum Prompt — TaskFlow: API Access for FocusFlow Extension

Give this to Antigravity **on the existing TaskFlow project** (not a new project) — it adds a personal API token system so the FocusFlow Chrome extension can read pending tasks.

---

## Goal

Add a lightweight, token-based read API to TaskFlow so an external client (a Chrome extension) can fetch a logged-in user's pending tasks without going through full Supabase session auth.

---

## 1. Database: Add ApiToken model

Add to `prisma/schema.prisma` and run a new Prisma migration:

```prisma
model ApiToken {
  id         String    @id @default(uuid())
  tokenHash  String    @unique
  label      String?   // e.g. "FocusFlow Extension"
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt  DateTime  @default(now())
  lastUsedAt DateTime?
  revokedAt  DateTime?
}
```

Add the inverse relation (`apiTokens ApiToken[]`) to the `User` model.

**Security requirement:** Never store the raw token. Generate a random 32+ byte token (e.g. `crypto.randomBytes(32).toString("hex")`), show it to the user **exactly once** on creation, and store only a SHA-256 hash of it in `tokenHash`. Lookups hash the incoming token and compare against `tokenHash`.

---

## 2. New Page: Settings → API Access

Route: `/dashboard/settings/api`

- Button: "Generate New Token" → creates a token, shows it in a copy-to-clipboard box with a clear one-time warning ("Copy this now — you won't see it again")
- Optional label field (e.g., "FocusFlow Extension") so the user can identify tokens later
- List of existing tokens showing: label, created date, last used date, and a "Revoke" button (sets `revokedAt`, excludes it from future auth checks)
- Simple, on-brand with the rest of TaskFlow's beige/coral theme — this doesn't need to be fancy, just clear and functional

---

## 3. New API Route: GET /api/tasks

File: `app/api/tasks/route.ts`

Behavior:
- Reads `Authorization: Bearer <token>` header
- Hashes the token, looks up a matching `ApiToken` where `revokedAt IS NULL`
- If no match → `401 Unauthorized`
- If matched → update `lastUsedAt`, fetch that user's tasks where `status != DONE`, ordered by `dueDate` ascending (nulls last), and return JSON:
```json
{
  "count": 5,
  "tasks": [
    { "id": "...", "title": "...", "priority": "HIGH", "dueDate": "2026-07-28T00:00:00Z", "status": "IN_PROGRESS" }
  ]
}
```
- This is **read-only** for v1 — no create/update/delete via this route, to keep the attack surface small
- Add basic rate limiting (e.g., max 30 requests/minute per token) to prevent abuse

**CORS / cross-origin note:** Chrome extensions with `host_permissions` declared in their manifest are exempt from standard browser CORS restrictions when calling your API from a background service worker — so you do NOT need to add permissive `Access-Control-Allow-Origin: *` headers. Keep CORS locked down as normal (or default/no CORS headers) since only the extension (with explicit host permission) and your own app will call this route.

---

## 4. Deployment Checklist

1. New Prisma migration for `ApiToken` is committed and applied
2. `/dashboard/settings/api` is reachable, protected by the existing auth middleware, and lets a user generate + revoke tokens
3. `GET /api/tasks` correctly returns 401 for missing/invalid/revoked tokens and correct JSON for valid ones
4. Token is only ever shown once at creation — confirm it's not retrievable afterward anywhere in the UI or API
5. `npm run build` still passes with zero errors after these additions

Please implement this now and confirm the build passes.