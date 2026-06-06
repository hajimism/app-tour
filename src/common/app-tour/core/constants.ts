export const HIGHLIGHT_PADDING = 8;
export const TOOLTIP_SIDE_OFFSET = 18;
export const TOOLTIP_ARROW_PADDING = 8;
export const TOOLTIP_COLLISION_AVOIDANCE = {
	side: "shift",
	align: "shift",
	fallbackAxisSide: "none",
} as const;

/** Mirrors `--app-tour-z-overlay` in ui/app-tour.css */
export const Z_INDEX = {
	overlay: 9998,
	tooltip: 9999,
	pointer: 10000,
} as const;

export const DEFAULT_AUTO_FILL_DELAY_MS = 60;
export const DEFAULT_POINTER_TRANSITION_MS = 300;
export const HIGHLIGHT_TRANSITION_MS = 400;
export const SCROLL_SETTLE_MS = 300;
export const FIRST_TOOLTIP_REVEAL_MS = 0;
export const OVERLAY_FADE_IN_MS = 400;
export const TOOLTIP_FADE_IN_MS = 300;
export const DEFAULT_PREPARE_SETTLE_MS = 300;
export const ELEMENT_WAIT_TIMEOUT_MS = 5000;
export const APP_TOUR_COMPONENT_KEY = "app-tour" as const;
export const APP_TOUR_TARGET_ATTR = "data-app-tour" as const;
