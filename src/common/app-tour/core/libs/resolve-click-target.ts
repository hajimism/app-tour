import type { HighlightTarget } from "../types/step-operation";
import {
	resolveHighlightTarget,
	waitForHighlightTarget,
} from "./resolve-highlight-target";
import type { WaitForElementOptions } from "./wait-for-element";

export function resolveClickTarget(
	highlightEl: HTMLElement,
	target: HighlightTarget | undefined,
	stepId: string,
): HTMLElement {
	if (target === undefined) return highlightEl;

	const resolved = resolveHighlightTarget(target, stepId);

	if (typeof resolved === "string") {
		const el = document.querySelector<HTMLElement>(resolved);
		if (!el) {
			throw new Error(`Click target not found: ${resolved}`);
		}
		return el;
	}

	if (resolved instanceof HTMLElement) return resolved;

	const el = resolved();
	if (!el) {
		throw new Error(`Click target resolver returned null: ${stepId}`);
	}
	return el;
}

export async function waitForClickTarget(
	highlightEl: HTMLElement,
	target: HighlightTarget | undefined,
	stepId: string,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	if (target === undefined) return highlightEl;
	return waitForHighlightTarget(target, stepId, options);
}
