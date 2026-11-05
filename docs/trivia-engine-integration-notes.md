# Egyptian Trivia Engine — Firebase Integration Notes

**Date:** 2026-11-05
**Status:** In progress — implementation notes and transition plan

## 0. What We Found (Project Inspection)

### Architecture
- **Framework:** Vite + React 19 + TypeScript + Tailwind CSS 4 + TanStack Router/Start.
- **Deployment:** Vercel (`vercel.json`), SSR entry at `src/server.ts`, PWA-ready (`manifest.webmanifest`).
- **Package manager:** npm (`package-lock.json`, `.pnpm` absent; `bun.lock` present but not used by the build).
- **Bundle target:** client + server (TanStack Start SSR). Firebase SDK used client-side.

### Current AI System (OpenRouter) — to be PRESERVED
- **`src/lib/quiz.ts`** — question domain: `Question`, `CategoryKey` (9 categories: capitals, flags, quotes, historical_figures, cartoons, football_players, landmarks, aerial_city, general_knowledge), `Level` (easy/medium/hard), prompt builder, Zod schema, parsing.
- **`src/lib/parallel-ai.ts`** — parallel generation across `openrouter/free` (currently 1 model, `FORCED_PARALLEL_SLOTS = 2`), distribution algorithm `[base, base+1...]`, per-model 45s cooldown on 429, retry logic, centralized validation/dedup.
- **`src/lib/providers.ts`** — `fetchInitialBatch()` (2 questions fast-start from local bank + parallel AI), `fetchRemainingBatch()` (progressive background streaming), failover across models.
- **`src/lib/anti-repeat.ts`** — persistent client-side content bank in `localStorage` (`tahaddi-bank-quiz-v1`, `tahaddi-bank-words-v1`, `tahaddi-bank-sentences-v1`), dedupe keys, LRU seen-tracking, eviction caps (1200/1500/1500), selection & shuffle algorithms.
- **`src/lib/images.ts`** — Wikipedia/Commons thumbnail resolution for image-based categories.
- **`src/lib/quiz-fallback.ts`** — curated ~70 fallback questions (7 levels × categories) for 100% offline start.
- **`src/lib/words.ts`** — "ركّب كلمة" / "ركّب جملة" modes with their own banks.
- **`src/components/quiz/QuizScreen.tsx`** — game loop: `initial_loading` → `playing` → background prefetch (`triggerBackgroundFetch`) → `waiting_next` / `waiting_error`.

### Authentication
- **None exists today.** No auth system, no users, no roles, no Admin panel. The app is fully offline-first with a Settings dialog for the OpenRouter API key.

### Secrets
- `.env` contains `OPENROUTER_API_KEY` + `VITE_OPENROUTER_API_KEY`. Both are git-ignored. No Firebase Admin/Service Account currently exists.

### Game flow (to stay intact)
1. User hits `/quiz`, picks level, configures (10/15/20 questions, categories).
2. `fetchInitialBatch` → instant 2 questions from local bank, then play starts.
3. Background `fetchRemainingBatch` streams the rest as they arrive.
4. Answer → immediate feedback + auto-advance (correct) or "السؤال التالي" (wrong).

## 1. Design Decisions

### Scope (what this PR does, what it does NOT)
- **YES:**
  - Install `firebase`, `firebase-admin`, `firebase-tools`.
  - Add Firebase config module (`src/lib/firebase.ts`) with single-app guard.
  - Seed Firestore with the 8 specification categories.
  - Create the `questions` / `questionAnswers` / `questionSources` / `generationJobs` collections + rules.
  - Create `firestore.indexes.json` with the required composite indexes.
  - Add Cloud Function (Gen 2) `preflight-generation-job` for the low-water-mark background generation trigger.
  - Add admin-side seed script for the fallback bank into Firestore.
  - Add `src/lib/fb-questions.ts` — a **database-first** question provider that reads approved questions from Firestore, preserving all existing `Question` shape + dedupe-key conventions.
  - Add an optional `FB_QUESTIONS_ENABLED` toggle in `SettingsDialog` so players can switch between "local AI" and "Firestore DB-first" mode without code changes.
