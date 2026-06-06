import type { SpotlightRect } from "./highlight-rect";

export const SPOTLIGHT_HOLE_RADIUS = 8;

export function buildSpotlightMaskId(uniqueId: string): string {
	return `app-tour-spotlight-mask-${uniqueId}`;
}

export interface SpotlightHoleRect extends SpotlightRect {
	radius?: number;
}
