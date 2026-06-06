import { DEFAULT_POINTER_TRANSITION_MS } from "../constants";
import type { PointerOffset } from "../types/step-operation";
import type { StepClickCallbacks } from "./step-click";
import { sleep } from "./timing";

export interface PointerHintSpec {
	offset?: PointerOffset;
	pointerDelayMs?: number;
	show?: boolean;
}

export async function withPointerHint(
	target: HTMLElement,
	spec: PointerHintSpec,
	signal: AbortSignal,
	callbacks: StepClickCallbacks | undefined,
	action: () => void | Promise<void>,
): Promise<void> {
	const showPointer = spec.show ?? spec.offset !== undefined;

	if (showPointer) {
		callbacks?.onPointerShow?.({ el: target, offset: spec.offset });
		signal.addEventListener("abort", () => callbacks?.onPointerHide?.(), {
			once: true,
		});
		await sleep(spec.pointerDelayMs ?? DEFAULT_POINTER_TRANSITION_MS, signal);
	}

	try {
		await action();
	} finally {
		if (showPointer) {
			callbacks?.onPointerHide?.();
		}
	}
}
