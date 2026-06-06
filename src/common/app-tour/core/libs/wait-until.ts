import { ELEMENT_WAIT_TIMEOUT_MS } from "../constants";

const DEFAULT_POLL_MS = 100;

export interface WaitUntilOptions {
	timeoutMs?: number;
	pollMs?: number;
	signal?: AbortSignal;
	observe?: ParentNode;
	onTimeout?: (timeoutMs: number) => Error;
}

export function waitUntil<T>(
	check: () => T | null | undefined | false,
	options?: WaitUntilOptions,
): Promise<T> {
	const timeoutMs = options?.timeoutMs ?? ELEMENT_WAIT_TIMEOUT_MS;
	const signal = options?.signal;
	const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;
	const observeTarget = options?.observe;

	return new Promise((resolve, reject) => {
		let settled = false;
		let observer: MutationObserver | undefined;
		let pollId: number | undefined;
		let timeoutId: number | undefined;

		const finish = (result: () => void) => {
			if (settled) return;
			settled = true;
			observer?.disconnect();
			if (pollId !== undefined) window.clearInterval(pollId);
			if (timeoutId !== undefined) window.clearTimeout(timeoutId);
			signal?.removeEventListener("abort", onAbort);
			result();
		};

		const onAbort = () => {
			finish(() => reject(new DOMException("Aborted", "AbortError")));
		};

		const runCheck = () => {
			const value = check();
			if (value) {
				finish(() => resolve(value));
			}
		};

		if (observeTarget) {
			observer = new MutationObserver(runCheck);
			observer.observe(observeTarget, { childList: true, subtree: true });
		}

		if (pollMs > 0) {
			pollId = window.setInterval(runCheck, pollMs);
		}

		timeoutId = window.setTimeout(() => {
			const error =
				options?.onTimeout?.(timeoutMs) ??
				new Error(`Condition not met within ${timeoutMs}ms`);
			finish(() => reject(error));
		}, timeoutMs);

		signal?.addEventListener("abort", onAbort, { once: true });
		runCheck();
	});
}
