import type { ResolvedOverlayClick } from "../core/libs/resolve-overlay-click";
import type { StepErrorPhase } from "../core/types/config";
import type { TooltipSpec } from "../core/types/step-operation";
import type { PointerTarget } from "../core/types/view-state";

export type { PointerTarget };

export interface StepProgress {
	current: number;
	total: number;
	percentage: number;
}

export interface StepGuideError {
	stepId: string;
	phase: StepErrorPhase;
	message: string;
}

export interface StepGuideViewState {
	stepId: string | null;
	tooltip: TooltipSpec | null;
	anchorEl: HTMLElement | null;
	pointerTarget: PointerTarget | null;
	pointerVisible: boolean;
	canGoNext: boolean;
	canGoPrevious: boolean;
	isFirstStep: boolean;
	isLastStep: boolean;
	isSkippable: boolean;
	progress?: StepProgress;
	overlayClick: ResolvedOverlayClick;
	stepError: StepGuideError | null;
	/** Overlay + tooltip hidden to show the page (e.g. after route change). */
	overlayPaused: boolean;
	/** Fade overlay in on first step or after page reveal. */
	overlayFadeIn: boolean;
}

export const INITIAL_VIEW_STATE: StepGuideViewState = {
	stepId: null,
	tooltip: null,
	anchorEl: null,
	pointerTarget: null,
	pointerVisible: false,
	canGoNext: false,
	canGoPrevious: false,
	isFirstStep: true,
	isLastStep: false,
	isSkippable: false,
	overlayClick: { allowClose: false, behavior: "close" },
	stepError: null,
	overlayPaused: false,
	overlayFadeIn: false,
};

export type StepGuideAction =
	| { type: "RESET" }
	| { type: "CLEAR_ERROR" }
	| { type: "POINTER_HIDE" }
	| { type: "SET_OVERLAY_PAUSED"; payload: boolean }
	| {
			type: "STEP_FAILED";
			payload: StepGuideError;
	  }
	| {
			type: "TARGET_READY";
			payload: {
				stepId: string;
				anchorEl: HTMLElement;
				tooltip: TooltipSpec | null;
				canGoNext: boolean;
				canGoPrevious: boolean;
				isFirstStep: boolean;
				isLastStep: boolean;
				isSkippable: boolean;
				progress?: StepProgress;
				overlayClick: ResolvedOverlayClick;
			};
	  }
	| { type: "POINTER_SHOW"; payload: PointerTarget };

export function stepGuideReducer(
	state: StepGuideViewState,
	action: StepGuideAction,
): StepGuideViewState {
	switch (action.type) {
		case "RESET":
			return INITIAL_VIEW_STATE;
		case "CLEAR_ERROR":
			return {
				...state,
				stepError: null,
			};
		case "STEP_FAILED":
			return {
				...state,
				stepId: action.payload.stepId,
				anchorEl: null,
				tooltip: null,
				pointerTarget: null,
				pointerVisible: false,
				stepError: action.payload,
				overlayPaused: false,
			};
		case "POINTER_HIDE":
			return {
				...state,
				pointerTarget: null,
				pointerVisible: false,
			};
		case "SET_OVERLAY_PAUSED":
			return {
				...state,
				overlayPaused: action.payload,
				pointerTarget: action.payload ? null : state.pointerTarget,
				pointerVisible: action.payload ? false : state.pointerVisible,
			};
		case "TARGET_READY":
			return {
				...state,
				stepId: action.payload.stepId,
				anchorEl: action.payload.anchorEl,
				tooltip: action.payload.tooltip,
				pointerTarget: null,
				pointerVisible: false,
				canGoNext: action.payload.canGoNext,
				canGoPrevious: action.payload.canGoPrevious,
				isFirstStep: action.payload.isFirstStep,
				isLastStep: action.payload.isLastStep,
				isSkippable: action.payload.isSkippable,
				progress: action.payload.progress,
				overlayClick: action.payload.overlayClick,
				stepError: null,
				overlayPaused: false,
				overlayFadeIn: action.payload.isFirstStep || state.overlayPaused,
			};
		case "POINTER_SHOW":
			return {
				...state,
				pointerTarget: action.payload,
				pointerVisible: true,
			};
		default:
			return state;
	}
}
