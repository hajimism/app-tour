import type { OnboardingContext } from "@onboardjs/core";
import type {
	OverlayClickBehavior,
	OverlayClickHandler,
} from "./overlay-click";
import type { StepOperation } from "./step-operation";

export type { OverlayClickContext } from "./overlay-click";

export type TourContext = OnboardingContext;

export type StepErrorPhase =
	| "wait"
	| "prepare"
	| "autoFill"
	| "select"
	| "click"
	| "onStepComplete"
	| "engine";

export interface StepErrorContext {
	stepId: string;
	phase: StepErrorPhase;
	error: unknown;
}

export interface AppTourConfig {
	debug?: boolean;
	defaultScrollIntoView?: boolean;
	defaultAutoFillDelayMs?: number;
	/** Timeout when waiting for a highlight target. Default: 5000ms. */
	elementWaitTimeoutMs?: number;
	/** Wait after prepare actions (Dialog open, etc.). Default: 300ms. */
	defaultPrepareSettleMs?: number;
	highlightTransitionMs?: number;
	/** Opacity fade-in when the overlay first appears or returns after pageRevealMs. */
	overlayFadeInMs?: number;
	/**
	 * Delay before autoFill / select / pointer / active click.
	 * Default: 0 on the first step, then `highlightTransitionMs`.
	 */
	stepEffectsDelayMs?: number;
	scrollSettleMs?: number;
	/** Global default for step progress display in tooltip. */
	showProgress?: boolean;
	/** Whether clicking the dimmed overlay closes the tour. Default: false. */
	allowOverlayClose?: boolean;
	/**
	 * Block pointer events on the dimmed overlay (without closing the tour).
	 * Independent of `allowOverlayClose`. Default: false (clicks pass through).
	 */
	blockOverlayInteraction?: boolean;
	/**
	 * Overlay click behavior when `allowOverlayClose` is true.
	 * Default: `"close"` (driver.js compatible).
	 */
	overlayClickBehavior?: OverlayClickBehavior | OverlayClickHandler;
	/** Show an on-screen banner when a step fails. Default: true. */
	showStepErrors?: boolean;
	/** Hide overlay after route changes before highlighting. Per-step override: `pageRevealMs`. */
	defaultPageRevealMs?: number;
	onStepError?: (ctx: StepErrorContext) => void;
	onTourComplete?: (ctx: { duration: number }) => void;
}

export interface TourStep {
	id: string;
	operation: StepOperation;
	/**
	 * Hide overlay (and tooltip) for this many ms after `onStepActive`, before
	 * waiting for the highlight target — useful after client-side route changes.
	 */
	pageRevealMs?: number;
	onStepComplete?: () => void | Promise<void>;
	onStepActive?: () => void | Promise<void>;
	/** @deprecated Use `onStepComplete` instead. */
	onNext?: TourStep["onStepComplete"];
	condition?: (context: TourContext) => boolean;
	isSkippable?: boolean;
	skipToStep?: string | null | ((context: TourContext) => string | null);
	nextStep?: string | null | ((context: TourContext) => string | null);
	previousStep?: string | null | ((context: TourContext) => string | null);
}

export interface TourStepMeta {
	operation: StepOperation;
	pageRevealMs?: number;
}

/** @deprecated Use `TourStep` instead. */
export type DemoStep = TourStep;

/** @deprecated Use `TourStepMeta` instead. */
export type DemoStepMeta = TourStepMeta;
