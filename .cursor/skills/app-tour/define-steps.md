# app-tour — Define steps (storyboard workflow)

Use when integration exists and the user wants a **recording demo script** as `TourStep[]`.

**Do not jump to code.** Collect a storyboard first, confirm with the user, then implement.

## Phase 1 — Storyboard interview

Gather answers in order. Use `AskQuestion` when available; otherwise ask in one compact message. Skip questions already answered in chat.

### A. Demo intent (why / who)

1. **One-line goal** — What should the viewer understand or do after watching? (e.g. "Show how to create a project in 60s")
2. **Audience** — Internal team, investors, docs, social clip?
3. **Tone** — Formal walkthrough vs casual narrated demo?
4. **Length** — Target duration or max step count? (default: 5–10 beats for a short demo)

### B. Stage (where)

5. **Pages / routes** — Single screen or multi-page? List paths (e.g. `/`, `/settings`).
6. **Entry point** — Where does the tour start (hero, dashboard, empty state)?
7. **Cross-page beats** — Any step that navigates on Next? → needs host **routing adapter** + `onStepComplete` / `onStepActive` + optional `pageRevealMs`. See `src/common/app-tour/README.md` § Cross-page tours. Agent creates `navigate.ts` (or equivalent) in the **host app**, not inside the copied module.

### C. Beats (what to highlight)

For **each beat**, collect (repeat until the story is complete):

| Field | Question |
|-------|----------|
| **Beat name** | Short label (becomes step id slug) |
| **UI target** | Component/selector/description ("search input", "Plans dropdown") |
| **Narration** | Tooltip title + 1–2 sentence description (what the presenter says) |
| **Action** | `none` · `autoFill` · `select` · `click` · `open-dialog/sheet` · `pointer-only` |
| **Action detail** | Text to type, option value/label, button to click, dialog trigger id |
| **Placement** | Tooltip side: top / bottom / left / right (optional) |
| **Portal?** | Is target inside Dialog/Sheet/Drawer after opening? |

### D. Production notes

8. **Trigger** — Button label, nav item, keyboard shortcut?
9. **Progress** — Show "N / M" in tooltip? (`showProgress: true`)
10. **Skip / branch** — Optional steps or conditional paths?
11. **Cleanup** — Close dialogs after step? (`onStepComplete` click close button)
12. **Tour id** — Name if multiple tours (`playground`, `onboarding`, …)

### Storyboard output template

Present this table to the user **before coding** and wait for approval (or explicit "go ahead"):

```markdown
## Tour storyboard: [name]

**Goal:** …
**Routes:** …
**Steps:** N

| # | id | Target | Tooltip (title) | Effect | Notes |
|---|-----|--------|-----------------|--------|-------|
| 1 | hero | `[data-app-tour=hero]` | Welcome… | none | opening |
| 2 | search | search input | Try search… | autoFill "…" | pointer optional |
| … | … | … | … | … | prepare+portal if dialog |
```

Add a **markup plan** section listing every `data-app-tour` attribute to add/verify in JSX.

## Phase 2 — Map beats → StepOperation

| Storyboard action | StepOperation |
|-------------------|---------------|
| none / pointer-only | `tooltip` + optional `pointer: {}` |
| type text | `autoFill: { text, delayMs?, pointerOffset? }` — target must be input/textarea |
| pick select option | `select: { value \| label, pointer? }` on trigger |
| click on reveal | `click: { when: "active", pointer? }` |
| click on Next | `click: { when: "complete", pointer? }` |
| open overlay first | `prepare: { click: "<trigger stepId or selector>", settleMs? }` + `highlight: tourTargetInShadcnPortal(...)` |
| route change | `onStepComplete` / `onStepActive` via host routing adapter + next step `pageRevealMs` if needed |

Rules:
- `stepId` === `data-app-tour` value (convention).
- Chain with `nextStep` / `previousStep`; last step `nextStep: null`.
- Dialog/sheet close in `onStepComplete` when recording needs a clean frame.
- Import portal helpers from `@/common/app-tour` when needed.

## Phase 3 — Implement

1. Create or update step file (e.g. `src/demo/my-tour.ts` or user-specified path).
2. Add `data-app-tour` to components listed in markup plan.
3. Register steps in `GuideProvider` (`steps` or `tours`).
4. Add/update tour trigger UI.
5. **Cross-page:** add host `navigate.ts` adapter for the project's router; copy pattern from upstream `src/demo/cross-page-tour.ts`.

## Phase 4 — Review with user

Deliver:
- Link to step definition file
- List of JSX files touched for `data-app-tour`
- How to start the tour
- Suggested manual recording pass (order of narration)

Ask if they want timing tweaks (`delayMs`, `highlightTransitionMs`, `pageRevealMs`).

## Example storyboard → steps (abbreviated)

**Goal:** Show app-tour features in 90s.

| id | Effect |
|----|--------|
| hero | tooltip only |
| search | autoFill |
| plan-select | select `pro` |
| counter | pointer + click on Next |
| dialog-field | prepare + portal autoFill |
| finish | tooltip, `nextStep: null` |

Full reference: `src/demo/playground-tour.ts`.
