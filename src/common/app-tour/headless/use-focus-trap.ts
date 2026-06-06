import { type RefObject, useEffect } from "react";
import { FOCUSABLE_SELECTOR } from "../core/libs/focusable";

export function useFocusTrap(
	containerRef: RefObject<HTMLElement | null>,
	enabled: boolean,
) {
	useEffect(() => {
		if (!enabled || !containerRef.current) return;

		const container = containerRef.current;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Tab") return;

			const focusable =
				container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		container.addEventListener("keydown", onKeyDown);
		return () => container.removeEventListener("keydown", onKeyDown);
	}, [containerRef, enabled]);
}
