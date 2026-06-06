import { HIGHLIGHT_PADDING } from "../constants";

export interface SpotlightRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

export interface ElementRect {
	top: number;
	left: number;
	width: number;
	height: number;
	centerX: number;
	centerY: number;
}

export function toSpotlightRectFromElementRect(
	rect: ElementRect,
	padding = HIGHLIGHT_PADDING,
): SpotlightRect {
	return {
		top: rect.top - padding,
		left: rect.left - padding,
		width: rect.width + padding * 2,
		height: rect.height + padding * 2,
	};
}

export function toSpotlightRect(
	el: Element,
	padding = HIGHLIGHT_PADDING,
): SpotlightRect {
	return toSpotlightRectFromElementRect(getElementRect(el), padding);
}

export function getElementRect(el: Element): ElementRect {
	const rect = el.getBoundingClientRect();
	return {
		top: rect.top,
		left: rect.left,
		width: rect.width,
		height: rect.height,
		centerX: rect.left + rect.width / 2,
		centerY: rect.top + rect.height / 2,
	};
}

/** Returns null for disconnected nodes or zero-size boxes (e.g. after route unmount). */
export function getConnectedElementRect(el: Element): ElementRect | null {
	if (!el.isConnected) return null;
	const rect = getElementRect(el);
	if (rect.width <= 0 && rect.height <= 0) return null;
	return rect;
}

export function scrollTargetIntoView(
	el: Element,
	options?: { block?: ScrollLogicalPosition },
): void {
	el.scrollIntoView({
		behavior: "smooth",
		block: options?.block ?? "center",
		inline: "nearest",
	});
}

export interface BackdropPanel {
	top: number;
	left: number;
	width: number;
	height: number;
}

export function buildBackdropPanels(
	hole: SpotlightRect | null,
	viewport = {
		width: window.innerWidth,
		height: window.innerHeight,
	},
): BackdropPanel[] {
	const { width, height } = viewport;

	if (!hole) {
		return [{ top: 0, left: 0, width, height }];
	}

	const { top, left, width: holeWidth, height: holeHeight } = hole;
	const right = left + holeWidth;
	const bottom = top + holeHeight;

	return [
		{ top: 0, left: 0, width, height: top },
		{ top, left: 0, width: left, height: holeHeight },
		{ top, left: right, width: width - right, height: holeHeight },
		{ top: bottom, left: 0, width, height: height - bottom },
	].filter((panel) => panel.width > 0 && panel.height > 0);
}
