import type { StepOperation } from "../types/step-operation";

/** Returns an error when `autoFill` is configured but the highlight is not an input. */
export function validateAutoFillTarget(
	highlightEl: HTMLElement,
	stepId: string,
): Error | null {
	if (
		highlightEl instanceof HTMLInputElement ||
		highlightEl instanceof HTMLTextAreaElement
	) {
		return null;
	}

	return new Error(`autoFill target must be an input or textarea: ${stepId}`);
}

/** Warns when multiple mutually exclusive step effects are set (first wins). */
export function warnConflictingStepEffects(
	operation: StepOperation,
	stepId: string,
): void {
	const effects: string[] = [];
	if (operation.autoFill) effects.push("autoFill");
	if (operation.select) effects.push("select");
	if (operation.click && (operation.click.when ?? "complete") === "active") {
		effects.push("click(active)");
	}
	if (operation.pointer) effects.push("pointer");

	if (effects.length <= 1) return;

	console.warn(
		`[app-tour] Step "${stepId}" defines multiple step effects (${effects.join(", ")}); only "${effects[0]}" will run.`,
	);
}
