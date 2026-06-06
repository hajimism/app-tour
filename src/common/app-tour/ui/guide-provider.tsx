import { OnboardingProvider } from "@onboardjs/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	APP_TOUR_COMPONENT_REGISTRY,
	tourStepsToOnboardSteps,
} from "../core/adapters/onboardjs";
import { resolveShowProgress } from "../core/libs/resolve-tooltip";
import {
	formatStepErrorMessage,
	reportStepError,
} from "../core/report-step-error";
import { resolveAppTourConfig } from "../core/resolve-app-tour-config";
import type { AppTourConfig, TourStep } from "../core/types/config";
import type {
	StepGuideError,
	StepGuideViewState,
} from "../headless/step-guide-state";
import {
	type TourCatalog,
	TourEngineBridge,
	TourProvider,
	useTour,
} from "../headless/tour-context";
import { useGuideOverlayActions } from "../headless/use-guide-overlay-actions";
import { useStepGuide } from "../headless/use-step-guide";
import { useTourEscape } from "../headless/use-tour-escape";
import { GuideStepError } from "./guide-step-error";
import { GuideTooltip } from "./guide-tooltip";
import { HighlightOverlay } from "./highlight-overlay";
import { Pointer } from "./pointer";
import "./app-tour.css";

export interface RenderTooltipProps extends StepGuideViewState {
	onNext: () => void;
	onPrevious: () => void;
	onSkip?: () => void;
	onEscape: () => void;
	isNavigating: boolean;
	showProgress: boolean;
	highlightTransitionMs: number;
	config?: AppTourConfig;
}

export interface GuideProviderProps {
	/** Single tour — shorthand for `tours={{ default: steps }}`. */
	steps?: TourStep[];
	/** Multiple named tours (e.g. playground + cross-page demo). */
	tours?: TourCatalog;
	defaultTour?: string;
	children: ReactNode;
	config?: AppTourConfig;
	renderTooltip?: (props: RenderTooltipProps) => ReactNode;
}

function GuideLayer({
	config,
	renderTooltip,
}: {
	config?: AppTourConfig;
	renderTooltip?: GuideProviderProps["renderTooltip"];
}) {
	const { isRunning, stopTour } = useTour();
	const resolvedConfig = useMemo(() => resolveAppTourConfig(config), [config]);

	useTourEscape({
		enabled: isRunning,
		onEscape: () => void stopTour(),
	});

	const {
		viewState,
		handleNext,
		handlePrevious,
		handleSkip,
		handleRetryStep,
		handleDismissError,
		isNavigating,
	} = useStepGuide({
		config,
		enabled: isRunning,
	});

	const handleOverlayClick = useGuideOverlayActions({
		viewState,
		stopTour,
		handleNext,
	});

	if (!isRunning) return null;

	const showTourChrome = !viewState.overlayPaused;

	const tooltipProps: RenderTooltipProps = {
		...viewState,
		onNext: () => void handleNext(),
		onPrevious: () => void handlePrevious(),
		onSkip: viewState.isSkippable ? () => void handleSkip() : undefined,
		onEscape: () => void stopTour(),
		isNavigating,
		showProgress: resolveShowProgress(viewState.tooltip, resolvedConfig),
		highlightTransitionMs: resolvedConfig.highlightTransitionMs,
		config,
	};

	return (
		<>
			<HighlightOverlay
				anchorEl={viewState.anchorEl}
				visible={isRunning && showTourChrome && viewState.anchorEl !== null}
				transitionMs={resolvedConfig.highlightTransitionMs}
				fadeIn={viewState.overlayFadeIn}
				fadeInMs={resolvedConfig.overlayFadeInMs}
				blockInteraction={resolvedConfig.blockOverlayInteraction}
				onOverlayClick={
					viewState.overlayClick.allowClose ? handleOverlayClick : undefined
				}
			/>
			{resolvedConfig.showStepErrors && viewState.stepError ? (
				<GuideStepError
					error={viewState.stepError}
					onRetry={handleRetryStep}
					onDismiss={handleDismissError}
					onStopTour={() => void stopTour()}
				/>
			) : null}
			{showTourChrome &&
				(renderTooltip ? (
					renderTooltip(tooltipProps)
				) : (
					<GuideTooltip
						viewState={viewState}
						onNext={tooltipProps.onNext}
						onPrevious={tooltipProps.onPrevious}
						onSkip={tooltipProps.onSkip}
						isNavigating={isNavigating}
						config={config}
						highlightTransitionMs={resolvedConfig.highlightTransitionMs}
					/>
				))}
			{showTourChrome ? (
				<Pointer
					anchorEl={viewState.pointerTarget?.el ?? null}
					offset={viewState.pointerTarget?.offset}
					visible={viewState.pointerVisible}
				/>
			) : null}
		</>
	);
}

function OnboardingHost({
	config,
	renderTooltip,
}: {
	config?: AppTourConfig;
	renderTooltip?: GuideProviderProps["renderTooltip"];
}) {
	const { activeTourId, activeSteps, isRunning, startTour } = useTour();
	const resolvedConfig = useMemo(() => resolveAppTourConfig(config), [config]);
	const [startError, setStartError] = useState<StepGuideError | null>(null);
	const onboardSteps = useMemo(
		() => tourStepsToOnboardSteps(activeSteps),
		[activeSteps],
	);

	const handleStartFailed = useCallback(
		(stepId: string, error: unknown) => {
			reportStepError(resolvedConfig, stepId, "engine", error);
			setStartError({
				stepId,
				phase: "engine",
				message: formatStepErrorMessage(error),
			});
		},
		[resolvedConfig],
	);

	useEffect(() => {
		if (isRunning) {
			setStartError(null);
		}
	}, [isRunning]);

	return (
		<>
			<OnboardingProvider
				key={activeTourId}
				steps={onboardSteps}
				componentRegistry={APP_TOUR_COMPONENT_REGISTRY}
				debug={resolvedConfig.debug}
				onFlowComplete={(event) =>
					resolvedConfig.onTourComplete?.({ duration: event.duration })
				}
			>
				<TourEngineBridge onStartFailed={handleStartFailed} />
				<GuideLayer config={config} renderTooltip={renderTooltip} />
			</OnboardingProvider>
			{resolvedConfig.showStepErrors && startError ? (
				<GuideStepError
					error={startError}
					onRetry={() => {
						setStartError(null);
						void startTour();
					}}
					onDismiss={() => setStartError(null)}
					onStopTour={() => setStartError(null)}
				/>
			) : null}
		</>
	);
}

export function GuideProvider({
	steps,
	tours,
	defaultTour,
	children,
	config,
	renderTooltip,
}: GuideProviderProps) {
	const catalog = useMemo(() => {
		if (tours) return tours;
		if (steps) return { default: steps };
		throw new Error("GuideProvider requires `steps` or `tours`");
	}, [steps, tours]);

	const resolvedDefaultTour =
		defaultTour ?? (steps && !tours ? "default" : Object.keys(catalog)[0]);

	if (!resolvedDefaultTour || !catalog[resolvedDefaultTour]) {
		throw new Error(
			"GuideProvider: invalid defaultTour or empty tours catalog",
		);
	}

	return (
		<TourProvider tours={catalog} defaultTour={resolvedDefaultTour}>
			{children}
			<OnboardingHost config={config} renderTooltip={renderTooltip} />
		</TourProvider>
	);
}
