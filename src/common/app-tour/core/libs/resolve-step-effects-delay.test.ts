import { describe, expect, it } from "vitest";
import { HIGHLIGHT_TRANSITION_MS } from "../constants";
import type { StepOperation } from "../types/step-operation";
import {
	hasStepEffects,
	resolveStepEffectsDelayMs,
} from "./resolve-step-effects-delay";

describe("hasStepEffects", () => {
	it("detects autoFill, select, pointer, and active click", () => {
		expect(hasStepEffects({ autoFill: { text: "x" } })).toBe(true);
		expect(hasStepEffects({ select: { value: "a" } })).toBe(true);
		expect(hasStepEffects({ pointer: {} })).toBe(true);
		expect(hasStepEffects({ click: { when: "active" } })).toBe(true);
	});

	it("ignores complete-only click and tooltip-only steps", () => {
		expect(hasStepEffects({ click: { when: "complete" } })).toBe(false);
		expect(hasStepEffects({ tooltip: { title: "Hi" } })).toBe(false);
	});
});

describe("resolveStepEffectsDelayMs", () => {
	const operation: StepOperation = { autoFill: { text: "demo" } };

	it("waits for highlight transition after the first step", () => {
		expect(resolveStepEffectsDelayMs(operation, undefined, false)).toBe(0);
		expect(resolveStepEffectsDelayMs(operation, undefined, true)).toBe(
			HIGHLIGHT_TRANSITION_MS,
		);
	});

	it("respects config and per-step overrides", () => {
		expect(
			resolveStepEffectsDelayMs(operation, { stepEffectsDelayMs: 120 }, true),
		).toBe(120);
		expect(
			resolveStepEffectsDelayMs(
				{ ...operation, effectsDelayMs: 50 },
				{ stepEffectsDelayMs: 120 },
				true,
			),
		).toBe(50);
		expect(
			resolveStepEffectsDelayMs(
				operation,
				{ highlightTransitionMs: 250 },
				true,
			),
		).toBe(250);
	});
});
