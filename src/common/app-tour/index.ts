/**
 * Copy `src/common/app-tour` into your project and import from this entry.
 * Layers: core (pure) → headless (hooks) → ui (shadcn components).
 */
/** @public */

export { APP_TOUR_TARGET_ATTR } from "./core/constants";
/** @public */
export type { ShadcnPortalSlot } from "./core/libs/portal-target";
/** @public */
export {
	openShadcnPortalTarget,
	queryOpenShadcnPortal,
	SHADCN_PORTAL_SLOTS,
	shadcnPortalSelector,
	shadcnSelectOptionTarget,
	tourTargetInShadcnPortal,
	waitForOpenShadcnPortal,
} from "./core/libs/portal-target";
/** @public */
export {
	resolveClickTarget,
	waitForClickTarget,
} from "./core/libs/resolve-click-target";
/** @public */
export {
	resolveHighlightTarget,
	waitForHighlightTarget,
} from "./core/libs/resolve-highlight-target";
/** @public */
export { queryTourTarget, waitForTourTarget } from "./core/libs/tour-target";
export type { ResolvedAppTourConfig } from "./core/resolve-app-tour-config";
/** @public */
export { resolveAppTourConfig } from "./core/resolve-app-tour-config";
/** @public */
export type {
	AppTourConfig,
	OverlayClickContext,
	StepErrorContext,
	TourContext,
	TourStep,
} from "./core/types/config";
/** @public */
export type {
	OverlayClickBehavior,
	OverlayClickHandler,
} from "./core/types/overlay-click";
/** @public */
export type {
	AutoFillSpec,
	ClickSpec,
	HighlightTarget,
	PointerOffset,
	PointerSpec,
	PrepareSpec,
	SelectSpec,
	StepOperation,
	TooltipSpec,
} from "./core/types/step-operation";
/** @public */
export type { PointerTarget } from "./core/types/view-state";
export type { TourContextValue } from "./headless/tour-context";
/** @public */
export { TourProvider, useTour } from "./headless/tour-context";
export type {
	StepGuideError,
	StepGuideViewState,
} from "./headless/use-step-guide";
/** @public Headless hook for custom UI without default shadcn components. */
export { useStepGuide } from "./headless/use-step-guide";
export type {
	GuideProviderProps,
	RenderTooltipProps,
} from "./ui/guide-provider";
export { GuideProvider } from "./ui/guide-provider";
