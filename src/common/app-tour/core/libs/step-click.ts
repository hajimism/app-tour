import type { ClickSpec } from "../types/step-operation";
import { sleep } from "./timing";
import { withPointerHint } from "./with-pointer-hint";

export interface StepClickCallbacks {
	onPointerShow?: (target: {
		el: HTMLElement;
		offset?: ClickSpec["pointerOffset"];
	}) => void;
	onPointerHide?: () => void;
}

export async function stepClick(
	target: HTMLElement,
	spec: ClickSpec,
	signal: AbortSignal,
	callbacks?: StepClickCallbacks,
): Promise<void> {
	const showPointer = spec.pointer ?? spec.pointerOffset !== undefined;

	await withPointerHint(
		target,
		{
			offset: spec.pointerOffset,
			pointerDelayMs: spec.pointerDelayMs,
			show: showPointer,
		},
		signal,
		callbacks,
		async () => {
			if (spec.delayMs !== undefined && spec.delayMs > 0) {
				await sleep(spec.delayMs, signal);
			}
			target.click();
		},
	);
}