- **NO (out of scope, left as-is or deferred):**
  - Do **NOT** change the UI, game mechanics, routing, score logic, banks, or OpenRouter parallel generation.
  - Do **NOT** remove or replace `parallel-ai.ts` / `providers.ts` / `quiz.ts` / `quiz-fallback.ts`.
  - Do **NOT** migrate the existing `localStorage` banks to Firestore (no destructive migration; keep client banks as a cache/fallback).
  - Do **NOT** build a full Admin Dashboard in this PR (spec says "أضف قسمًا في لوحة الإدارة الحالية" — there is no Admin panel today, so the seed + Firestore rules + indexes are delivered first; UI can be added later).
  - Do **NOT** deploy anything to a live project yet (no `firebase login` / `firebase use` can be run from this environment; deployment commands are documented for the user).

### Data model (Firestore)

```
questions/{questionId}
  category: string
  question: string
  options: string[] (exactly 4)
  explanation: string
  level: "easy"|"medium"|"hard"
  categoryKey: string            // maps to CategoryKey
  topicKey?: string
  countryCode?: string
  imageQuery?: string
  levelKey: string               // "easy"/"medium"/"hard"
  imageCategory: boolean         // flags/historical_figures/cartoons/football_players/landmarks/aerial_city
  status: "pending"|"approved"|"rejected"|"needs_review"|"disabled"
  sourceType: "ai_generated"|"dataset"|"manual"
  sourceId?: string
  sourceQuestionId?: string
  qualityScore?: number
  usageCount: number             // server-side only
  contentHash: string
  languageVariant: "ar-EG"
  createdAt: Timestamp
  updatedAt: Timestamp
  approvedAt: Timestamp|null

questionAnswers/{questionId}  (client READ/WRITE blocked by rules; server Admin SDK only)
  correctIndex: number (0-3)
  explanationPrivate?: string
  createdAt: Timestamp
  updatedAt: Timestamp

questionSources/{sourceId}
  name, sourceUrl, datasetVersion, licenseSpdx, commercialAllowed, rightsVerified,
  verificationStatus, createdAt

generationJobs/{jobId}
  categoryKey, targetCount, generatedCount, approvedCount, rejectedCount,
  status: "queued"|"processing"|"completed"|"failed"|"paused"|"cancelled",
  provider, models[], errorMessage, createdAt, updatedAt, completedAt|null

questionDedup/{contentHash}
  (exists-only doc used as a unique lock; write via transaction)

categories/{slug}
  nameAr, slug, description, isActive, sortOrder, createdAt, updatedAt
```

**Correct answer storage:** `correctIndex` lives only in `questionAnswers`, which Firestore rules block to all client reads/writes. Client-visible `questions` docs never contain `correctIndex`.

### Low-water-mark trigger
Client-side low-water mark: a round needs `targetTotal` questions; we consider `inventoryBelow = 4` the low-water threshold. When the client's Firestore-backed batch falls below this and the game is live, a client-side effect calls the Cloud Function `preflight-generation-job` **asynchronously** (fire-and-forget, no await) to enqueue a generation job. This never blocks UI rendering.

### Preserving OpenRouter
The existing flow (`fetchInitialBatch` → `fetchRemainingBatch` → local `localStorage` bank) is untouched. The Firestore provider is **opt-in**: a new mode `mode: "fb"` in Settings that reads from Firestore instead of the local bank, using the exact same selection/eviction/anti-repeat utilities. Default stays `mode: "localStorage"` (current behavior), so existing users are unaffected and the OpenRouter parallel generation continues to work exactly as before.

## 2. Transition / Cutover Plan (phased, safe)

1. **Phase 0 — Setup (user runs):**
   ```bash
   npm install firebase firebase-admin firebase-tools
   npm run build          # verify client still compiles
   npm test               # run existing tests
   firebase login
   firebase projects:list
   firebase use --add
   # select "wafaa-game"
   ```
2. **Phase 1 — Rules & indexes:** deploy `--only firestore:rules,firestore:indexes` first, test with the emulator:
   ```bash
   firebase emulators:start --only firestore
   ```
   Confirm: no client can read `correctIndex`; approved questions readable; unapproved hidden.
3. **Phase 2 — Seed:** run the seed script in emulator or production (idempotent) to create the 8 categories + insert the ~70 curated fallback questions as `approved`.
4. **Phase 3 — Functions:** deploy `--only functions`, then manually invoke `preflight-generation-job` to confirm a job is created.
5. **Phase 4 — Gradual cutover:** a small number of players enabled on `mode: "fb"` first; monitor counts via Firestore queries; enable fully once verified.

## 3. Files to be created / modified

