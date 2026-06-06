import { Pointer as PointerIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { DEFAULT_POINTER_TRANSITION_MS } from "../core/constants";
import { pointerTransitionStyle } from "../core/libs/spotlight-style";
import type { PointerOffset } from "../core/types/step-operation";
import { useElementRect } from "../headless/use-element-rect";
export interface PointerProps {
	anchorEl: HTMLElement | null;
	offset?: PointerOffset;
	visible: boolean;
	transitionMs?: number;
}

export function Pointer({
	anchorEl,
	offset,
	visible,
	transitionMs = DEFAULT_POINTER_TRANSITION_MS,
}: PointerProps) {
	const { rect } = useElementRect(anchorEl);

	if (typeof document === "undefined" || !visible || !rect) {
		return null;
	}

	const x = rect.centerX + (offset?.x ?? 0);
	const y = rect.centerY + (offset?.y ?? 0);

	return createPortal(
		<div
			aria-hidden="true"
			className="app-tour-pointer fixed top-0 left-0"
			style={{
				transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
				...pointerTransitionStyle(transitionMs),
			}}
		>
			<div className="relative size-7">
				<span className="app-tour-pointer-ripple" aria-hidden="true" />
				<span className="app-tour-pointer-ripple" aria-hidden="true" />
				<PointerIcon className="relative z-10 size-7 stroke-[2.5] text-app-tour-pointer-color drop-shadow-md" />
			</div>
		</div>,
		document.body,
	);
}
