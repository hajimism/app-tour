import { useMemo, useRef } from "react";

export function useVirtualElementAnchor(anchorEl: HTMLElement | null) {
	const anchorElRef = useRef(anchorEl);
	anchorElRef.current = anchorEl;

	return useMemo(
		() => () => ({
			getBoundingClientRect: () => {
				const el = anchorElRef.current;
				return el ? el.getBoundingClientRect() : new DOMRect(0, 0, 0, 0);
			},
		}),
		[],
	);
}
