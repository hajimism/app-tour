# app-tour

A **screen-recording demo tour** module for React prototypes. Combine spotlight highlights, tooltips, auto-fill typing, pointer animations, and declarative clicks to script product demos for capture.

This is **not an npm package** — copy `src/common/app-tour` into your project. It is optimized for degit + shadcn prototypes and screen recording, not production onboarding SaaS.

---

## Features

- **Three-layer architecture** — `core` (pure functions) → `headless` (hooks) → `ui` (React components)
- **React-native UI** — default tooltip uses shadcn Popover + Button; content is `ReactNode`
- **Recording-friendly defaults** — `allowOverlayClose: false` so accidental overlay taps do not dismiss the tour
- **SPA-aware DOM waiting** — `MutationObserver` + polling for lazily mounted targets (default 5s timeout)
- **React controlled input autoFill** — native value setter + `input` events, one character at a time
- **Pointer overlay** — Lucide cursor + ripple during autoFill or when `pointer` is configured
- **Step flow** — conditions, skip, dynamic `nextStep` / `previousStep` via [OnboardJS](https://github.com/onboardjs/onboardjs) (RC)
- **Accessibility** — `aria-describedby`, `aria-live`, focus trap, keyboard navigation
- **Structured error handling** — typed failure phases, on-screen retry banner, tour start failure reporting

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  GuideProvider (ui)                                     │
│  ├─ OnboardingProvider (@onboardjs/react)  ← state machine│
│  ├─ TourProvider (headless)                ← start/stop  │
│  └─ GuideLayer                             ← overlay/UI  │
│       ├─ useStepGuide (headless)           ← step runner │
│       ├─ HighlightOverlay (ui)                           │
│       ├─ GuideTooltip (ui)                               │
│       ├─ GuideStepError (ui)                             │
│       └─ Pointer (ui)                                    │
└─────────────────────────────────────────────────────────┘
         ▲
         │ TourStep[] + StepOperation
         │
┌────────┴────────┐
│  core/          │  waitUntil, autoFill, resolve-*, core/step/ …
└─────────────────┘
```

### Step execution flow

1. `startTour()` → `TourEngineBridge` resets OnboardJS and navigates to the first step
2. `useStepGuide` receives `stepActive` → runs `runStepSequence`
3. `resolveStepTarget` — optional `prepare` click → wait for highlight → `scrollIntoView`
4. Pre-flight checks — `validateAutoFillTarget` before showing UI; conflicting effects warned when `debug: true`
5. `TARGET_READY` — spotlight + tooltip rendered
6. `runStepEffects` — after `highlightTransitionMs` (0 on first step): autoFill / select / click(active) / pointer
7. User clicks Next → `runCompleteClick` (`when: "complete"`) → OnboardJS `next()` → `onStepComplete` → next step

Pure orchestration lives in `core/step/`. `useStepGuide` subscribes to the engine and dispatches reducer actions.

`runStepSequence` returns an honest result:

```ts
type RunStepSequenceResult =
  | { status: "aborted" }
  | { status: "failed"; stepId: string; phase: StepErrorPhase; error: unknown }
  | { status: "ready"; stepId: string; activatedStep: true };
```

---

## Installation

### 1. Copy the module

```bash
# Example: fetch from this repo via degit
degit hajimism/app-tour/src/common/app-tour src/common/app-tour
```

Copy the entire `src/common/app-tour` directory (including tests). See [SETUP.md](./SETUP.md) for a full checklist.

### 2. Add npm dependencies

```bash
npm install @onboardjs/core @onboardjs/react lucide-react
```

OnboardJS is **release candidate** in this repo (`@onboardjs/core@^1.0.0-rc.4`, `@onboardjs/react@^1.0.0-rc.5`). Expect API churn if you adopt it in production.

### 3. shadcn UI (default tooltip)

`GuideTooltip` imports from `@/common/ui`:

- `button`
- `popover` (uses `@base-ui/react/popover` internally)

If you use a different UI stack, replace the tooltip via [`renderTooltip`](#custom-tooltip) or go [headless](#headless-mode).

### 4. Theme CSS variables

`ui/app-tour.css` is imported automatically by `GuideProvider`. Add these to `:root` / `.dark` (see this repo's `src/index.css`):

```css
:root {
  --app-tour-overlay-color: oklch(0.17 0 0 / 0.55);
  --app-tour-pointer-color: oklch(0.2 0.012 285);
  --app-tour-pointer-pulse-color: var(--primary);
}
```

Tailwind v4 — map in `@theme inline`:

```css
@theme inline {
  --color-app-tour-pointer-color: var(--app-tour-pointer-color);
  --color-app-tour-pointer-pulse-color: var(--app-tour-pointer-pulse-color);
  --color-app-tour-overlay-color: var(--app-tour-overlay-color);
}
```

### 5. Path alias

`guide-tooltip.tsx` imports `@/common/ui/*`. Configure Vite / tsconfig so `@` resolves to `src/`.

---

## Quick start

### 1. Define steps and mount the provider

```tsx
import { GuideProvider, queryTourTarget, type TourStep } from "@/common/app-tour";

const steps: TourStep[] = [
  {
    id: "hero",
    operation: {
      tooltip: {
        title: "Welcome",
        description: "A demo tour for your prototype.",
        placement: "bottom",
      },
    },
    nextStep: "search",
  },
  {
    id: "search",
    operation: {
      tooltip: { title: "Search", placement: "left" },
      autoFill: { text: "Q3 review", delayMs: 80 },
    },
    previousStep: "hero",
    nextStep: "counter",
  },
  {
    id: "counter",
    operation: {
      tooltip: { title: "Counter", placement: "top" },
      pointer: {},
    },
    onStepComplete: () => queryTourTarget("counter")?.click(),
    previousStep: "search",
    nextStep: null,
  },
];

createRoot(document.getElementById("root")!).render(
  <GuideProvider steps={steps}>
    <App />
  </GuideProvider>,
);
```

### 2. Mark targets with `data-app-tour`

```tsx
<section data-app-tour="hero">…</section>
<input data-app-tour="search" type="search" />
<button data-app-tour="counter">Count</button>
```

When `operation.highlight` is omitted, `[data-app-tour="{stepId}"]` is used automatically.

### 3. Start the tour

```tsx
import { useTour } from "@/common/app-tour";

function StartButton() {
  const { isRunning, startTour } = useTour();

  if (isRunning) return null;

  return (
    <button type="button" onClick={() => void startTour()}>
      Start tour
    </button>
  );
}
```

---

## Defining steps

### `TourStep`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Step ID; conventionally matches `data-app-tour` |
| `operation` | `StepOperation` | Highlight, tooltip, and demo actions |
| `onStepComplete` | `() => void \| Promise<void>` | Runs after Next (e.g. simulate a click) |
| `onStepActive` | `() => void \| Promise<void>` | Runs when the step becomes active |
| `condition` | `(ctx: TourContext) => boolean` | Skip step when `false` |
| `isSkippable` | `boolean` | Show Skip button |
| `skipToStep` | `string \| null \| fn` | Destination when skipped |
| `nextStep` | `string \| null \| fn` | Next step ID; `null` ends the tour |
| `previousStep` | `string \| null \| fn` | Previous step ID |

Pass functions to `nextStep` / `previousStep` / `skipToStep` for dynamic routing with OnboardJS context.

---

## `StepOperation`

```ts
interface StepOperation {
  highlight?: HighlightTarget;
  prepare?: PrepareSpec;         // open Dialog/Sheet before highlight
  tooltip?: TooltipSpec;
  autoFill?: AutoFillSpec;
  select?: SelectSpec;           // shadcn Select
  click?: ClickSpec;             // declarative click
  pointer?: PointerSpec;
  effectsDelayMs?: number;
  scrollIntoView?: boolean;
  allowOverlayClose?: boolean;
  overlayClickBehavior?: "close" | "nextStep" | OverlayClickHandler;
}
```

### Step effects (mutually exclusive)

Only **one** of these runs per step, in priority order:

1. `autoFill`
2. `select`
3. `click` with `when: "active"`
4. `pointer`

`click` with `when: "complete"` runs separately when the user clicks Next.

When `config.debug` is `true`, configuring multiple effects logs a console warning naming which effect wins.

### Highlight targets (`HighlightTarget`)

```ts
type HighlightTarget =
  | string                        // CSS selector
  | HTMLElement                   // DOM element
  | (() => HTMLElement | null); // resolver for lazy mounts
```

```tsx
// Selector
operation: { highlight: "#search-input", tooltip: { … } }

// Resolver
operation: {
  highlight: () => document.querySelector<HTMLElement>("[data-state=open]"),
  tooltip: { … },
}
```

**Waiting behavior** (`waitUntil` primitive, wrapped by `wait-for-element`, etc.):

| Target kind | Strategy | Default timeout |
|-------------|----------|-----------------|
| Selector | `MutationObserver` + 100ms poll | `elementWaitTimeoutMs` (5000ms) |
| `HTMLElement` | Wait until `isConnected` | same |
| Resolver fn | 100ms poll until non-null + connected | same |

Override per call via `options.timeoutMs` on `waitForHighlightTarget`, `waitForClickTarget`, `waitForTourTarget`. Global defaults come from `resolveAppTourConfig(config)`.

### Tooltip (`TooltipSpec`)

```tsx
operation: {
  tooltip: {
    title: "Title",              // ReactNode
    description: "Body copy",    // ReactNode; `text` shorthand also works
    placement: "bottom",         // top | bottom | left | right
    align: "start",              // start | center | end
    alignOffset: 0,
    showProgress: true,          // "1 / 4" counter
    buttons: {
      next: "Next",
      previous: "Back",
      firstNext: "Start!",
      lastNext: "Done!",
      skip: "Skip",
    },
  },
}
```

If `tooltip` is omitted or has no title/description content, only the spotlight is shown.

### autoFill (React controlled inputs)

```tsx
operation: {
  autoFill: {
    text: "hello world",
    delayMs: 60,                    // per character; default from config (60ms)
    focusFirst: true,               // focus + click before typing
    pointerOffset: { x: 0, y: 8 },  // show pointer while typing
  },
}
```

- Target must be **`HTMLInputElement` or `HTMLTextAreaElement`**
- Validated **before** the tooltip appears; misconfigured steps fail without flashing UI
- `react-type.ts` sets the native value and fires `input` so controlled components update
- Input is blurred when autoFill finishes

### pointer

```tsx
operation: {
  pointer: {
    offset: { x: 10, y: -5 },  // px from target center
  },
}
```

Override effect start timing with `effectsDelayMs` (step) or `stepEffectsDelayMs` (global). `0` starts immediately.

### prepare (open Dialog / Sheet)

Runs **before** resolving the highlight. Pair with portal helpers for portaled content.

```tsx
import { tourTargetInShadcnPortal } from "@/common/app-tour";

{
  id: "dialog-field",
  operation: {
    prepare: { click: "open-settings", settleMs: 300 },
    highlight: tourTargetInShadcnPortal("dialog-field", "dialogContent"),
    autoFill: { text: "Acme Corp" },
    tooltip: { title: "Company name", placement: "right" },
  },
}
```

- `prepare.click` — CSS selector, `data-app-tour` id, or resolver function
- `prepare.settleMs` — wait after click (default `defaultPrepareSettleMs` → 300ms)

### shadcn portal helpers

| Export | Purpose |
|--------|---------|
| `SHADCN_PORTAL_SLOTS` | Slot names: `dialogContent`, `sheetContent`, `selectContent`, … |
| `queryOpenShadcnPortal(slot)` | Topmost `[data-slot="…"]` element |
| `tourTargetInShadcnPortal(stepId, slot)` | Resolver for `[data-app-tour]` inside a portal |
| `waitForOpenShadcnPortal(slot)` | Wait for portal to appear |
| `shadcnSelectOptionTarget(value)` | Resolver for an open Select option |

### click (declarative)

```tsx
{
  id: "counter",
  operation: {
    pointer: {},
    click: { when: "complete" },  // default: fires on Next
    tooltip: { title: "Counter", placement: "top" },
  },
}
```

| Field | Description |
|-------|-------------|
| `when` | `"active"` (on step show) or `"complete"` (on Next, **default**) |
| `target` | Click target (defaults to highlight element) |
| `pointer` | Show pointer before clicking |
| `pointerOffset` / `pointerDelayMs` | Pointer position and dwell time |
| `delayMs` | Extra wait before `.click()` |

Active click example:

```tsx
operation: {
  click: { when: "active", pointer: true },
  highlight: '[data-app-tour="enable-feature"]',
}
```

### select (shadcn Select)

Highlight target is the **Select trigger** (`data-app-tour` on the trigger).

```tsx
{
  id: "plan-select",
  operation: {
    select: { value: "pro", pointer: true },
    tooltip: { title: "Choose a plan" },
  },
}
```

- `value` — match `[data-value]` on the option
- `label` — match visible text with `match: "label"`
- Flow: trigger click → wait for `select-content` portal → wait for option → option click

### `onStepComplete`

Runs after Next. Can be combined with `operation.click` (click first, then handler).

```tsx
onStepComplete: async () => {
  router.push("/settings");
},
```

### `pageRevealMs` (reveal page after navigation)

On the step **after** a route change, hide overlay/tooltip briefly so the new page is visible on recording.

```tsx
{
  id: "settings-intro",
  pageRevealMs: 1000,
  onStepActive: () => router.push("/settings"),
  operation: { tooltip: { title: "Settings" } },
}
```

Global default: `config.defaultPageRevealMs`. Per-step `pageRevealMs` wins.

---

## Configuration (`AppTourConfig`)

Pass via `GuideProvider`'s `config` prop. Defaults are resolved by `resolveAppTourConfig()` (also exported for use outside React).

```tsx
import { resolveAppTourConfig } from "@/common/app-tour";

const config = resolveAppTourConfig({ elementWaitTimeoutMs: 8000 });
```

```tsx
<GuideProvider
  steps={steps}
  config={{
    debug: false,
    defaultScrollIntoView: true,
    defaultAutoFillDelayMs: 60,
    defaultPrepareSettleMs: 300,
    elementWaitTimeoutMs: 5000,
    highlightTransitionMs: 400,
    overlayFadeInMs: 300,
    scrollSettleMs: 300,
    showProgress: false,
    allowOverlayClose: false,
    blockOverlayInteraction: false,
    overlayClickBehavior: "close",
    showStepErrors: true,
    onStepError: ({ stepId, phase, error }) => {
      console.error(stepId, phase, error);
    },
    onTourComplete: ({ duration }) => {
      console.log(`Tour finished in ${duration}ms`);
    },
  }}
>
  …
</GuideProvider>
```

| Option | Default | Description |
|--------|---------|-------------|
| `debug` | `false` | Log step activation; warn on conflicting step effects |
| `allowOverlayClose` | `false` | Dim overlay clicks close or advance the tour |
| `blockOverlayInteraction` | `false` | Block pointer events on dim area without closing |
| `overlayClickBehavior` | `"close"` | `"close"` \| `"nextStep"` \| custom handler |
| `elementWaitTimeoutMs` | `5000` | Highlight / portal wait timeout |
| `defaultPrepareSettleMs` | `300` | Wait after prepare click |
| `showStepErrors` | `true` | Show `GuideStepError` banner on failure |
| `defaultScrollIntoView` | `true` | Scroll highlight into view each step |
| `defaultAutoFillDelayMs` | `60` | autoFill character interval |
| `highlightTransitionMs` | `400` | Spotlight animation duration |
| `stepEffectsDelayMs` | first step `0`, then `highlightTransitionMs` | Delay before effects start |
| `scrollSettleMs` | `300` | Wait after scroll |
| `showProgress` | `false` | Show "N / M" in tooltip |
| `defaultPageRevealMs` | `0` | Global default for `pageRevealMs` |

### Overlay interaction modes

- **`allowOverlayClose: false` (default)** — SVG dim uses `pointer-events: none`; clicks pass through to the page. Safe for recording.
- **`blockOverlayInteraction: true`** — Transparent panels block clicks on the dim area. Independent of `allowOverlayClose`.
- **`allowOverlayClose: true`** — Dim clicks invoke `close`, `nextStep`, or a custom handler.

---

## Custom tooltip

Replace the default shadcn tooltip:

```tsx
<GuideProvider
  steps={steps}
  renderTooltip={(props) => (
    <MyTooltip
      title={props.tooltip?.title}
      onNext={props.onNext}
      onPrevious={props.onPrevious}
      onClose={props.onEscape}
      progress={props.progress}
    />
  )}
/>
```

`RenderTooltipProps` includes full `viewState` (anchorEl, stepId, navigation flags) and callbacks.

### Headless mode

Build UI from scratch with `TourProvider` + `useStepGuide` + `OnboardingProvider`. See [SETUP.md](./SETUP.md).

```tsx
import { TourProvider, useTour, useStepGuide } from "@/common/app-tour";
```

Use `viewState` from `useStepGuide` to render overlay, tooltip, and pointer yourself.

---

## Advanced step flow

### Conditional steps

```tsx
{
  id: "premium-feature",
  condition: (ctx) => ctx.user?.plan === "pro",
  operation: { tooltip: { title: "Pro only" } },
  nextStep: "next",
}
```

### Skip

```tsx
{
  id: "optional",
  isSkippable: true,
  skipToStep: "final",
  operation: { tooltip: { title: "Optional step" } },
  nextStep: "detailed",
}
```

### Dynamic `nextStep`

```tsx
{
  id: "branch",
  operation: { tooltip: { title: "Choose path" } },
  nextStep: (ctx) => (ctx.flags?.useAlt ? "alt-step" : "default-step"),
}
```

### Cross-page tours (routing)

**app-tour is routing-agnostic.** It has no React Router / Next.js / Remix APIs — only async hooks on `TourStep` and DOM waiting after navigation.

| Hook | When | Typical use |
|------|------|-------------|
| `onStepComplete` | After Next | Navigate **forward** to the next page |
| `onStepActive` | Step becomes active | Sync route on **Previous** (and when landing on a step) |
| `pageRevealMs` | Before highlight on that step | Hide overlay briefly so the new page is visible on recording |

After a client-side route change, `runStepSequence` waits for highlight targets via `waitUntil` / `elementWaitTimeoutMs` (default 5s). Full page reloads are not supported — use SPA client navigation.

#### Host requirements (every framework)

1. **`GuideProvider` survives route changes** — mount on root layout, not on a single page component.
2. **`data-app-tour` on each route** — steps on `/settings` need markup on that page.
3. **Previous sync** — set `onStepActive` on every step to the route where its targets live. Missing this causes `wait` errors when going back.
4. **Thin routing adapter in the host app** — one small file that wraps your router’s navigate + a paint wait.

#### Routing adapter pattern

The demo ships a React Router adapter (`src/demo/navigate.ts` in the app-tour repo):

```ts
export async function waitForRoutePaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  await new Promise<void>((resolve) => queueMicrotask(resolve));
}

export function createRouteHandler(navigate: (path: string) => void, path: string) {
  return async () => {
    navigate(path);
    await waitForRoutePaint();
  };
}
```

Use it in step definitions:

```tsx
// React Router — factory receives useNavigate()
const route = (path: string) => createRouteHandler(navigate, path);

{
  id: "nav-to-settings",
  onStepActive: route("/"),
  onStepComplete: route("/settings"),  // runs on Next
  operation: { tooltip: { title: "Go to Settings" }, pointer: {} },
  nextStep: "settings-intro",
},
{
  id: "settings-intro",
  pageRevealMs: 1000,
  onStepActive: route("/settings"),
  operation: { tooltip: { title: "Settings" } },
  previousStep: "nav-to-settings",
},
```

**Framework-specific navigate** (same adapter shape, swap the navigate call):

| Framework | Navigate API | `GuideProvider` mount |
|-----------|--------------|------------------------|
| React Router | `useNavigate()` from `react-router-dom` | `<BrowserRouter>` layout / root |
| Next.js App Router | `useRouter().push()` from `next/navigation` | Root or segment `layout.tsx` (`"use client"`) |
| TanStack Router | `router.navigate({ to: '…' })` | Router layout route |
| Remix | `useNavigate()` from `@remix-run/react` | Root layout |

Full example: `src/demo/cross-page-tour.ts` in the [app-tour](https://github.com/hajimism/app-tour) repository.

When copying the module into another project, copy or rewrite `navigate.ts` (or equivalent) **in the host app** — it is not part of `src/common/app-tour`.

---

## Keyboard and accessibility

| Key | Action |
|-----|--------|
| `Escape` | End tour (`stopTour`) |
| `ArrowRight` | Next (ignored while typing in an input) |
| `ArrowLeft` | Previous (not on first step; ignored while typing) |
| `Tab` | Focus trap inside tooltip |

- Highlight target gets `aria-describedby` linking to tooltip description
- `aria-live="polite"` announces the title
- Tooltip uses `role="dialog"` + `aria-modal="true"`

---

## Error handling

Failures invoke `onStepError` with `{ stepId, phase, error }`.

When `showStepErrors: true` (default), `GuideStepError` offers **Retry**, **Dismiss**, and **End tour**.

Tour **start failures** (e.g. `goToStep` throws) also surface via `onStepError` and the same banner, even before `isRunning` becomes true.

| `phase` | When |
|---------|------|
| `wait` | Highlight target not found within timeout |
| `prepare` | `prepare.click` failed or timed out |
| `autoFill` | Target is not input/textarea, or typing failed |
| `select` | shadcn Select option not found |
| `click` | Declarative click failed |
| `onStepComplete` | Step completion handler threw (OnboardJS) |
| `engine` | OnboardJS engine error, or tour failed to start |

**UI behavior by phase:**

- `wait`, `prepare`, `autoFill` (config error) — tooltip never appears; step stops
- `select`, `click`, `autoFill` (runtime) — tooltip may flash briefly before the error banner
- `engine` — shown in banner; includes failed tour start

---

## Theming

### Tooltip design tokens

`ui/app-tour.css` bridges shadcn theme variables. Defaults fall back to `--popover`, etc.

| Token | Default | Use |
|-------|---------|-----|
| `--app-tour-tooltip-bg` | `var(--popover)` | Background |
| `--app-tour-tooltip-fg` | `var(--popover-foreground)` | Title |
| `--app-tour-tooltip-muted-fg` | `var(--muted-foreground)` | Description, progress |
| `--app-tour-tooltip-border` | `var(--border)` | Border |
| `--app-tour-tooltip-radius` | `var(--radius)` | Corner radius |
| `--app-tour-tooltip-shadow` | `var(--shadow-md)` | Shadow |
| `--app-tour-tooltip-width` | `18rem` | Width |

### Other CSS variables

| Variable | Purpose |
|----------|---------|
| `--app-tour-overlay-color` | Dim overlay color |
| `--app-tour-pointer-color` | Pointer icon color |
| `--app-tour-pointer-pulse-color` | Ripple color |
| `--app-tour-z-overlay` | Overlay z-index (9998) |
| `--app-tour-z-tooltip` | Tooltip z-index (9999) |
| `--app-tour-z-pointer` | Pointer z-index (10000) |

Runtime overrides: `--app-tour-highlight-transition-ms`, `--app-tour-pointer-transition-ms`, `--app-tour-tooltip-fade-ms`

### Reduced motion

`prefers-reduced-motion: reduce` disables animations and ripple effects.

---

## Public API

Exported from `index.ts`:

```ts
// Components
GuideProvider
TourProvider
useTour
useStepGuide          // headless: viewState + navigation handlers

// Config
resolveAppTourConfig(config?)
ResolvedAppTourConfig // type

// Constants
APP_TOUR_TARGET_ATTR  // "data-app-tour"

// DOM helpers
queryTourTarget(stepId)
waitForTourTarget(stepId, options?)
resolveHighlightTarget(target, stepId)
waitForHighlightTarget(target, stepId, options?)
resolveClickTarget(highlightEl, target, stepId)
waitForClickTarget(highlightEl, target, stepId, options?)
queryOpenShadcnPortal(slot)
tourTargetInShadcnPortal(stepId, slot)
waitForOpenShadcnPortal(slot, options?)
shadcnSelectOptionTarget(value, match?)
SHADCN_PORTAL_SLOTS

// Types
TourStep, AppTourConfig, StepOperation, PrepareSpec, ClickSpec, SelectSpec, …
GuideProviderProps, RenderTooltipProps, StepGuideViewState, StepGuideError, PointerTarget
```

For custom UI, use `renderTooltip` (swap default components) or `useStepGuide` (full headless). Low-level DOM utilities in `core/libs/*` are importable from source when needed.

Internal orchestration (`runStepSequence`, `validateAutoFillTarget`, etc.) is not exported from `index.ts` but is tested and stable within the module.

---

## Project structure

```
app-tour/
├── index.ts                       # public entry
├── README.md
├── SETUP.md
├── core/
│   ├── adapters/onboardjs.ts         # TourStep → OnboardJS mapping
│   ├── constants.ts
│   ├── resolve-app-tour-config.ts    # default resolution
│   ├── report-step-error.ts
│   ├── types/                        # config, step-operation, overlay-click, view-state
│   ├── step/                         # pure step orchestration
│   │   ├── run-step-sequence.ts      # prepare → validate → highlight → effects
│   │   ├── run-step-effects.ts       # autoFill / select / click / pointer
│   │   ├── resolve-step-target.ts
│   │   └── validate-step-operation.ts
│   └── libs/                         # DOM utilities
│       ├── wait-until.ts
│       ├── step-click.ts
│       ├── step-select.ts
│       └── …
├── headless/
│   ├── tour-context.tsx              # TourProvider, TourEngineBridge, useTour
│   ├── use-step-guide.ts
│   ├── step-guide-state.ts
│   └── …
└── ui/
    ├── guide-provider.tsx            # imports app-tour.css
    ├── guide-tooltip.tsx
    ├── guide-step-error.tsx
    ├── highlight-overlay.tsx
    ├── pointer.tsx
    └── app-tour.css
```

---

## SSR / Next.js

`HighlightOverlay`, `GuideTooltip`, and `Pointer` return `null` when `document` is undefined. **Must be a Client Component.**

```tsx
"use client";

import { GuideProvider } from "@/common/app-tour";
```

---

## Testing

Vitest tests ship with the module (`*.test.ts`). After copying:

```bash
npx vitest run src/common/app-tour
```

**Covered (99 tests):**

- `core/libs` — `waitUntil`, highlight/click targets, autoFill, step-click, portals, tooltips, overlay click, aria
- `core/step` — `runStepSequence` (autoFill validation, success, select failure)
- `core/adapters` — OnboardJS mapping, meta validation
- `headless` — step guide reducer, tour context, keyboard, escape, popover reveal, element rect

**Not yet covered:**

- `useStepGuide` hook integration
- `run-step-effects` in isolation
- UI components (smoke / render tests)
- End-to-end browser tests

---

## Limitations

| Topic | Notes |
|-------|-------|
| OnboardJS RC | `@onboardjs/core` / `@onboardjs/react` may change before stable |
| Not an npm package | Updates are manual copy-merge; versioning is your responsibility |
| autoFill | `input` / `textarea` only — no `contenteditable` or native `<select>` |
| Step effects | One effect per step; first in priority order wins |
| Production onboarding | Out of scope; consider [driver.js](https://driverjs.com/) or similar for mature use cases |

---

## Demo in this repository

| What | Where |
|------|-------|
| Provider + config | `src/DemoApp.tsx` |
| Step definitions | `src/demo/playground-tour.ts`, `src/demo/cross-page-tour.ts` |
| Target markup | `src/pages/HomePage.tsx`, `src/pages/SettingsPage.tsx` |
| Theme variables | `src/index.css` |
