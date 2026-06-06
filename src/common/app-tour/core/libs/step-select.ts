import {
	getResolvedConfig,
	type ResolvedAppTourConfig,
} from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type { SelectSpec } from "../types/step-operation";
import {
	queryOpenShadcnPortal,
	shadcnSelectOptionTarget,
	waitForHighlightPortal,
} from "./portal-target";
import { type StepClickCallbacks, stepClick } from "./step-click";
import { sleep } from "./timing";
import { waitUntil } from "./wait-until";

export async function stepSelect(
	trigger: HTMLElement,
	spec: SelectSpec,
	signal: AbortSignal,
	config?: AppTourConfig | ResolvedAppTourConfig,
	callbacks?: StepClickCallbacks,
): Promise<void> {
	const resolved = getResolvedConfig(config);

	if (!queryOpenShadcnPortal("selectContent")) {
		await stepClick(
			trigger,
			{
				when: "active",
				pointer: spec.pointer ?? false,
				pointerOffset: spec.pointerOffset,
				pointerDelayMs: spec.pointerDelayMs,
			},
			signal,
			callbacks,
		);
	}

	const settleMs = spec.settleMs ?? resolved.defaultPrepareSettleMs;
	await sleep(settleMs, signal);

	await waitForHighlightPortal("selectContent", {
		signal,
		timeoutMs: resolved.elementWaitTimeoutMs,
	});

	const match = spec.match ?? (spec.value ? "value" : "label");
	const key = spec.value ?? spec.label;
	if (!key) {
		throw new Error("select requires value or label");
	}

	const optionTarget = shadcnSelectOptionTarget(key, match);
	const option = await waitUntil(() => optionTarget(), {
		signal,
		timeoutMs: resolved.elementWaitTimeoutMs,
		onTimeout: () => new Error(`Select option not found: ${key}`),
	});

	await stepClick(
		option,
		{
			when: "active",
			pointer: spec.pointer ?? false,
			pointerOffset: spec.optionPointerOffset,
			delayMs: spec.optionDelayMs,
		},
		signal,
		callbacks,
	);
}
