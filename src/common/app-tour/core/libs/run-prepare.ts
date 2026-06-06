import {
	getResolvedConfig,
	type ResolvedAppTourConfig,
} from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type { PrepareSpec } from "../types/step-operation";
import { waitForHighlightTarget } from "./resolve-highlight-target";
import { sleep } from "./timing";

export async function runPrepare(
	prepare: PrepareSpec | undefined,
	stepId: string,
	signal: AbortSignal,
	config?: AppTourConfig | ResolvedAppTourConfig,
): Promise<void> {
	if (!prepare?.click) return;

	const resolved = getResolvedConfig(config);

	const clickTarget = await waitForHighlightTarget(prepare.click, stepId, {
		signal,
		timeoutMs: resolved.elementWaitTimeoutMs,
	});

	clickTarget.click();

	const settleMs = prepare.settleMs ?? resolved.defaultPrepareSettleMs;
	await sleep(settleMs, signal);
}
