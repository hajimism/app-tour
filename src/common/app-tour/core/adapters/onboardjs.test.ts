import { describe, expect, it, vi } from "vitest";
import { APP_TOUR_COMPONENT_KEY } from "../constants";
import type { TourStep } from "../types/config";
import {
	APP_TOUR_COMPONENT_REGISTRY,
	createAppTourComponentRegistry,
	getStepMeta,
	isTourStepMeta,
	tourStepsToOnboardSteps,
} from "./onboardjs";

describe("tourStepsToOnboardSteps", () => {
	it("maps tour steps to onboardjs custom component steps", () => {
		const onStepComplete = vi.fn();
		const steps: TourStep[] = [
			{
				id: "hero",
				operation: { tooltip: { title: "Welcome" } },
				nextStep: "search",
			},
			{
				id: "search",
				operation: { autoFill: { text: "hello" } },
				previousStep: "hero",
				onStepComplete,
				isSkippable: true,
				skipToStep: "docs",
				condition: () => true,
			},
		];

		const mapped = tourStepsToOnboardSteps(steps);

		expect(mapped).toHaveLength(2);
		expect(mapped[0]).toMatchObject({
			id: "hero",
			type: "CUSTOM_COMPONENT",
			payload: { componentKey: APP_TOUR_COMPONENT_KEY },
			nextStep: "search",
			previousStep: null,
		});
		expect(mapped[0].meta).toEqual({
			operation: { tooltip: { title: "Welcome" } },
		});
		expect(mapped[1].meta).toEqual({
			operation: { autoFill: { text: "hello" } },
		});
		expect(mapped[1].onStepComplete).toBeTypeOf("function");
		expect(mapped[1].condition).toBe(steps[1].condition);
		expect(mapped[1]).toMatchObject({
			isSkippable: true,
			skipToStep: "docs",
		});
	});

	it("maps deprecated onNext to onStepComplete", async () => {
		const onNext = vi.fn();
		const [mapped] = tourStepsToOnboardSteps([
			{
				id: "counter",
				operation: { pointer: {} },
				onNext,
			},
		]);

		await mapped.onStepComplete?.({}, {} as never);
		expect(onNext).toHaveBeenCalledOnce();
	});
});

describe("getStepMeta", () => {
	it("returns null when meta is missing", () => {
		expect(getStepMeta(null)).toBeNull();
		expect(getStepMeta({ id: "x", type: "CUSTOM_COMPONENT" })).toBeNull();
	});

	it("returns operation only", () => {
		const meta = getStepMeta({
			id: "counter",
			type: "CUSTOM_COMPONENT",
			meta: {
				operation: { pointer: {} },
			},
		});

		expect(meta).toEqual({
			operation: { pointer: {} },
		});
	});

	it("returns null for invalid meta", () => {
		expect(
			getStepMeta({
				id: "bad",
				type: "CUSTOM_COMPONENT",
				meta: { operation: null },
			}),
		).toBeNull();
		expect(isTourStepMeta({ operation: null })).toBe(false);
		expect(
			isTourStepMeta({
				operation: { autoFill: { text: 123 } },
			}),
		).toBe(false);
		expect(
			isTourStepMeta({
				operation: { prepare: "invalid" },
			}),
		).toBe(false);
	});
});

describe("createAppTourComponentRegistry", () => {
	it("registers noop components for onboardjs", () => {
		const registry = createAppTourComponentRegistry();

		expect(registry.CUSTOM_COMPONENT()).toBeNull();
		expect(registry[APP_TOUR_COMPONENT_KEY]()).toBeNull();
	});

	it("exposes a stable module-level registry constant", () => {
		expect(APP_TOUR_COMPONENT_REGISTRY).toBe(APP_TOUR_COMPONENT_REGISTRY);
		expect(APP_TOUR_COMPONENT_REGISTRY.CUSTOM_COMPONENT()).toBeNull();
	});
});
