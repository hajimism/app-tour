import { type RefObject, useEffect, useEffectEvent } from "react";

interface UseTourKeyboardOptions {
	enabled: boolean;
	dialogRef: RefObject<HTMLElement | null>;
	isFirstStep: boolean;
	onNext: () => void;
	onPrevious: () => void;
}

export function isEditableFocusTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;

	return Boolean(
		target.closest("input, textarea, select, [contenteditable='true']") ||
			target.isContentEditable,
	);
}

/** Arrow nav works in the tooltip, or anywhere except editable fields (e.g. after autoFill in a Drawer). */
export function resolveTourArrowAction(
	key: string,
	activeElement: Element | null,
	tooltipRoot: HTMLElement | null,
): "next" | "previous" | null {
	if (key !== "ArrowRight" && key !== "ArrowLeft") return null;

	const focusInTooltip = Boolean(tooltipRoot?.contains(activeElement));
	if (!focusInTooltip && isEditableFocusTarget(activeElement)) return null;

	return key === "ArrowRight" ? "next" : "previous";
}

export function useTourKeyboard({
	enabled,
	dialogRef,
	isFirstStep,
	onNext,
	onPrevious,
}: UseTourKeyboardOptions) {
	const onNextEvent = useEffectEvent(onNext);
	const onPreviousEvent = useEffectEvent(onPrevious);
	const isFirstStepEvent = useEffectEvent(() => isFirstStep);

	useEffect(() => {
		if (!enabled) return;

		const onKeyDown = (event: KeyboardEvent) => {
			const action = resolveTourArrowAction(
				event.key,
				document.activeElement,
				dialogRef.current,
			);
			if (!action) return;

			event.preventDefault();
			if (action === "next") {
				void onNextEvent();
				return;
			}
			if (!isFirstStepEvent()) {
				void onPreviousEvent();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [enabled, dialogRef]);
}
