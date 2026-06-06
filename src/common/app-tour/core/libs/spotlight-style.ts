import type { CSSProperties } from "react";
import { HIGHLIGHT_TRANSITION_MS } from "../constants";

export function spotlightHoleMotionClass(canAnimate: boolean): string {
	return canAnimate
		? "app-tour-spotlight-hole"
		: "app-tour-spotlight-hole app-tour-spotlight-hole--static";
}

export function spotlightTransitionStyle(
	transitionMs = HIGHLIGHT_TRANSITION_MS,
): CSSProperties {
	return {
		["--app-tour-highlight-transition-ms" as string]: `${transitionMs}ms`,
	};
}

export function pointerTransitionStyle(transitionMs: number): CSSProperties {
	return {
		["--app-tour-pointer-transition-ms" as string]: `${transitionMs}ms`,
	};
}

export function overlayFadeStyle(fadeMs: number): CSSProperties {
	return {
		["--app-tour-overlay-fade-ms" as string]: `${fadeMs}ms`,
	};
}

export function tooltipFadeStyle(fadeMs: number): CSSProperties {
	return {
		["--app-tour-tooltip-fade-ms" as string]: `${fadeMs}ms`,
	};
}
