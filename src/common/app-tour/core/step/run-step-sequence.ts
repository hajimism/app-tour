import type { ResolvedOverlayClick } from "../libs/resolve-overlay-click";
import { resolveOverlayClick } from "../libs/resolve-overlay-click";
import { resolveStepEffectsDelayMs } from "../libs/resolve-step-effects-delay";
import { sleep } from "../libs/timing";
import { readStepErrorPhase } from "../report-step-error";
import {
	getResolvedConfig,
	type ResolvedAppTourConfig,
} from "../resolve-app-tour-config";
import type { AppTourConfig, StepErrorPhase } from "../types/config";
import type { StepOperation, TooltipSpec } from "../types/step-operation";
import type { PointerTarget } from "../types/view-state";
import { resolveStepTarget } from "./resolve-step-target";
import { runStepEffects } from "./run-step-effects";

export type { RunStepEffectsResult } from "./run-step-effects";
export { runCompleteClick, runStepEffects } from "./run-step-effects";

import {
	validateAutoFillTarget,
	warnConflictingStepEffects,
} from "./validate-step-operation";

export interface StepReadyPayload {
	stepId: string;
	anchorEl: HTMLElement;
	tooltip: TooltipSpec | null;
	canGoNext: boolean;
	canGoPrevious: boolean;
	isFirstStep: boolean;
	isLastStep: boolean;
	isSkippable: boolean;
	progress?: {
		current: number;
		total: number;
		percentage: number;
	};
	overlayClick: ResolvedOverlayClick;
}

export interface RunStepSequenceEngineState {
	canGoNext: boolean;
	canGoPrevious: boolean;
	isFirstStep: boolean;
	isLastStep: boolean;
	isSkippable: boolean;
	currentStepNumber: number;
	totalSteps: number;
	progressPercentage: number;
}

export interface RunStepSequencePointerCallbacks {
	onPointerShow: (target: PointerTarget) => void;
	onPointerHide: () => void;
}

export interface RunStepSequenceCallbacks
	extends RunStepSequencePointerCallbacks {
	onOverlayPaused: (paused: boolean) => void;
	onStepFailed: (stepId: string, phase: StepErrorPhase, error: unknown) => void;
	onTargetReady: (payload: StepReadyPayload) => void;
}

export type RunStepSequenceResult =
	| { status: "aborted" }
	| { status: "skipped" }
	| { status: "failed"; stepId: string; phase: StepErrorPhase; error: unknown }
	| { status: "ready"; stepId: string; activatedStep: true };

export interface RunStepSequenceInput {
	stepId: string;
	operation: StepOperation;
	pageRevealMs?: number;
	scrollIntoView: boolean;
	engineState?: RunStepSequenceEngineState | null;
	hasActivatedStepBefore: boolean;
	config?: AppTourConfig | ResolvedAppTourConfig;
}

export async function runStepSequence(
	input: RunStepSequenceInput,
	signal: AbortSignal,
	callbacks: RunStepSequenceCallbacks,
): Promise<RunStepSequenceResult> {
	const resolved = getResolvedConfig(input.config);
	const { stepId, operation } = input;

	const pageRevealMs = input.pageRevealMs ?? resolved.defaultPageRevealMs;
	if (pageRevealMs > 0) {
		callbacks.onOverlayPaused(true);
		try {
			await sleep(pageRevealMs, signal);
		} catch (error) {
			if (signal.aborted) return { status: "aborted" };
			throw error;
		}
	}

	let highlightEl: HTMLElement;
	try {
		highlightEl = await resolveStepTarget(
			operation,
			stepId,
			input.scrollIntoView,
			signal,
			resolved,
		);
	} catch (error) {
		if (signal.aborted) return { status: "aborted" };
		const phase = readStepErrorPhase(error) ?? "wait";
		callbacks.onStepFailed(stepId, phase, error);
		return {
			status: "failed",
			stepId,
			phase,
			error,
		};
	}

	if (operation.autoFill) {
		const autoFillError = validateAutoFillTarget(highlightEl, stepId);
		if (autoFillError) {
			callbacks.onStepFailed(stepId, "autoFill", autoFillError);
			return {
				status: "failed",
				stepId,
				phase: "autoFill",
				error: autoFillError,
			};
		}
	}

	if (resolved.debug) {
		warnConflictingStepEffects(operation, stepId);
	}

	const navState = input.engineState;
	callbacks.onTargetReady({
		stepId,
		anchorEl: highlightEl,
		tooltip: operation.tooltip ?? null,
		canGoNext: navState?.canGoNext ?? false,
		canGoPrevious: navState?.canGoPrevious ?? false,
		isFirstStep: navState?.isFirstStep ?? true,
		isLastStep: navState?.isLastStep ?? false,
		isSkippable: navState?.isSkippable ?? false,
		progress: navState
			? {
					current: navState.currentStepNumber,
					total: navState.totalSteps,
					percentage: navState.progressPercentage,
				}
			: undefined,
		overlayClick: resolveOverlayClick({
			config: resolved,
			operation,
		}),
	});

	const effectsResult = await runStepEffects(highlightEl, operation, signal, {
		stepId,
		config: resolved,
		effectsDelayMs: resolveStepEffectsDelayMs(
			operation,
			resolved,
			input.hasActivatedStepBefore,
		),
		onPointerShow: callbacks.onPointerShow,
		onPointerHide: callbacks.onPointerHide,
	});

	if (effectsResult.status === "aborted") {
		return { status: "aborted" };
	}

	if (effectsResult.status === "failed") {
		callbacks.onStepFailed(stepId, effectsResult.phase, effectsResult.error);
		return {
			status: "failed",
			stepId,
			phase: effectsResult.phase,
			error: effectsResult.error,
		};
	}

	if (resolved.debug) {
		console.debug("[app-tour] step active:", stepId, operation);
	}

	return { status: "ready", stepId, activatedStep: true };
}
