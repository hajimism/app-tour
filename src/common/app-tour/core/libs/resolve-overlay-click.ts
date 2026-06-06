import {
	getResolvedConfig,
	type ResolvedAppTourConfig,
} from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type {
	OverlayClickBehavior,
	OverlayClickHandler,
	ResolvedOverlayClickBehavior,
} from "../types/overlay-click";
import type { StepOperation } from "../types/step-operation";

export interface ResolvedOverlayClick {
	allowClose: boolean;
	behavior: ResolvedOverlayClickBehavior;
}

export function resolveOverlayClick(options: {
	config?: AppTourConfig | ResolvedAppTourConfig;
	operation?: StepOperation;
}): ResolvedOverlayClick {
	const { operation } = options;
	const resolved = getResolvedConfig(options.config);

	return {
		allowClose: operation?.allowOverlayClose ?? resolved.allowOverlayClose,
		behavior: operation?.overlayClickBehavior ?? resolved.overlayClickBehavior,
	};
}

export function isOverlayClickHandler(
	behavior: ResolvedOverlayClickBehavior,
): behavior is OverlayClickHandler {
	return typeof behavior === "function";
}

export function isOverlayClickBehavior(
	behavior: ResolvedOverlayClickBehavior,
): behavior is OverlayClickBehavior {
	return behavior === "close" || behavior === "nextStep";
}
