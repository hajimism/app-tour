import { autoFill } from "../libs/auto-fill";
import { waitForClickTarget } from "../libs/resolve-click-target";
import { hasStepEffects } from "../libs/resolve-step-effects-delay";
import { type StepClickCallbacks, stepClick } from "../libs/step-click";
import { stepSelect } from "../libs/step-select";
import { sleep } from "../libs/timing";
import { withPointerHint } from "../libs/with-pointer-hint";
import {
	getResolvedConfig,
	type ResolvedAppTourConfig,
} from "../resolve-app-tour-config";
import type { AppTourConfig, StepErrorPhase } from "../types/config";
import type { ClickSpec, StepOperation } from "../types/step-operation";
import type { PointerTarget } from "../types/view-state";

export type RunStepEffectsResult =
	| { status: "ok" }
	| { status: "aborted" }
	| { status: "failed"; phase: StepErrorPhase; error: unknown };

export interface RunStepEffectsCallbacks {
	stepId: string;
	config?: AppTourConfig | ResolvedAppTourConfig;
	effectsDelayMs?: number;
	onPointerShow: (target: PointerTarget) => void;
	onPointerHide: () => void;
	onStepFailed?: (phase: StepErrorPhase, error: unknown) => void;
}

function pointerCallbacks(
	onPointerShow: RunStepEffectsCallbacks["onPointerShow"],
	onPointerHide: RunStepEffectsCallbacks["onPointerHide"],
): StepClickCallbacks {
	return {
		onPointerShow: (target) => onPointerShow(target),
		onPointerHide,
	};
}

function isActiveClick(click: ClickSpec | undefined): click is ClickSpec {
	if (!click) return false;
	return (click.when ?? "complete") === "active";
}

function isAbortError(error: unknown, signal: AbortSignal): boolean {
	return (
		signal.aborted ||
		(error instanceof DOMException && error.name === "AbortError")
	);
}

export async function runStepEffects(
	highlightEl: HTMLElement,
	operation: StepOperation,
	signal: AbortSignal,
	{
		stepId,
		config,
		effectsDelayMs = 0,
		onPointerShow,
		onPointerHide,
	}: RunStepEffectsCallbacks,
): Promise<RunStepEffectsResult> {
	const resolved = getResolvedConfig(config);

	if (hasStepEffects(operation) && effectsDelayMs > 0) {
		try {
			await sleep(effectsDelayMs, signal);
		} catch (error) {
			if (isAbortError(error, signal)) return { status: "aborted" };
			throw error;
		}
	}

	const callbacks = pointerCallbacks(onPointerShow, onPointerHide);

	if (operation.autoFill) {
		const autoFillSpec = operation.autoFill;
		const autoFillTarget = highlightEl as
			| HTMLInputElement
			| HTMLTextAreaElement;

		try {
			await withPointerHint(
				autoFillTarget,
				{
					offset: autoFillSpec.pointerOffset,
					show: autoFillSpec.pointerOffset !== undefined,
				},
				signal,
				callbacks,
				async () => {
					await autoFill(autoFillTarget, autoFillSpec, {
						signal,
						defaultDelayMs: resolved.defaultAutoFillDelayMs,
					});
				},
			);
		} catch (error) {
			if (isAbortError(error, signal)) return { status: "aborted" };
			return { status: "failed", phase: "autoFill", error };
		} finally {
			autoFillTarget.blur();
		}
		return { status: "ok" };
	}

	if (operation.select) {
		try {
			await stepSelect(
				highlightEl,
				operation.select,
				signal,
				resolved,
				callbacks,
			);
		} catch (error) {
			if (isAbortError(error, signal)) return { status: "aborted" };
			return { status: "failed", phase: "select", error };
		}
		return { status: "ok" };
	}

	if (isActiveClick(operation.click)) {
		const click = operation.click;
		try {
			const target = await waitForClickTarget(
				highlightEl,
				click.target,
				stepId,
				{
					signal,
					timeoutMs: resolved.elementWaitTimeoutMs,
				},
			);
			await stepClick(target, click, signal, callbacks);
		} catch (error) {
			if (isAbortError(error, signal)) return { status: "aborted" };
			return { status: "failed", phase: "click", error };
		}
		return { status: "ok" };
	}

	if (operation.pointer) {
		onPointerShow({
			el: highlightEl,
			offset: operation.pointer.offset,
		});
	}

	return { status: "ok" };
}

export async function runCompleteClick(
	highlightEl: HTMLElement,
	operation: StepOperation,
	stepId: string,
	signal: AbortSignal,
	callbacks: Pick<
		RunStepEffectsCallbacks,
		"onPointerShow" | "onPointerHide" | "onStepFailed" | "config"
	>,
): Promise<"skipped" | "ok" | "failed"> {
	const click = operation.click;
	if (!click || (click.when ?? "complete") !== "complete") {
		return "skipped";
	}

	const resolved = getResolvedConfig(callbacks.config);

	try {
		const target = await waitForClickTarget(highlightEl, click.target, stepId, {
			signal,
			timeoutMs: resolved.elementWaitTimeoutMs,
		});
		await stepClick(
			target,
			click,
			signal,
			pointerCallbacks(callbacks.onPointerShow, callbacks.onPointerHide),
		);
		return "ok";
	} catch (error) {
		if (isAbortError(error, signal)) return "failed";
		callbacks.onStepFailed?.("click", error);
		return "failed";
	}
}
