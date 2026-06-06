import { scrollTargetIntoView } from "../libs/highlight-rect";
import { waitForHighlightTarget } from "../libs/resolve-highlight-target";
import { runPrepare } from "../libs/run-prepare";
import { sleep } from "../libs/timing";
import { AppTourStepError, formatStepErrorMessage } from "../report-step-error";
import { getResolvedConfig } from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type { StepOperation } from "../types/step-operation";

export async function resolveStepTarget(
	operation: StepOperation,
	stepId: string,
	scrollIntoView: boolean,
	signal: AbortSignal,
	config?: AppTourConfig,
): Promise<HTMLElement> {
	const resolved = getResolvedConfig(config);

	try {
		await runPrepare(operation.prepare, stepId, signal, config);
	} catch (error) {
		if (signal.aborted) throw error;
		throw new AppTourStepError("prepare", formatStepErrorMessage(error), {
			cause: error,
		});
	}

	const highlightEl = await waitForHighlightTarget(
		operation.highlight,
		stepId,
		{
			signal,
			timeoutMs: resolved.elementWaitTimeoutMs,
		},
	);

	if (scrollIntoView) {
		scrollTargetIntoView(highlightEl);
		await sleep(resolved.scrollSettleMs, signal);
	}

	return highlightEl;
}
