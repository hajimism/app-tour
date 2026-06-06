import { FIRST_TOOLTIP_REVEAL_MS } from "../constants";
import type { ResolvedAppTourConfig } from "../resolve-app-tour-config";
import { getResolvedConfig } from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type { StepOperation } from "../types/step-operation";

export function hasStepEffects(operation: StepOperation): boolean {
	if (operation.autoFill || operation.select || operation.pointer) return true;

	const click = operation.click;
	return Boolean(click && (click.when ?? "complete") === "active");
}

/** Matches tooltip reveal timing: 0 on first step, then highlightTransitionMs. */
export function resolveStepEffectsDelayMs(
	operation: StepOperation,
	config: AppTourConfig | ResolvedAppTourConfig | undefined,
	hasActivatedStepBefore: boolean,
): number {
	if (operation.effectsDelayMs !== undefined) return operation.effectsDelayMs;

	const resolved = getResolvedConfig(config);

	if (resolved.stepEffectsDelayMs !== undefined) {
		return resolved.stepEffectsDelayMs;
	}
	if (!hasActivatedStepBefore) return FIRST_TOOLTIP_REVEAL_MS;
	return resolved.highlightTransitionMs;
}
