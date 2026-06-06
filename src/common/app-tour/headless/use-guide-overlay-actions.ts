import { useCallback } from "react";
import {
	isOverlayClickBehavior,
	isOverlayClickHandler,
} from "../core/libs/resolve-overlay-click";
import type { StepGuideViewState } from "./step-guide-state";

interface UseGuideOverlayActionsOptions {
	viewState: StepGuideViewState;
	stopTour: () => void | Promise<void>;
	handleNext: () => void | Promise<void>;
}

export function useGuideOverlayActions({
	viewState,
	stopTour,
	handleNext,
}: UseGuideOverlayActionsOptions) {
	const { overlayClick, stepId, anchorEl, isFirstStep, isLastStep } = viewState;

	return useCallback(() => {
		if (!overlayClick.allowClose) return;

		const ctx = {
			stepId: stepId ?? "unknown",
			anchorEl,
			isFirstStep,
			isLastStep,
		};

		const { behavior } = overlayClick;

		if (isOverlayClickBehavior(behavior)) {
			if (behavior === "close") {
				void stopTour();
				return;
			}
			void handleNext();
			return;
		}

		if (isOverlayClickHandler(behavior)) {
			behavior(ctx);
		}
	}, [
		anchorEl,
		handleNext,
		isFirstStep,
		isLastStep,
		overlayClick,
		stepId,
		stopTour,
	]);
}
