# Handoff: FileShare App — Organic Design (1a)

## Overview
A secure file-sharing web app built around magic-link (passwordless) authentication. Users upload files and generate signed, expiring share links — no passwords, no recipient accounts required. The design is warm and approachable ("Organic" system: cream/terracotta/sage palette, Caprasimo + Figtree typefaces, rounded corners throughout).

## About the Design Files
The file `File Sharing App.dc.html` is an **HTML design reference** — a high-fidelity prototype showing intended look, layout, and interactions. Do NOT ship this file directly. Your task is to **recreate these screens in your target framework** (React, Next.js, etc.) using its established patterns, component libraries, and routing conventions. Use the HTML as a pixel-level visual spec.

The file contains multiple design explorations (turns 1–4). **Build from turn 4 (`id="4a"`) for the dashboard, and turn 1 (`id="1a"`) for the landing and sign-in screens.** You can ignore turns 2, 3, and other options (1b, 1c, 2a, 2b).

## Fidelity
**High-fidelity.** Recreate colors, typography, spacing, border radii, shadows, and interactions as precisely as possible using your codebase's component system.

---

## Design Tokens

| Token | Value |
|---|---|
| Background | `#f5ead8` (warm cream) |
| Surface (cards) | `#fff` or `var(--color-surface)` |
| Text | `#201e1d` |
| Accent (primary) | `#c67139` (terracotta) |
| Accent-2 (secondary) | `#7a8a5e` (sage) |
| Divider | `rgba(32,30,29,.1)` |
| Accent-100 tint | `rgba(198,113,57,.1)` |
| Accent-2-100 tint | `rgba(122,138,94,.1)` |
| Accent-2-700 | `#4a5c38` |
| Border radius (pill) | `999px` |
| Border radius (card) | `16px` |
| Border radius (icon bg) | `12px` |
| Shadow sm | `0 1px 4px rgba(32,30,29,.08)` |
| Shadow md | `0 4px 16px rgba(32,30,29,.12)` |
| Shadow lg | `0 8px 28px rgba(32,30,29,.16)` |
| Heading font | Caprasimo (Google Fonts) |
| Body font | Figtree (Google Fonts) |

---

## Screens

### 1. Landing Page (`id="1a"` — first card in turn 1)

**Purpose:** Marketing/entry page. Explains the product and funnels to sign-in.

**Layout:** Full-width, `1100×720px` reference. Flex column.

**Nav bar** (height: 64px, bottom border: 1px divider):
- Left: logo icon (34×34px, terracotta fill, 10px radius) + "FileShare" in Caprasimo 18px
- Middle: "How it works" + "Security" links, 14px Figtree, neutral-600
- Right: "Sign in →" pill button (terracotta fill, white text, 999px radius, 9px 22px padding)

**Hero section** (flex row, padding 0 52px, vertically centred):
- Left column (max-width 500px):
  - Badge pill: terracotta-100 bg, terracotta-700 text, shield icon + "End-to-end encrypted"
  - H1: Caprasimo 52px, `line-height:1.04` — "Share files. Not passwords."
  - Body: Figtree 16px, neutral-600, `line-height:1.65`, max-width 420px
  - CTA row: primary pill button "Get started free" (terracotta, shadow `0 4px 16px rgba(198,113,57,.35)`) + ghost pill "How it works"
  - Footnote: 12px neutral-500 "No credit card · No account · Just your email"
- Right decorative area (460×420px, position relative):
  - Two soft circles (terracotta-100 and sage-100) as background blobs
  - Floating file cards (f1, f2, f3) with `animation: float` — see HTML for exact positions and content

**Feature cards** (right column, shown in the original 1a turn — 3 rounded surface cards with icon + title + description)

---

### 2. Sign-In Screen (`id="1a"` — second section, after "Sign In Screen" separator)

**Purpose:** Passwordless email sign-in. User enters email → receives a magic link.

**Layout:** `1100×540px`. Flex row: left panel (440px) + right panel (flex:1).

**Left panel** (terracotta `#c67139` fill, 48px padding):
- Eyebrow: 9px uppercase white/50%, "FileShare — Sign in"
- H2: Caprasimo 38px white, "Zero-trust sign in."
- Body: 14px white/70%, `line-height:1.6`
- Trust list: 3 items separated by white/14% borders, each with a 2px white vertical rule + bold text

**Right panel** (flex:1, centred, 48px padding, left border 1px divider):
- Form max-width 360px:
  - H3: 26px, weight 900, "Sign in"
  - Subtext: 13px neutral, "We'll email you a secure, single-use link."
  - Email field: label (10px uppercase) + input (border 2px divider, 14px, full width)
  - Submit: full-width terracotta pill button "Send magic link →"
  - Footnote: 10px uppercase "EXPIRES IN 10 MIN · ONE-TIME USE"

---

### 3. Dashboard (`id="4a"` — turn 4, the reworked Organic version)

**Purpose:** Authenticated view. User sees their files, uploads new ones, shares.