### New files
- `src/lib/fb-config.ts` — Firebase project config (client-safe values only).
- `src/lib/firebase.ts` — single-instance modular SDK init (`app`, `db`, `auth`).
- `src/lib/fb-questions.ts` — approved-question reads (batched, cursor-paginated).
- `src/lib/question-provider.ts` — backend switch (`localStorage` ↔ `firestore`) + background generation trigger.
- `functions/src/seed-questions.json` — categories + curated fallback question bank (shared by the seed function and the REST seeder).
- `functions/src/index.ts` — Cloud Functions: `submitAnswer`, `preflightGenerationJob`, `processGenerationJob`, `seedDatabase`, `seedDatabaseHttp`.
- `functions/package.json`, `functions/tsconfig.json` — functions build config.
- `firebase.json`, `.firebaserc` — Firebase CLI project config (`wafaa-game`).
- `firestore.rules` — production security rules.
- `firestore.indexes.json` — composite indexes for the exact queries used.
- `docs/trivia-engine-integration-notes.md` — this file.

### Modified files
- `src/lib/quiz.ts` — added `Settings.questionBackend` ("localStorage" default) + `isFirestoreMode()` helper. No behavior change unless opted in.
- `src/components/quiz/SettingsDialog.tsx` — added the backend toggle UI.
- `src/components/quiz/QuizScreen.tsx` — Firestore-mode branches for initial/prefetch + fire-and-forget refill trigger.
- `src/lib/words.ts`, `src/lib/pwa.ts`, `src/components/words/*` — minimal type/syntax fixes so the project type-checks (pre-existing uncommitted edits).
- `package.json` / `package-lock.json` — `firebase`, `firebase-admin`, `firebase-tools`.
- `.env.example` — documented Firebase/OpenRouter secrets (placeholders only).

## 4. Security Rules Summary (firestore.rules)

- `questions/{id}`: client read only when `status == 'approved'`; **all client writes denied**. Answers are never stored here.
- `questionAnswers/{id}`: **deny all** client reads/writes. Only the Admin SDK (Cloud Functions) can access it.
- `questionDedup/{hash}`: client access denied.
- `generationJobs`, `generationBatches`, `questionUsage`, `questionReviewLogs`: client access denied.
- `categories`, `questionSources`: public read; writes admin-only (`users/{uid}.role == 'admin'` + `exists()` guard).
- `questionReports`: authenticated create only (currently no auth → effectively locked).
- `gameSessions` + `items`: owner-scoped when auth exists.
- `privateGameSessions/**`: **deny all** client access.

## 5. Composite Indexes (firestore.indexes.json)

Matches the exact queries in `src/lib/fb-questions.ts`:

- `questions`: `status ASC, approvedAt ASC` (text batch)
- `questions`: `status ASC, imageCategory ASC, approvedAt ASC`
- `questions`: `status ASC, categoryKey ASC, approvedAt ASC`
- `questions`: `status ASC, level ASC, approvedAt ASC`
- `questions`: `status ASC, level ASC, categoryKey ASC, approvedAt ASC` (round query)
- `questionSources`: `rightsVerified ASC, commercialAllowed ASC`
- `questionReports`: `questionId ASC, createdAt DESC`

## 6. Commands for the User

```bash
# 0) One-time Firebase CLI setup (installed locally via npm)
npx firebase login
npx firebase projects:list
npx firebase use --add          # select "wafaa-game"

# 1) Install dependencies (root + functions)
npm install

# 2) Verify before deploying
npx tsc --noEmit
npm run build
npm test

# 3) Create the required secrets (prompted, never committed)
npx firebase functions:secrets:set OPENROUTER_API_KEY
npx firebase functions:secrets:set ADMIN_SEED_SECRET

# 4) Optional: local emulator
npx firebase emulators:start --only firestore,functions

# 5) Deploy rules + indexes first, then functions
npx firebase deploy --only firestore:rules
npx firebase deploy --only firestore:indexes
npx firebase deploy --only functions

# 6) Seed categories + the curated fallback questions (idempotent).
#    Use the HTTP endpoint printed by the deploy:
curl -X POST "https://us-central1-wafaa-game.cloudfunctions.net/seedDatabaseHttp" \
  -H "Content-Type: application/json" \
  -H "x-seed-secret: $ADMIN_SEED_SECRET" \
  -d "{}"
# PowerShell equivalent:
# Invoke-RestMethod -Method Post `
#   -Uri "https://us-central1-wafaa-game.cloudfunctions.net/seedDatabaseHttp" `
#   -Headers @{ "x-seed-secret" = $env:ADMIN_SEED_SECRET } `
#   -ContentType "application/json" -Body "{}"

