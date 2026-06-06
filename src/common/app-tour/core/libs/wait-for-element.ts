import { type WaitUntilOptions, waitUntil } from "./wait-until";

export interface WaitForElementOptions {
	timeoutMs?: number;
	root?: ParentNode;
	signal?: AbortSignal;
}

export function waitForElement(
	selector: string,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	const root = options?.root ?? document;

	return waitUntil(() => root.querySelector<HTMLElement>(selector), {
		timeoutMs: options?.timeoutMs,
		signal: options?.signal,
		observe: root === document ? document.body : root,
		onTimeout: (timeoutMs) =>
			new Error(`Element not found within ${timeoutMs}ms: ${selector}`),
	} satisfies WaitUntilOptions);
}

export { type WaitUntilOptions, waitUntil } from "./wait-until";
