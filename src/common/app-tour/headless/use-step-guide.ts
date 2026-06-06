import type { OnboardingStep } from "@onboardjs/core";
import { useOnboarding } from "@onboardjs/react";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { getStepMeta } from "../core/adapters/onboardjs";
import {
	formatStepErrorMessage,
	reportStepError,
} from "../core/report-step-error";
import { resolveAppTourConfig } from "../core/resolve-app-tour-config";
import { runCompleteClick } from "../core/step/run-step-effects";
import { runStepSequence } from "../core/step/run-step-sequence";
import type { AppTourConfig, StepErrorPhase } from "../core/types/config";
import { createPointerDispatchers } from "./pointer-dispatchers";
import { INITIAL_VIEW_STATE, stepGuideReducer } from "./step-guide-state";

export type {
	PointerTarget,
	StepGuideError,
	StepGuideViewState,
} from "./step-guide-state";

interface UseStepGuideOptions {
	config?: AppTourConfig;
	enabled?: boolean;
}

export function useStepGuide(options?: UseStepGuideOptions) {
	const { config, enabled = true } = options ?? {};
	const resolvedConfig = useMemo(() => resolveAppTourConfig(config), [config]);
	const configRef = useRef(resolvedConfig);
	configRef.current = resolvedConfig;

	const { engine, next, previous, skip, state, loading } = useOnboarding();
	const [viewState, dispatch] = useReducer(
		stepGuideReducer,
		INITIAL_VIEW_STATE,
	);
	const abortRef = useRef<AbortController | null>(null);
	const hasActivatedStepRef = useRef(false);
	const isNavigating = loading.isEngineProcessing || loading.isAnyLoading;

	const dispatchStepFailed = useCallback(
		(stepId: string, phase: StepErrorPhase, error: unknown) => {
			reportStepError(configRef.current, stepId, phase, error);
			dispatch({
				type: "STEP_FAILED",
				payload: {
					stepId,
					phase,
					message: formatStepErrorMessage(error),
				},
			});
		},
		[],
	);

	const pointerDispatchers = useMemo(
		() => createPointerDispatchers(dispatch),
		[],
	);

	const cleanupActiveStep = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		hasActivatedStepRef.current = false;
		dispatch({ type: "RESET" });
	}, []);

	const activateStep = useCallback(
		(step: OnboardingStep) => {
			if (!enabled) return;

			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			const meta = getStepMeta(step);
			if (!meta) return;

			const { operation } = meta;
			const stepId = String(step.id);
			const navState = engine?.getState();

			void runStepSequence(
				{
					stepId,
					operation,
					pageRevealMs: meta.pageRevealMs,
					scrollIntoView:
						operation.scrollIntoView ?? configRef.current.defaultScrollIntoView,
					engineState: navState
						? {
								canGoNext: navState.canGoNext,
								canGoPrevious: navState.canGoPrevious,
								isFirstStep: navState.isFirstStep,
								isLastStep: navState.isLastStep,
								isSkippable: navState.isSkippable,
								currentStepNumber: navState.currentStepNumber,
								totalSteps: navState.totalSteps,
								progressPercentage: navState.progressPercentage,
							}
						: null,
					hasActivatedStepBefore: hasActivatedStepRef.current,
					config: configRef.current,
				},
				controller.signal,
				{
					...pointerDispatchers,
					onOverlayPaused: (paused) =>
						dispatch({ type: "SET_OVERLAY_PAUSED", payload: paused }),
					onStepFailed: dispatchStepFailed,
					onTargetReady: (payload) =>
						dispatch({ type: "TARGET_READY", payload }),
				},
			).then((result) => {
				if (result.status === "ready") {
					hasActivatedStepRef.current = true;
				}
			});
		},
		[enabled, engine, dispatchStepFailed, pointerDispatchers],
	);

	useEffect(() => {
		if (!enabled || !engine) return;

		const unsubscribeActive = engine.addStepActiveListener(({ step }) => {
			activateStep(step);
		});

		const activeStep = engine.getState()?.currentStep;
		if (activeStep) {
			activateStep(activeStep);
		}

		const unsubscribeError = engine.addErrorListener(({ error }) => {
			const stepId = engine.getState()?.currentStep?.id;
			dispatchStepFailed(stepId ? String(stepId) : "unknown", "engine", error);
		});

		return () => {
			unsubscribeActive();
			unsubscribeError();
			cleanupActiveStep();
		};
	}, [enabled, engine, activateStep, cleanupActiveStep, dispatchStepFailed]);

	useEffect(() => {
		if (!enabled || !engine) {
			cleanupActiveStep();
		}
	}, [enabled, engine, cleanupActiveStep]);

	const handleNext = useCallback(async () => {
		if (!enabled || isNavigating) return;

		const currentStep = engine?.getState()?.currentStep;
		const meta = currentStep ? getStepMeta(currentStep) : null;
		const stepId = currentStep ? String(currentStep.id) : null;
		const anchorEl = viewState.anchorEl;

		if (meta && stepId && anchorEl && meta.operation.click) {
			const controller = abortRef.current;
			if (controller && !controller.signal.aborted) {
				const clickResult = await runCompleteClick(
					anchorEl,
					meta.operation,
					stepId,
					controller.signal,
					{
						...pointerDispatchers,
						config: configRef.current,
						onStepFailed: (phase: StepErrorPhase, error: unknown) =>
							dispatchStepFailed(stepId, phase, error),
					},
				);
				if (clickResult === "failed") return;
			}
		}

		await next();
	}, [
		enabled,
		isNavigating,
		next,
		engine,
		viewState.anchorEl,
		dispatchStepFailed,
		pointerDispatchers,
	]);

	const handlePrevious = useCallback(async () => {
		if (!enabled || isNavigating || state?.isFirstStep) return;
		await previous();
	}, [enabled, isNavigating, previous, state?.isFirstStep]);

	const handleSkip = useCallback(async () => {
		if (!enabled || isNavigating) return;
		await skip();
	}, [enabled, isNavigating, skip]);

	const handleRetryStep = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });
		const activeStep = engine?.getState()?.currentStep;
		if (activeStep) {
			activateStep(activeStep);
		}
	}, [engine, activateStep]);

	const handleDismissError = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });
	}, []);

	return {
		viewState,
		handleNext,
		handlePrevious,
		handleSkip,
		handleRetryStep,
		handleDismissError,
		isNavigating,
	};
}
