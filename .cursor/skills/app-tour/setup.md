# app-tour — Setup workflow

**Agent executes this workflow** in the user's host project after `gh skill install`. Do not tell the user to copy files by hand unless degit/network fails.

## Checklist

```
Setup progress:
- [ ] 0. Confirm host paths + integration mode
- [ ] 1. degit app-tour module (agent runs)
- [ ] 2. npm install deps
- [ ] 3. Path aliases + shadcn (if default UI)
- [ ] 4. CSS theme variables
- [ ] 5. GuideProvider + minimal steps
- [ ] 6. data-app-tour on first target
- [ ] 7. startTour trigger
- [ ] 8. Smoke test
```

## Step 0 — Host layout

Detect:

| Check | Default |
|-------|---------|
| Module destination | `src/common/app-tour` |
| Import alias | `@/` → `src/` |
| Router | React Router / Next.js / other (needed later for cross-page) |

Ask only if ambiguous (monorepo, no `src/`, etc.).

## Step 1 — degit (agent runs)

If `src/common/app-tour` is **missing**, fetch from upstream:

```bash
npx degit hajimism/app-tour/src/common/app-tour src/common/app-tour
```

- Copy the **entire** directory (core, headless, ui, tests, README, SETUP).
- If `degit` unavailable: `npx degit` usually works; fallback `git clone --depth 1` + copy subtree.
- If directory **already exists**, skip degit; offer to refresh only if user asks.

After copy, module docs live at `src/common/app-tour/README.md`.

## Step 2 — npm deps

In host project root:

```bash
npm install @onboardjs/core @onboardjs/react lucide-react
```

OnboardJS is RC — mention if user targets production.

## Step 3 — Integration mode

| Mode | Use when |
|------|----------|
| **A. GuideProvider (default UI)** | shadcn + `@/common/ui` present or user wants default tooltip |
| **B. Headless** | No shadcn; custom UI |
| **C. renderTooltip** | shadcn exists; custom tooltip only |

Mode A needs `@/common/ui/button`, `@/common/ui/popover`, `@/common/lib/cn`. Install shadcn components if missing.

## Step 4 — CSS variables

Add to host `:root` / `.dark`:

```css
--app-tour-overlay-color: oklch(0.17 0 0 / 0.55);
--app-tour-pointer-color: oklch(0.2 0.012 285);
--app-tour-pointer-pulse-color: var(--primary);
```

Tailwind v4: `@theme inline` `--color-app-tour-*` (see upstream `src/index.css` in hajimism/app-tour).

## Step 5 — GuideProvider

Wire at **root layout** (required for cross-page tours):

```tsx
"use client"; // Next.js App Router

import { GuideProvider, type TourStep } from "@/common/app-tour";

const steps: TourStep[] = [
  { id: "hero", operation: { tooltip: { title: "Hello" } }, nextStep: null },
];

<GuideProvider steps={steps} config={{ showProgress: true }}>
  {children}
</GuideProvider>
```

## Step 6–7 — Target + trigger

```tsx
<section data-app-tour="hero">…</section>

const { startTour, isRunning } = useTour();
<button type="button" onClick={() => void startTour()} disabled={isRunning}>
  Start tour
</button>
```

## Step 8 — Cross-page prep (if multi-route demo planned)

Copy or author a **routing adapter** in the host app (not inside `app-tour/`):

- Upstream reference: `src/demo/navigate.ts` + `cross-page-tour.ts` from hajimism/app-tour
- Wrap framework navigate + `waitForRoutePaint`
- See README § **Cross-page tours**

## Step 9 — Smoke test

1. Dev server → start tour → spotlight on `hero`.
2. Optional: `npx vitest run src/common/app-tour`.

## Done message

Tell user:

- degit destination path,
- where steps will live,
- how to start the tour,
- offer **Define steps** (storyboard) next.
