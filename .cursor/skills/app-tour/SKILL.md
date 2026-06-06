---
name: app-tour
description: >-
  Install app-tour via degit into a React/shadcn prototype and define screen-recording
  demo tour steps. Use after `gh skill install` for app-tour, or when the user mentions
  app-tour, guide tour, degit, product demo walkthrough, tour steps, data-app-tour,
  GuideProvider, cross-page tour, or scripting a UI recording flow.
---

# app-tour

**Typical entry:** user runs `gh skill install` (or equivalent) for this skill in a **host prototype** that does not yet contain app-tour. The agent reads this skill and **executes setup** — including degit — then optionally defines tour steps.

## Flow overview

```
gh skill install  →  user asks agent to set up / define tour
                           ↓
                    read this skill
                           ↓
              ┌────────────┴────────────┐
              │                         │
         Setup (degit + wire)     Define steps (storyboard)
              │                         │
              └────────────┬────────────┘
                           ↓
                    working demo tour
```

| Workflow | When | Doc |
|----------|------|-----|
| **Setup** | Fresh host project, or no `src/common/app-tour` | [setup.md](setup.md) — **agent runs degit** |
| **Define steps** | Module already integrated | [define-steps.md](define-steps.md) — storyboard first |

Default: **Setup first** if `src/common/app-tour` is missing. If user only wants steps and module exists, skip to Define steps.

## Router (always start here)

1. **Detect host state** — does `src/common/app-tour/` exist? Is `GuideProvider` wired? Any `*tour*.ts`?
2. **Confirm intent** if unclear: setup only · define steps · both.
3. **Run setup.md end-to-end** when module missing (do not ask the user to degit manually unless degit fails).
4. **Run define-steps.md** when user wants a tour script.
5. **API reference** (after copy): `src/common/app-tour/README.md`, checklist `SETUP.md`.
6. **Upstream examples** (fetch or read from GitHub if not copied yet): `hajimism/app-tour` → `src/demo/playground-tour.ts`, `cross-page-tour.ts`, `navigate.ts`.

## Shared rules

- Module is **not npm** — agent copies via degit into `src/common/app-tour` (adjust if host uses a different `src` layout).
- Every highlight: `data-app-tour="{stepId}"` unless `operation.highlight` overrides.
- Recording defaults: `allowOverlayClose: false`, `showStepErrors: true`.
- One step effect per step (autoFill → select → click(active) → pointer).
- **Cross-page:** routing is **host responsibility** — adapter + `onStepComplete` / `onStepActive` / `pageRevealMs`. See README § Cross-page tours.
- Run `npx vitest run src/common/app-tour` only after editing module internals.

## Language

Match the user's language for questions and summaries. Tooltip copy follows the storyboard language.
