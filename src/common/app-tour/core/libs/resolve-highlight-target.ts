import type { HighlightTarget } from "../types/step-operation";
import {
	resolveStringHighlightTarget,
	tourTargetSelector,
} from "./tour-target";
import { type WaitForElementOptions, waitForElement } from "./wait-for-element";
import { waitUntil } from "./wait-until";

export function resolveHighlightTarget(
	target: HighlightTarget | undefined,
	stepId: string,
): HighlightTarget {
	if (target === undefined) return tourTargetSelector(stepId);
	if (typeof target === "string") return resolveStringHighlightTarget(target);
	return target;
}

export async function waitForHighlightTarget(
	target: HighlightTarget | undefined,
	stepId: string,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	const resolved = resolveHighlightTarget(target, stepId);

	if (typeof resolved === "string") {
		return waitForElement(resolved, options);
	}

	if (resolved instanceof HTMLElement) {
		if (resolved.isConnected) return resolved;
		return waitForElementConnected(resolved, options);
	}

	return waitForHighlightResolver(resolved, options);
}

function waitForHighlightResolver(
	resolve: () => HTMLElement | null,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	return waitUntil(
		() => {
			const el = resolve();
			return el?.isConnected ? el : null;
		},
		{
			timeoutMs: options?.timeoutMs,
			signal: options?.signal,
			onTimeout: (timeoutMs) =>
				new Error(`Highlight target not found within ${timeoutMs}ms`),
		},
	);
}

function waitForElementConnected(
	el: HTMLElement,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	if (el.isConnected) {
		return Promise.resolve(el);
	}

	return waitUntil(() => (el.isConnected ? el : null), {
		timeoutMs: options?.timeoutMs,
		signal: options?.signal,
		pollMs: 0,
		observe: document.body,
		onTimeout: (timeoutMs) =>
			new Error(`Highlight target not connected within ${timeoutMs}ms`),
	});
}
