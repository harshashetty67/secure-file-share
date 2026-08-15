# secure-file-share — plans

> Two tracks below. **Part A** is the ready-to-build bug fixes + quick UX wins.
> **Part B** is a separate, future "big bets" track (design direction, not for now).
> (Both live in one file because plan mode restricts edits to a single plan file.)

---

# Part A — Bug fixes + quick UX wins

## Context

Two UX gaps in the SPA (`apps/ui`), both frontend-only — no backend changes.

1. **Session doesn't persist.** After magic-link sign-in the user reaches the dashboard, but opening the app URL in a new tab (or reopening it) prompts sign-in again. Cause: tokens are stored in `sessionStorage`, which is per-tab and wiped on tab close. The route guard and API layer read that same per-tab store, so any other tab/window sees no token and falls back to Landing.
2. **Copy-link share URLs route to the landing screen.** Backend builds share links as `${SITE_URL}/d/<shareId>` (`apps/api/src/controllers/shares.controller.ts:38,95`), but the router (`apps/ui/src/App.tsx`) has no `/d/:shareId` route, so it hits the `*` wildcard → `<Navigate to="/" />` → Landing. The clipboard copy is fine; the destination page was never built.

Plus a set of small UX wins for logged-in users (thin surface today: one `/app` dashboard, and visiting `/` shows the marketing Landing even when signed in).

## Fix 1 — Persist session via `localStorage`

Swap the token store from `sessionStorage` → `localStorage` (same keys, same logic) at all four call sites. Minimal fix for the cross-tab symptom. (No refresh flow; access token still expires per Supabase default, after which a reload re-gates to sign-in.)

- `apps/ui/src/pages/AuthCallback.tsx` — `clearAuth` (38–41) and token writes (50–53) → `localStorage`.
- `apps/ui/src/routes.tsx:9` — `Protected` guard reads from `localStorage`.
- `apps/ui/src/lib/api.ts:42,54` — `me()` and `authHeader()` read from `localStorage`.
- `apps/ui/src/pages/Dashboard.tsx:66` — replace `sessionStorage.clear()` with targeted `localStorage.removeItem(...)` for the four `sfs_*` keys.
- Bonus: `AuthCallback.tsx:59` stores `JSON.stringify(me)` (the function) instead of `meRes` — fix to store `meRes`.

## Fix 2 — Add public `/d/:shareId` download page

- `apps/ui/src/App.tsx` — add `<Route path="/d/:shareId" element={<AppRoutes.Download />} />` **before** the `*` wildcard.
- `apps/ui/src/routes.tsx` — import/export a new `Download` page (outside `Protected`; recipients are unauthenticated by design).
- New `apps/ui/src/pages/Download.tsx`:
  - Read `shareId` via `useParams`.
  - Render a share info panel + **Download** button. **Do not fetch on load** — the backend endpoint mints the signed URL *and* increments `download_count` in one call (`apps/api/src/controllers/publicLink.controller.ts:44-59`), so a load-time fetch would over-count on every visit/preview/bot.
  - On click → existing `getPublicDownloadUrl(shareId)` (`apps/ui/src/lib/api.ts:149`, unauthenticated) → set `window.location.href = downloadUrl`.
  - Inline error handling: 404 not-found, 410 revoked/expired/limit-reached, 500 generic — show a message, don't redirect. Reuse `Footer` + `AuthCallback` styling; add `styles/Download.css` if needed.

## Fix 3 — Quick UX wins (logged-in experience)

- **Redirect authed users away from `/` and `/signin` → `/app`.** Inverse of `Protected` (checks `localStorage` token); apply to the Landing and SignIn routes in `App.tsx`. Cheapest high-value win; pairs with the session fix since users will now revisit `/`.
- **Search + sort on Files.** Add a search box + sort toggle (name / size / date) over the existing `files` state in `Dashboard.tsx` (list already comes from `listFilesAll`). In-memory filter/sort, no API change.
- **Better empty / first-run states.** Friendly empty state on the Files tab ("Upload your first file →") and Shares tab instead of a bare screen.
- **Storage-quota warning.** `Dashboard.tsx` already computes `stats.pct` vs a 100 MB quota — add a warning color/toast as it nears the limit.

## Verification (Part A)

