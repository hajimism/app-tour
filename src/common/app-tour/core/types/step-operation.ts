import type { ReactNode } from "react";
import type { OverlayClickHandler } from "./overlay-click";

/** CSS selector, DOM element, or resolver — omit to use `[data-app-tour="{stepId}"]`. */
export type HighlightTarget = string | HTMLElement | (() => HTMLElement | null);

export interface PointerOffset {
	/** Pixels from the autoFill target center. Positive x moves right. */
	x?: number;
	/** Pixels from the autoFill target center. Positive y moves down. */
	y?: number;
}

export interface PointerSpec {
	offset?: PointerOffset;
	/** Show pointer on the highlight target for this step. */
	show?: boolean;
}

export interface PrepareSpec {
	/** Click target before waiting for highlight (e.g. Dialog/Sheet trigger). */
	click?: HighlightTarget;
	/** Wait after prepare actions. Falls back to AppTourConfig.defaultPrepareSettleMs. */
	settleMs?: number;
}

export interface ClickSpec {
	/** When to perform the click. Default: `"complete"` (before advancing). */
	when?: "active" | "complete";
	/** Click target. Defaults to the highlight element. */
	target?: HighlightTarget;
	delayMs?: number;
	/** Show pointer before clicking. Default: true when pointerOffset is set. */
	pointer?: boolean;
	pointerOffset?: PointerOffset;
	pointerDelayMs?: number;
}

export interface SelectSpec {
	/** Match `[data-value]` on shadcn SelectItem. */
	value?: string;
	/** Match visible option label text. */
	label?: string;
	match?: "value" | "label";
	settleMs?: number;
	pointer?: boolean;
	pointerOffset?: PointerOffset;
	pointerDelayMs?: number;
	optionPointerOffset?: PointerOffset;
	optionDelayMs?: number;
}

export interface AutoFillSpec {
	text: string;
	delayMs?: number;
	focusFirst?: boolean;
	/** Shows pointer during autoFill when set. */
	pointerOffset?: PointerOffset;
}

export interface TooltipButtonLabels {
	next?: string;
	previous?: string;
	firstNext?: string;
	lastNext?: string;
	skip?: string;
}

export interface TooltipSpec {
	/** Shorthand for `description`. */
	text?: ReactNode;
	title?: ReactNode;
	description?: ReactNode;
	placement?: "top" | "bottom" | "left" | "right";
	/** Arrow alignment along the anchor edge. Maps to Popover.Positioner `align`. */
	align?: "start" | "center" | "end";
	/** Fine-tune arrow position along the anchor edge (px). Maps to `alignOffset`. */
	alignOffset?: number;
	/** Per-step override for progress display. Falls back to AppTourConfig.showProgress. */
	showProgress?: boolean;
	buttons?: TooltipButtonLabels;
}

export interface StepOperation {
	/** Highlight target. Defaults to `[data-app-tour="{stepId}"]`. */
	highlight?: HighlightTarget;
	/** Actions before resolving highlight (open Dialog/Sheet, etc.). */
	prepare?: PrepareSpec;
	tooltip?: TooltipSpec;
	autoFill?: AutoFillSpec;
	/** shadcn Select: open trigger and pick an option. */
	select?: SelectSpec;
	/** Declarative click with optional pointer animation. */
	click?: ClickSpec;
	pointer?: PointerSpec;
	/**
	 * Delay before autoFill / select / pointer / active click.
	 * Default: sync with highlight transition (0 on the first step).
	 */
	effectsDelayMs?: number;
	scrollIntoView?: boolean;
	/** Override global overlay click close allowance for this step. */
	allowOverlayClose?: boolean;
	/** Override global overlay click behavior for this step. */
	overlayClickBehavior?: "close" | "nextStep" | OverlayClickHandler;
}
