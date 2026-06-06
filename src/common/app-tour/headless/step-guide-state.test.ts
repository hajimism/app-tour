import { describe, expect, it } from "vitest";
import { INITIAL_VIEW_STATE, stepGuideReducer } from "./step-guide-state";

describe("stepGuideReducer", () => {
	it("resets to initial state", () => {
		const state = {
			...INITIAL_VIEW_STATE,
			anchorEl: document.createElement("div"),
			canGoNext: true,
			isSkippable: true,
		};

		expect(stepGuideReducer(state, { type: "RESET" })).toEqual(
			INITIAL_VIEW_STATE,
		);
	});

	it("applies target ready payload with progress and skippable", () => {
		const anchorEl = document.createElement("div");
		const next = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "TARGET_READY",
			payload: {
				stepId: "hero",
				anchorEl,
				tooltip: { title: "Hi" },
				canGoNext: true,
				canGoPrevious: false,
				isFirstStep: true,
				isLastStep: false,
				isSkippable: true,
				progress: { current: 2, total: 4, percentage: 50 },
				overlayClick: { allowClose: true, behavior: "close" },
			},
		});

		expect(next.stepId).toBe("hero");

		expect(next.anchorEl).toBe(anchorEl);
		expect(next.tooltip).toEqual({ title: "Hi" });
		expect(next.canGoNext).toBe(true);
		expect(next.isSkippable).toBe(true);
		expect(next.progress).toEqual({ current: 2, total: 4, percentage: 50 });
		expect(next.pointerVisible).toBe(false);
		expect(next.overlayFadeIn).toBe(true);
	});

	it("sets overlayFadeIn after page reveal resume", () => {
		const paused = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "SET_OVERLAY_PAUSED",
			payload: true,
		});

		const ready = stepGuideReducer(paused, {
			type: "TARGET_READY",
			payload: {
				stepId: "settings",
				anchorEl: document.createElement("div"),
				tooltip: null,
				canGoNext: true,
				canGoPrevious: false,
				isFirstStep: false,
				isLastStep: false,
				isSkippable: false,
				overlayClick: { allowClose: false, behavior: "close" },
			},
		});
		expect(ready.overlayPaused).toBe(false);
		expect(ready.overlayFadeIn).toBe(true);
	});

	it("does not fade overlay on regular step changes", () => {
		const anchorEl = document.createElement("div");
		const stepOne = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "TARGET_READY",
			payload: {
				stepId: "one",
				anchorEl,
				tooltip: null,
				canGoNext: true,
				canGoPrevious: false,
				isFirstStep: false,
				isLastStep: false,
				isSkippable: false,
				overlayClick: { allowClose: false, behavior: "close" },
			},
		});

		expect(stepOne.overlayFadeIn).toBe(false);
	});

	it("pauses overlay for page reveal", () => {
		const next = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "SET_OVERLAY_PAUSED",
			payload: true,
		});
		expect(next.overlayPaused).toBe(true);

		const ready = stepGuideReducer(next, {
			type: "TARGET_READY",
			payload: {
				stepId: "settings",
				anchorEl: document.createElement("div"),
				tooltip: null,
				canGoNext: true,
				canGoPrevious: false,
				isFirstStep: false,
				isLastStep: false,
				isSkippable: false,
				overlayClick: { allowClose: false, behavior: "close" },
			},
		});
		expect(ready.overlayPaused).toBe(false);
	});

	it("shows and hides pointer state", () => {
		const el = document.createElement("input");
		const withPointer = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "POINTER_SHOW",
			payload: { el, offset: { x: 4 } },
		});

		expect(withPointer.pointerVisible).toBe(true);
		expect(withPointer.pointerTarget).toEqual({ el, offset: { x: 4 } });

		const hidden = stepGuideReducer(withPointer, { type: "POINTER_HIDE" });
		expect(hidden.pointerVisible).toBe(false);
		expect(hidden.pointerTarget).toBeNull();
	});

	it("stores step failure and clears anchor", () => {
		const withTarget = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "TARGET_READY",
			payload: {
				stepId: "hero",
				anchorEl: document.createElement("div"),
				tooltip: { title: "Hi" },
				canGoNext: true,
				canGoPrevious: false,
				isFirstStep: true,
				isLastStep: false,
				isSkippable: false,
				overlayClick: { allowClose: false, behavior: "close" },
			},
		});

		const failed = stepGuideReducer(withTarget, {
			type: "STEP_FAILED",
			payload: {
				stepId: "search",
				phase: "wait",
				message: "Element not found within 5000ms",
			},
		});

		expect(failed.stepError).toEqual({
			stepId: "search",
			phase: "wait",
			message: "Element not found within 5000ms",
		});
		expect(failed.anchorEl).toBeNull();
		expect(failed.tooltip).toBeNull();
	});

	it("returns the same state for unknown actions", () => {
		const state = {
			...INITIAL_VIEW_STATE,
			stepId: "hero",
		};

		expect(stepGuideReducer(state, { type: "UNKNOWN" as "RESET" })).toBe(state);
	});

	it("clears step error on target ready and clear action", () => {
		const failed = stepGuideReducer(INITIAL_VIEW_STATE, {
			type: "STEP_FAILED",
			payload: {
				stepId: "search",
				phase: "wait",
				message: "missing",
			},
		});

		const cleared = stepGuideReducer(failed, { type: "CLEAR_ERROR" });
		expect(cleared.stepError).toBeNull();

		const ready = stepGuideReducer(failed, {
			type: "TARGET_READY",
			payload: {
				stepId: "search",
				anchorEl: document.createElement("input"),
				tooltip: null,
				canGoNext: false,
				canGoPrevious: true,
				isFirstStep: false,
				isLastStep: false,
				isSkippable: false,
				overlayClick: { allowClose: false, behavior: "close" },
			},
		});
		expect(ready.stepError).toBeNull();
	});
});
