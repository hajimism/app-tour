import {
	DEFAULT_AUTO_FILL_DELAY_MS,
	DEFAULT_PREPARE_SETTLE_MS,
	ELEMENT_WAIT_TIMEOUT_MS,
	HIGHLIGHT_TRANSITION_MS,
	OVERLAY_FADE_IN_MS,
	SCROLL_SETTLE_MS,
} from "./constants";
import type { AppTourConfig } from "./types/config";
import type {
	OverlayClickBehavior,
	OverlayClickHandler,
} from "./types/overlay-click";

export interface ResolvedAppTourConfig {
	readonly __resolved: true;
	debug: boolean;
	defaultScrollIntoView: boolean;
	defaultAutoFillDelayMs: number;
	elementWaitTimeoutMs: number;
	defaultPrepareSettleMs: number;
	highlightTransitionMs: number;
	overlayFadeInMs: number;
	stepEffectsDelayMs: number | undefined;
	scrollSettleMs: number;
	showProgress: boolean;
	allowOverlayClose: boolean;
	blockOverlayInteraction: boolean;
	overlayClickBehavior: OverlayClickBehavior | OverlayClickHandler;
	showStepErrors: boolean;
	defaultPageRevealMs: number;
	onStepError?: AppTourConfig["onStepError"];
	onTourComplete?: AppTourConfig["onTourComplete"];
}

export function resolveAppTourConfig(
	config?: AppTourConfig,
): ResolvedAppTourConfig {
	return {
		__resolved: true,
		debug: config?.debug ?? false,
		defaultScrollIntoView: config?.defaultScrollIntoView ?? true,
		defaultAutoFillDelayMs:
			config?.defaultAutoFillDelayMs ?? DEFAULT_AUTO_FILL_DELAY_MS,
		elementWaitTimeoutMs:
			config?.elementWaitTimeoutMs ?? ELEMENT_WAIT_TIMEOUT_MS,
		defaultPrepareSettleMs:
			config?.defaultPrepareSettleMs ?? DEFAULT_PREPARE_SETTLE_MS,
		highlightTransitionMs:
			config?.highlightTransitionMs ?? HIGHLIGHT_TRANSITION_MS,
		overlayFadeInMs: config?.overlayFadeInMs ?? OVERLAY_FADE_IN_MS,
		stepEffectsDelayMs: config?.stepEffectsDelayMs,
		scrollSettleMs: config?.scrollSettleMs ?? SCROLL_SETTLE_MS,
		showProgress: config?.showProgress ?? false,
		allowOverlayClose: config?.allowOverlayClose ?? false,
		blockOverlayInteraction: config?.blockOverlayInteraction ?? false,
		overlayClickBehavior: config?.overlayClickBehavior ?? "close",
		showStepErrors: config?.showStepErrors ?? true,
		defaultPageRevealMs: config?.defaultPageRevealMs ?? 0,
		onStepError: config?.onStepError,
		onTourComplete: config?.onTourComplete,
	};
}

export function getResolvedConfig(
	config?: AppTourConfig | ResolvedAppTourConfig,
): ResolvedAppTourConfig {
	return config && "__resolved" in config
		? config
		: resolveAppTourConfig(config);
}