1. `cd apps/ui && npm run dev` (needs `VITE_API_BASE_URL`).
2. **Session:** sign in → `/app`; open app URL in a new tab + reload → stays on dashboard. `localStorage` holds `sfs_access_token`. Sign out → keys cleared, back to `/`.
3. **Share link:** create a share → Copy link → paste `/d/<id>` in a logged-out/incognito tab → download page renders, button downloads the file. Expired/revoked share shows the right inline error (no Landing redirect).
4. **Counter:** `download_count` increments once per Download click, not on page load.
5. **Quick wins:** visiting `/` while signed in redirects to `/app`; file search/sort works; empty states show; quota warning appears near the cap.

---

# Part B — Big bets (separate track, future)

Design direction for turning the logged-in surface from a static bucket into something with return value and visible trust. Chosen to fit the **free-tier / open-source** constraint. These three reuse each other and form one "security trust" story; they are **not** scheduled now.

### Architecture / free-tier notes
- DB is **Supabase Postgres** via `supabase.from(...)` with the service-role key (`shares.service.ts`). New tables (e.g. `access_logs`) fit the existing free-tier project — no new infra.
- Uploads pass through an **in-memory buffer** in `uploadFileController` (`apps/api/src/controllers/uploadFile.controller.ts:15`) before `uploadToStorage` — a clean, request-scoped hook for scanning (no daemon).
- Deployment reality: UI on **Vercel**, API is an **always-on Express server on Render** (per `vercel.json` → `onrender.com`), not Vercel serverless as `docs/new-features/Readme.md` assumes. Render's free tier sleeps on idle, so still avoid persistent daemons and keep work request-scoped. Groq/VirusTotal are external free-tier HTTP calls — fine either way.
- **E2E constraint preserved:** every feature below touches only *metadata* (logs, hashes, share settings) — never plaintext file contents.

### Bet 1 — Access / Activity log  *(foundation; also delivers the File↔Share UX link)*
Persist share-access events instead of only `console.log` (`publicLink.controller.ts` already logs `issued/revoked/expired/maxed`). 
- New `access_logs` table: `share_id`, `object_key`, `owner_id`, `event`, `ip`, `country?`, `user_agent?`, `created_at`.
- Write a row in `getPublicShareUrlController` on each access (reuse the data already in hand: `cf-connecting-ip`, shareId, event).
- Surface in the dashboard: a per-share (and per-file) activity timeline — "downloaded 3× · last from … · 2h ago". This connects the today-disconnected Files and Shares tabs and gives users something to come back and watch.
- **Free-tier:** pure Postgres rows on the existing Supabase project. Cost ≈ zero.

### Bet 2 — Malware scanning on upload (VirusTotal API)
Highest security value, least friction; from `docs/new-features` Feature 3.
- In `uploadFileController`, before `uploadToStorage`: compute the file's SHA-256 from `f.buffer`, query VirusTotal by hash (free public API, ~4 req/min). If unknown, optionally submit the file; otherwise store the verdict.
- Persist a `scan_status` (`clean` / `flagged` / `pending` / `unscanned`) alongside the file/share metadata; show a badge in the Files list and on the public `/d/:shareId` page.
- **Free-tier:** single outbound HTTP call per upload; hobby-app upload volume stays well under the rate limit. No daemon (deliberately skip self-hosted ClamAV).

### Bet 3 — Anomaly guard digest (rules + Groq)
Builds directly on Bet 1's `access_logs`; from Feature 2.
- Simple rule checks over recent logs (no ML): burst downloads on an idle link, many distinct IPs/countries in a short window, downloads far above normal. Thresholds tuned for low-traffic hobby usage.
- Only **when a rule trips**, call Groq (free tier, JSON/structured output) to turn the raw log slice into a plain-English alert ("This link was hit 3× from 2 countries in 10 min after a week idle — revoke?"), shown in-dashboard with a one-click Revoke.
- **Free-tier:** rules run in existing DB queries; Groq is called only on a trip, keeping usage minimal.

### Deferred / optional (mentioned, not in this plan)
- **Natural-language share assistant** (Feature 1, Groq) — delight feature; parses "share with X, password, expire 3d" into the share form. Nice later, lower priority than the trust trio.
- **Account/session panel** — "signed in as", session expiry, sign-out-everywhere; more relevant once a token-refresh flow exists.

### Suggested build order (Part B)
1. **Access log** (unlocks the other two + the File↔Share UX).
2. **Malware scanning** (independent, high security value).
3. **Anomaly digest** (depends on the access log).
