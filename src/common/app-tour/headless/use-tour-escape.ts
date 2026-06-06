import { useEffect, useEffectEvent } from "react";

interface UseTourEscapeOptions {
	enabled: boolean;
	onEscape: () => void;
}

/** Stops the tour on Escape while it is running (works even without a visible tooltip). */
export function useTourEscape({ enabled, onEscape }: UseTourEscapeOptions) {
	const onEscapeEvent = useEffectEvent(onEscape);

	useEffect(() => {
		if (!enabled) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			// Capture phase: run before Popover/Base UI dismiss handlers on bubble.
			event.preventDefault();
			event.stopPropagation();
			onEscapeEvent();
		};

		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [enabled]);
}
