import { useEffect, useRef, useState } from "react";
import {
	FIRST_TOOLTIP_REVEAL_MS,
	HIGHLIGHT_TRANSITION_MS,
} from "../core/constants";

export function resolvePopoverRevealDelay(
	overlayEntrance: boolean,
	hasRevealedOnce: boolean,
	transitionMs: number,
): number {
	if (overlayEntrance) return FIRST_TOOLTIP_REVEAL_MS;
	return hasRevealedOnce ? transitionMs : FIRST_TOOLTIP_REVEAL_MS;
}

export function usePopoverReveal(
	anchorEl: HTMLElement | null,
	revealKey: string | null | undefined,
	transitionMs = HIGHLIGHT_TRANSITION_MS,
	overlayEntrance = false,
) {
	const [isRevealed, setIsRevealed] = useState(false);
	const hasRevealedOnceRef = useRef(false);
	const prevRevealKeyRef = useRef<string | null | undefined>(revealKey);

	useEffect(() => {
		if (!anchorEl || !revealKey) {
			setIsRevealed(false);
			hasRevealedOnceRef.current = false;
			prevRevealKeyRef.current = revealKey;
			return;
		}

		const revealKeyChanged = prevRevealKeyRef.current !== revealKey;
		prevRevealKeyRef.current = revealKey;

		if (revealKeyChanged) {
			setIsRevealed(false);
		}

		const delay = resolvePopoverRevealDelay(
			overlayEntrance,
			hasRevealedOnceRef.current,
			transitionMs,
		);
		const timer = window.setTimeout(() => {
			hasRevealedOnceRef.current = true;
			setIsRevealed(true);
		}, delay);

		return () => window.clearTimeout(timer);
	}, [anchorEl, revealKey, transitionMs, overlayEntrance]);

	return isRevealed;
}