# 7) Enable Firestore mode for testing:
#    Quiz → Settings → "مصدر الأسئلة: Firestore" → Save → reload.
```

Note: `firebase.json` intentionally has no hosting block — the app stays on Vercel. Cloud Functions are deployed separately to the `wafaa-game` project.

## 7. Secrets required on Firebase/Google Cloud Secret Manager

| Secret | Used by | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | `preflightGenerationJob`, `processGenerationJob`, AI verification | Set with `npx firebase functions:secrets:set OPENROUTER_API_KEY` |
| `ADMIN_SEED_SECRET` | `seedDatabase`, `seedDatabaseHttp` | Long random string; same value passed in the seed request |

- Firebase Admin credentials: **Application Default Credentials** in Cloud Functions. No JSON key in the repo.
- `FIREBASE_PROJECT_ID = "wafaa-game"` is already in `src/lib/fb-config.ts` (client) and `.firebaserc`.
- The **web API key** is a public client identifier, not a secret. Security Rules are the actual protection.

## 8. Firestore-mode answer security

`questions` documents never contain `correctIndex`. After the player answers, the client calls the
`submitAnswer` callable which reads `questionAnswers/{id}` with the Admin SDK and returns
`{ isCorrect, correctIndex }`. `questionAnswers` is fully blocked by rules, so no client can read
answers ahead of time. If the callable is unreachable, the round continues without revealing the
answer (fail-safe, never fails open).

## 8. Risk Register & Rollback

- **Risk:** Firestore reads slower than localStorage. **Mitigation:** keep localStorage as primary; Firestore as opt-in; batch prefetch with `startAfter` cursors.
- **Risk:** New users have empty Firestore at first boot. **Mitigation:** the seed populates 36 curated fallback questions as `approved`, so the game has instant content. OpenRouter parallel generation remains the scaling path.
- **Rollback:** revert the commit; localStorage path works 100% offline regardless. Firestore integration is opt-in, so disabling the toggle restores the exact previous behavior with zero user impact.

## 9. Deployment status (executed 2026-11-06)

**Done:**
- Firebase CLI authenticated as `w.emira2554@su.edu.eg`; project `wafaa-game` selected (`.firebaserc`).
- Firestore (default, Native) confirmed.
- `firestore.rules` compiled successfully and **released** to production.
- `firestore.indexes.json` **deployed** (composite indexes building).
- Seed executed directly against Firestore REST API:
  - `categories`: **8** documents (the 8 spec categories).
  - `questions`: **36** approved questions.
  - `questionAnswers`: **36** answer documents (client-blocked).
- Rules verified from an unauthenticated client perspective:
  - Approved question query → `200`, and returned docs contain **no `correctIndex`**.
  - `questionAnswers/*` → `403 PERMISSION_DENIED`.
  - Non-approved/non-existent question → `403`.

**Blocked — requires the project owner:**
- `wafaa-game` is on the **Spark** plan. Cloud Functions + Secret Manager require **Blaze (pay-as-you-go)**:
  <https://console.firebase.google.com/project/wafaa-game/usage/details>
- After upgrading, run:
  ```bash
  npx firebase functions:secrets:set OPENROUTER_API_KEY   # paste a VALID key
  npx firebase functions:secrets:set ADMIN_SEED_SECRET    # value is in .env
  npx firebase deploy --only functions
  ```
- The current `OPENROUTER_API_KEY` in `.env` returns **HTTP 401** (expired/invalid), so server-side generation will fail until replaced.
- `ADMIN_SEED_SECRET` has been written to `.env` (git-ignored). Keep it safe.

**Note:** the client `firestore` backend is opt-in (Settings → Firestore). The default remains the existing local-bank + in-browser OpenRouter flow, so no existing user is affected. Until Functions are deployed, Firestore mode still plays (approved questions + local fallback) but cannot verify answers server-side — the client falls back safely, and background generation is skipped.

## 10. Testing Checklist

- [x] `npm run build` succeeds.
- [ ] `npm test` passes.
- [ ] `npm run lint` clean.
- [ ] Emulator: client can read approved questions, cannot read `correctIndex` from `questionAnswers`, cannot write `questions`.
- [ ] Seed script idempotent (re-run doesn't duplicate).
- [ ] `preflight-generation-job` creates a `generationJobs/{jobId}` with `status: "queued"` / `"processing"`.
- [ ] Existing `mode: "localStorage"` quiz game identical to before (no regression in UI, scoring, or AI generation).
- [ ] Firestore mode toggle, when ON, shows questions loaded from Firestore.

---

*This document is a living record of the integration. Update it as implementation progresses.*
