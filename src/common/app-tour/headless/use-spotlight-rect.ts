import { HIGHLIGHT_PADDING } from "../core/constants";
import {
	type SpotlightRect,
	toSpotlightRectFromElementRect,
} from "../core/libs/highlight-rect";
import { useElementRect } from "./use-element-rect";

export type { SpotlightRect };

export function useSpotlightRect(
	anchorEl: HTMLElement | null,
	options?: { padding?: number; active?: boolean },
) {
	const padding = options?.padding ?? HIGHLIGHT_PADDING;
	const active = options?.active ?? true;
	const { rect: elementRect, canAnimate } = useElementRect(anchorEl, active);
	const rect = elementRect
		? toSpotlightRectFromElementRect(elementRect, padding)
		: null;

	return { rect, canAnimate };
}
