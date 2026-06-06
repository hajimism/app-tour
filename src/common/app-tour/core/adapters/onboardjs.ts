import type { OnboardingStep } from "@onboardjs/core";
import { APP_TOUR_COMPONENT_KEY } from "../constants";
import type { TourStep, TourStepMeta } from "../types/config";
import type { StepOperation } from "../types/step-operation";

/**
 * OnboardJS requires a component registry even though app-tour renders
 * overlay UI in GuideLayer instead of through registered components.
 */
export function createAppTourComponentRegistry() {
	return {
		CUSTOM_COMPONENT: () => null,
		[APP_TOUR_COMPONENT_KEY]: () => null,
	};
}

export const APP_TOUR_COMPONENT_REGISTRY = createAppTourComponentRegistry();

function resolveOnStepComplete(step: TourStep) {
	const handler = step.onStepComplete ?? step.onNext;
	if (!handler) return undefined;

	return async () => {
		await handler();
	};
}

function resolveOnStepActive(step: TourStep) {
	if (!step.onStepActive) return undefined;

	return async () => {
		await step.onStepActive?.();
	};
}

export function tourStepsToOnboardSteps(steps: TourStep[]): OnboardingStep[] {
	return steps.map((step) => {
		const onboardStep: OnboardingStep = {
			id: step.id,
			type: "CUSTOM_COMPONENT" as const,
			payload: { componentKey: APP_TOUR_COMPONENT_KEY },
			meta: {
				operation: step.operation,
				pageRevealMs: step.pageRevealMs,
			} satisfies TourStepMeta,
			onStepComplete: resolveOnStepComplete(step),
			onStepActive: resolveOnStepActive(step),
			condition: step.condition,
			nextStep: step.nextStep ?? null,
			previousStep: step.previousStep ?? null,
		};

		if (step.isSkippable) {
			return {
				...onboardStep,
				isSkippable: true as const,
				skipToStep: step.skipToStep,
			};
		}

		return onboardStep;
	});
}

/** @deprecated Use `tourStepsToOnboardSteps` instead. */
export const demoStepsToOnboardSteps = tourStepsToOnboardSteps;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isStepOperation(value: unknown): value is StepOperation {
	if (!isRecord(value)) return false;

	if ("autoFill" in value) {
		const autoFill = value.autoFill;
		if (!isRecord(autoFill) || typeof autoFill.text !== "string") {
			return false;
		}
	}

	for (const key of [
		"prepare",
		"tooltip",
		"select",
		"click",
		"pointer",
	] as const) {
		if (key in value && value[key] !== undefined && !isRecord(value[key])) {
			return false;
		}
	}

	return true;
}

export function isTourStepMeta(meta: unknown): meta is TourStepMeta {
	if (!isRecord(meta)) return false;
	return isStepOperation(meta.operation);
}

export function getStepMeta(
	step: OnboardingStep | null | undefined,
): TourStepMeta | null {
	if (!step?.meta) return null;
	if (!isTourStepMeta(step.meta)) return null;
	return step.meta;
}
