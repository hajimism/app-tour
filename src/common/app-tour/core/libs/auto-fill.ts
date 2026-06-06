import { DEFAULT_AUTO_FILL_DELAY_MS } from "../constants";
import type { AutoFillSpec } from "../types/step-operation";
import { reactType } from "./react-type";
import { sleep } from "./timing";

export interface AutoFillOptions {
	signal?: AbortSignal;
	defaultDelayMs?: number;
}

export async function autoFill(
	el: HTMLInputElement | HTMLTextAreaElement,
	spec: AutoFillSpec,
	options?: AutoFillOptions,
): Promise<void> {
	const focusFirst = spec.focusFirst ?? true;
	if (focusFirst) {
		el.focus();
		el.click();
	}

	const delayMs =
		spec.delayMs ?? options?.defaultDelayMs ?? DEFAULT_AUTO_FILL_DELAY_MS;
	let accumulated = "";

	for (const char of spec.text) {
		accumulated += char;
		reactType(el, accumulated);
		if (delayMs > 0) {
			await sleep(delayMs, options?.signal);
		}
	}
}
