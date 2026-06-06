import { useOnboarding } from "@onboardjs/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { TourStep } from "../core/types/config";

export type TourCatalog = Record<string, TourStep[]>;

export interface TourContextValue {
	isRunning: boolean;
	activeTourId: string;
	activeSteps: TourStep[];
	startTour: (tourId?: string) => Promise<void>;
	stopTour: () => Promise<void>;
}

interface TourStateValue {
	isRunning: boolean;
	activeTourId: string;
	activeSteps: TourStep[];
}

interface TourActionsValue {
	startTour: (tourId?: string) => Promise<void>;
	stopTour: () => Promise<void>;
}

interface TourBridgeValue {
	shouldStart: boolean;
	clearShouldStart: () => void;
	finishTour: () => void;
	markTourRunning: () => void;
	bindEngineReset: (reset: (() => Promise<void>) | null) => void;
}

const TourStateContext = createContext<TourStateValue | null>(null);
const TourActionsContext = createContext<TourActionsValue | null>(null);
const TourBridgeContext = createContext<TourBridgeValue | null>(null);

export function useTour(): TourContextValue {
	const state = useContext(TourStateContext);
	const actions = useContext(TourActionsContext);
	if (!state || !actions) {
		throw new Error("useTour must be used within GuideProvider");
	}
	return { ...state, ...actions };
}

function useTourBridge(): TourBridgeValue {
	const bridge = useContext(TourBridgeContext);
	if (!bridge) {
		throw new Error("useTourBridge must be used within GuideProvider");
	}
	return bridge;
}

interface TourProviderProps {
	tours: TourCatalog;
	defaultTour: string;
	children: ReactNode;
}

export function TourProvider({
	tours,
	defaultTour,
	children,
}: TourProviderProps) {
	const [activeTourId, setActiveTourId] = useState(defaultTour);
	const [isRunning, setIsRunning] = useState(false);
	const [shouldStart, setShouldStart] = useState(false);
	const engineResetRef = useRef<(() => Promise<void>) | null>(null);

	const activeSteps = tours[activeTourId] ?? [];

	const startTour = useCallback(
		async (tourId?: string) => {
			const id = tourId ?? defaultTour;
			const steps = tours[id];
			if (!steps?.[0]) return;

			setActiveTourId(id);
			setShouldStart(true);
		},
		[defaultTour, tours],
	);

	const stopTour = useCallback(async () => {
		setIsRunning(false);
		setShouldStart(false);
		await engineResetRef.current?.();
	}, []);

	const finishTour = useCallback(() => {
		setIsRunning(false);
		setShouldStart(false);
	}, []);

	const markTourRunning = useCallback(() => {
		setIsRunning(true);
	}, []);

	const clearShouldStart = useCallback(() => {
		setShouldStart(false);
	}, []);

	const bindEngineReset = useCallback((reset: (() => Promise<void>) | null) => {
		engineResetRef.current = reset;
	}, []);

	const stateValue = useMemo(
		() => ({
			isRunning,
			activeTourId,
			activeSteps,
		}),
		[activeSteps, activeTourId, isRunning],
	);

	const actionsValue = useMemo(
		() => ({
			startTour,
			stopTour,
		}),
		[startTour, stopTour],
	);

	const bridgeValue = useMemo(
		() => ({
			shouldStart,
			clearShouldStart,
			finishTour,
			markTourRunning,
			bindEngineReset,
		}),
		[
			bindEngineReset,
			clearShouldStart,
			finishTour,
			markTourRunning,
			shouldStart,
		],
	);

	return (
		<TourStateContext.Provider value={stateValue}>
			<TourActionsContext.Provider value={actionsValue}>
				<TourBridgeContext.Provider value={bridgeValue}>
					{children}
				</TourBridgeContext.Provider>
			</TourActionsContext.Provider>
		</TourStateContext.Provider>
	);
}

export interface TourEngineBridgeProps {
	onStartFailed?: (stepId: string, error: unknown) => void;
}

/** Wires OnboardJS goToStep / reset to TourProvider start & stop. */
export function TourEngineBridge({
	onStartFailed,
}: TourEngineBridgeProps = {}) {
	const { activeSteps } = useTour();
	const {
		shouldStart,
		clearShouldStart,
		finishTour,
		markTourRunning,
		bindEngineReset,
	} = useTourBridge();
	const { goToStep, reset, isCompleted } = useOnboarding();

	useEffect(() => {
		if (isCompleted) {
			finishTour();
		}
	}, [finishTour, isCompleted]);

	useEffect(() => {
		bindEngineReset(async () => {
			await reset();
		});
		return () => bindEngineReset(null);
	}, [bindEngineReset, reset]);

	useEffect(() => {
		if (!shouldStart) return;

		const firstStepId = activeSteps[0]?.id;
		if (!firstStepId) {
			clearShouldStart();
			return;
		}

		let cancelled = false;

		void (async () => {
			try {
				await reset();
				if (cancelled) return;
				await goToStep(firstStepId);
				if (cancelled) return;
				markTourRunning();
			} catch (error) {
				if (!cancelled) {
					onStartFailed?.(firstStepId, error);
				}
			} finally {
				if (!cancelled) {
					clearShouldStart();
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [
		activeSteps,
		clearShouldStart,
		goToStep,
		markTourRunning,
		reset,
		shouldStart,
		onStartFailed,
	]);

	return null;
}
