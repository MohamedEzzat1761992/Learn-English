# My English Mastery

A personal, offline-first English-learning application for Arabic speakers, covering CEFR A1–C2. No account, no paid services, no learning data sent to a server. It ships as a static web app and as a standalone Android app.

> **Status: Phase 02 — Local persistence, backup, and PWA.** Version `0.2.0` stores lesson progress, saved words, activity, settings, exercise attempts, and review history in IndexedDB. The web build is installable and opens offline from a cached app shell (manifest, icons, worker, and offline navigation verified; no OS install dialog was completed); the same export is packaged into a debug APK (`versionCode 2`). Lesson *text* is still clearly labelled sample content, and the spaced-repetition scheduler and answerable exercises are not built yet. Tested and unverified items are listed under [Limitations](#limitations) and in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

## Requirements

- **Node.js** `>= 20.9.0` (verified locally on Node `26.3.0`).
- **npm** 11.x. The project uses npm and commits an npm lockfile.
- A modern browser with IndexedDB and, for offline support, service workers (HTTPS or `localhost`). Without IndexedDB the pages still render and clearly report that learning data cannot be saved.
- **For the Android APK only:** JDK 21 and the Android SDK (platform 36, build-tools 36.0.0, platform-tools). The Gradle wrapper downloads Gradle automatically. See [`docs/ANDROID.md`](docs/ANDROID.md).

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

Production check (static export + local preview):

```bash
npm run build
npm run preview
```

`next build` produces `out/`, which is both the deployable web root and Capacitor's `webDir`. `npm run preview` serves it with a zero-dependency Node server on port 3000 (`PORT=…` to change it).

Android APK:

```bash
npm run android:apk
```

The APK is written to `dist-apk/my-english-mastery-debug.apk`. Full environment setup, installation, and update instructions are in [`docs/ANDROID.md`](docs/ANDROID.md).

## Scripts

| Command              | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `npm run dev`        | Start the Next.js development server on port 3000              |
| `npm run build`      | Create the static export in `out/`, normalize RSC filenames, generate the service worker |
| `npm run preview`    | Serve the exported `out/` directory locally                    |
| `npm run lint`       | Run ESLint (Next.js core-web-vitals + TypeScript)              |
| `npm run typecheck`  | Run `tsc --noEmit` in strict mode                              |
| `npm test`           | Run the Vitest suite once (37 tests in 5 files)                |
| `npm run test:watch` | Run Vitest in watch mode                                       |
| `npm run check`      | Typecheck, lint, and tests in one command                      |
| `npm run android:sync` | Build the export and copy it into the Android project        |
| `npm run android:apk`  | Build the export, sync, and assemble the debug APK           |
| `npm run android:open` | Open the Android project in Android Studio                  |

## What works in this phase

- **Local persistence.** A versioned Dexie database (`my-english-mastery`, schema v2) with tested repositories for settings, lesson progress, daily activity, vocabulary, exercise attempts, and review history. A v1→v2 upgrade migrates the legacy locale preference instead of dropping it.
- **Real dashboard numbers.** Completed lessons, saved words, due words, streak, weekly minutes, and the daily goal are read from stored records. The “Next lesson” card follows the last completion; a finished sample path shows an all-done card instead of a fake in-progress lesson.
- **Lesson actions that persist.** Starting a lesson records progress, “save word” stores a vocabulary record with a due date, and completing a lesson writes progress plus that day’s activity in one transaction. Repeated start/complete calls are idempotent.
- **Settings.** Interface language (mirrored atomically into the settings record), daily minute goal (5–120), new-words goal (0–50), live data counts, and a persisted local-storage status.
- **Validated backup.** Export produces a readable JSON file (`format: my-english-mastery-backup`, `version: 1`) with copy and download controls. Import parses and validates the *entire* file — envelope, schema version, every record, duplicate keys, and orphaned reviews — before clearing and rewriting the tables in one transaction. Unknown keys are dropped; a newer format version and a malformed file are rejected without changing stored data.
- **Confirmed reset.** A two-step inline confirmation clears learning tables and recreates default settings while preserving the interface language.
- **PWA and offline.** A static web manifest (name, RTL metadata, standalone display, 192/512/maskable icons) and a generated service worker that precaches the 81 exported files it serves (the worker excludes itself) under one fingerprinted cache. Network-first navigation falls back to the cached page, then to `/offline/`. The worker never caches runtime responses, so learner data cannot leak into Cache Storage. Registration is skipped inside the Capacitor shell, where assets already ship in the APK.
- Arabic RTL and English LTR throughout, including English terms inside Arabic copy.
- Accessible navigation and status announcements: `aria-current`, disclosure semantics on small screens, Escape to close, skip link, `role="progressbar"`, and `role="status"` for storage and data actions.
- Static export and Capacitor packaging: a rebuilt debug APK is structurally verified (package, version, signature, bundled routes, generated worker).

## What is deliberately not built

- The spaced-repetition engine. Review records and due dates exist, but no FSRS scheduler, review session UI, or grading loop ships yet.
- Answerable exercises. The exercise-attempt table exists for the later phases; the lesson screen does not claim to grade anything.
- A real curriculum. The two lessons and six units remain illustrative fixtures, clearly labelled as sample content.
- Speech synthesis and speech recognition.
- Release signing. Only a debug APK exists; it must not be published.
- Account, sync, analytics, and any remote service — out of scope by requirement.

## Project structure

```text
src/
  app/                 App Router: root layout, landing page, (app) route group, offline, 404, icon
  components/
    layout/            Site header/footer for the landing page; AppShell/AppHeader/AppFooter
    pwa/               Service-worker registrar (web only, skipped in Capacitor)
    ui/                Brand mark, language switch, page headers, cards, badges, progress
  features/
    landing/           Landing sections
    dashboard/         Dashboard screen (reads persisted summary)
    levels/            Level browser
    lesson/            Lesson reader with persisted start/save-word/complete actions
    settings/          Settings, goals, backup/import/reset, PWA and about sections
  content/             Bilingual copy and sample curriculum (app.ts, sample.ts, landing.ts)
  lib/
    config/            Product constants and version
    db/                Dexie database v2, schemas, validation, errors, backup, availability
      repositories/    settings, lessonProgress, activity, vocabulary, exercises, reviews, summary
    domain/            Pure types and functions (locale, CEFR, localization, curriculum, records)
  providers/           Client providers (interface language + settings mirror)
  styles/              Design tokens, shell/screen styles, Bootstrap base
scripts/               Static preview, image/worker generation, APK helper, export normalizer
tests/                 Vitest suites: domain, content, persistence/migration/backup (37 tests)
docs/                  Architecture, Android, PWA, phases, verification, attributions
legacy-prototype/      Archived Vite prototype, not part of the build
android/               Capacitor Android project (generated, committed)
dist-apk/              Built debug APK (generated, ignored by lint)
```

## Architecture in one paragraph

Routes compose features; features render components and read content; pure domain logic (levels, locale, records, localization, curriculum shapes) has no React or database imports; persistence is isolated behind `lib/db` repositories, so screens never talk to IndexedDB directly. Writes that must stay consistent — completing a lesson, importing a backup, resetting data — run inside one Dexie transaction. The web build is a static export, and Capacitor wraps the same `out/` directory as a native Android app, so there is no second implementation to keep in sync. Full details, schema, and the service-worker policy are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Sample data and honesty rules

- Every screen that displays fabricated *lesson text* carries a visible “sample content” notice.
- The dashboard, settings counts, progress bars, and plan badges are computed from stored records, not hard-coded.
- Capabilities that do not exist yet are marked “not available yet”; nothing pretends to grade an answer or schedule a review.
- The app does not award a CEFR certificate; levels are a way to choose content.
- The two sample lessons are original content written for this project and are not a substitute for a curriculum.

## Data, privacy, and cost

- Interface language is stored in `localStorage` under `mem.locale` so the pre-paint script can apply `lang`/`dir` before rendering. It is mirrored into the IndexedDB settings record.
- IndexedDB database `my-english-mastery`, schema v2, holds `settings`, `lessonProgress`, `activity`, `vocabulary`, `exercises`, and `reviews`. The legacy `preferences` store is retained only so the v1→v2 upgrade can read the old locale; no v2 code writes to it.
- Backups never leave the device unless the learner copies or downloads the generated file. The app has no upload path.
- The service worker precaches **public build files only**. It does not cache responses fetched at runtime, so rendered learner data is not written into Cache Storage.
- No registration, no analytics, no third-party requests, no API keys, no paid hosting or AI service.
- The Android build bundles all web assets in the APK; it does not load the app from a remote server.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layers, dependency rules, v2 schema, backup format, service-worker policy, RTL approach, decisions.
- [`docs/ANDROID.md`](docs/ANDROID.md) — Android toolchain, APK build, installation, updates, and the runtime checklist.
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md) — exact commands and results, browser/offline evidence, APK inspection, and unverified items.
- [`docs/PWA-PLAN.md`](docs/PWA-PLAN.md) — implemented PWA behaviour, browser constraints, and what remains.
- [`docs/PHASES.md`](docs/PHASES.md) — completed phases and the remaining roadmap.
- [`docs/ATTRIBUTIONS.md`](docs/ATTRIBUTIONS.md) — licences, generated artwork, and content policy.