**Layout:** `1100×720px`. Flex row: sidebar (244px) + main content (flex:1).

**Sidebar** (white/surface bg, right border 1px divider):
- Logo: icon + "FileShare" (same as nav)
- Nav items (padding 12px, gap 3px):
  - Active "Files": accent-100 bg, 12px radius, accent text, badge count (terracotta pill)
  - Inactive "Shares": neutral-600 text, neutral-200 badge
- Storage bar section (bordered top+bottom):
  - Label + "12.8 / 100 MB" right-aligned (11px)
  - 6px pill bar: accent-100 track, accent fill at 13%
- User section: avatar circle (32px, sage-100 bg, user icon) + email + "Sign out" ghost link

**Main header** (height 64px, bottom border 1px divider):
- Left: "Your files" Caprasimo 22px
- Right: "Upload file" primary pill button with upload icon, shadow `0 3px 12px rgba(198,113,57,.3)`

**Stats strip** (flex row, gap 12px, padding 22px 32px):
- Card 1: Files — icon (folder, accent-100 bg 38×38 12px radius) + big number "3" + label
- Card 2: Active link — sage icon bg + "1" in sage-700 + label
- Card 3 (flex:2): Storage — database icon + "12.8 MB / 100 MB" + 6px pill bar
- All cards: white bg, 16px radius, shadow-sm, 14px 18px padding

**Upload zone** (2px dashed accent-200 border, accent-100 bg, 20px radius, 20px 28px padding):
- 48px circle icon bg (cream, shadow-sm) + terracotta upload icon
- "Drag & drop files here, or click to browse" (accent coloured prefix)
- Sub-label: 12px neutral-600

**File list** (label row + 3 file cards, gap 8px):
- Section label: 12px uppercase neutral-600 "Recent files" + "3 files" right
- Each file card (white, 16px radius, 13px 16px padding, shadow-sm, flex row gap 12px):
  - Icon bg 40×40 12px radius (accent-100 or sage-100) + file type icon
  - Name (13px weight 600) + metadata (11px neutral-500)
  - Optional "Shared" pill (sage-100 bg, sage-700 text, 999px radius)
  - "Share" primary pill button + "Delete" ghost pill button

---

## Interactions & Behavior

| Element | Behavior |
|---|---|
| "Get started free" / "Sign in" | Navigate to sign-in screen |
| Email form submit | POST to magic-link API; show "Check your email" confirmation state |
| Upload zone | Open system file picker; show upload progress inline |
| Share button | Open share modal (copy link, set expiry, toggle download limit) |
| Delete button | Confirm dialog → delete file + revoke active links |
| Nav "Shares" | Switch to shares/active-links view |
| Magic link (email) | Authenticate user, redirect to dashboard |

**Hover states:** buttons lighten by one ramp step. File rows get a subtle shadow-md on hover. Nav items get accent-50 bg on hover.

**Animations (landing only):**
- File cards float up/down on a 4–6s ease-in-out loop (`translateY` ±9px)
- Hero text slides up on load (`slideUp` keyframe, staggered delays 0.2–0.8s)
- CTA button glows with a pulsing terracotta box-shadow (`ctaGlow` keyframe)

---

## State Management

| State | Description |
|---|---|
| `user` | Authenticated user object (email). `null` = logged out. |
| `files[]` | Array of uploaded file objects `{id, name, size, mimeType, uploadedAt, shareLinks[]}` |
| `shareLinks[]` | `{id, fileId, token, expiresAt, downloadLimit, downloadCount, revoked}` |
| `uploading` | Boolean + progress 0–100 for active upload |
| `activeModal` | `null \| 'share' \| 'delete-confirm'` |

---

## Key API Endpoints (reference from GitHub repo)

- `POST /auth/magic-link` — send magic link to email
- `GET /auth/verify?token=` — verify token, set session
- `GET /files` — list user's files
- `POST /files/upload` — multipart upload
- `DELETE /files/:id` — delete file
- `POST /files/:id/share` — create share link (body: `{expiresIn, downloadLimit}`)
- `DELETE /share/:token` — revoke a share link
- `GET /share/:token` — public download (no auth)

---

## Assets & Icons
- Icons: [Lucide](https://lucide.dev) at `stroke-width: 2.75`, `stroke-linecap: round`
- Fonts: Load from Google Fonts — `Caprasimo` (display) + `Figtree` (body, weights 400/500/600)
- No custom image assets required for MVP

## Files in This Package
- `File Sharing App.dc.html` — complete high-fidelity HTML prototype (all screens + explorations)
- `README.md` — this document

## How to Use With Claude Code
Paste the following prompt into Claude Code after attaching or referencing this package:

> "Build the FileShare app UI described in README.md. Use the HTML prototype in 'File Sharing App.dc.html' as the visual reference — scroll to section id='1a' for the landing and sign-in, and id='4a' for the dashboard. Implement in [React/Next.js/your stack]. Match the design tokens, layout, and component structure documented in the README exactly."