## Limitations

- **Android runtime is not verified on a device or emulator.** The 0.2.0 APK is built, debug-signed, and its manifest, signature, and bundled assets were inspected, but `adb devices` returned no device and the emulator needs Windows Hypervisor Platform enabled (administrator rights plus a reboot). See [`docs/ANDROID.md`](docs/ANDROID.md#verification-status).
- **Mobile-width layout (< 992 px) is not visually verified.** The test browser window was fixed at 1000 px. Desktop rendering and the navigation state machine were exercised.
- **Offline link prefetches log expected failures.** With the server stopped, Next.js link prefetch requests fail (the local proxy answers 502) and appear in the console even though cached pages render and navigate correctly.
- **PWA install was verified structurally, not by completing an OS install dialog.** Manifest, icons, active worker, cache contents, and offline navigation were checked; current Lighthouse has no PWA category.
- **Service-worker updates are unprompted.** A new build activates immediately (`skipWaiting` + `clients.claim`) and deletes old caches. A learner is not interrupted mid-action, but there is no “new version ready” prompt yet.
- **No persistent-storage request.** `navigator.storage.persist()` is not called yet, so the browser may evict data under storage pressure; export is the current safeguard.
- Browser speech voices and speech recognition are OS/browser dependent and not implemented.
- An AI conversation tutor is not included and cannot be guaranteed offline for free. No mock tutor exists.
- The interface-language preference is applied after hydration, so a stored English preference may briefly show Arabic on a very slow first paint. An inline script sets `lang`/`dir` before paint; the text swap follows hydration.
- Full Bootstrap RTL assets are not swapped at runtime; see the RTL note in the architecture document.
- Static hosting must supply security headers and a CSP; the app cannot set HTTP headers from a static export. The inline locale script will need a nonce or hash when a CSP is added.
- The debug APK is signed with the public Android debug key. Release signing is not configured, and the debug APK must not be distributed.

## Licence

No licence has been chosen for the application code yet. Third-party components retain their own licences, documented in [`docs/ATTRIBUTIONS.md`](docs/ATTRIBUTIONS.md).
