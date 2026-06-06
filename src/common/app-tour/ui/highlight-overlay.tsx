import { useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/common/lib/cn";
import {
	HIGHLIGHT_TRANSITION_MS,
	OVERLAY_FADE_IN_MS,
	Z_INDEX,
} from "../core/constants";
import { buildBackdropPanels } from "../core/libs/highlight-rect";
import {
	buildSpotlightMaskId,
	SPOTLIGHT_HOLE_RADIUS,
} from "../core/libs/spotlight-clip-path";
import {
	overlayFadeStyle,
	spotlightHoleMotionClass,
	spotlightTransitionStyle,
} from "../core/libs/spotlight-style";
import { useSpotlightRect } from "../headless/use-spotlight-rect";
export interface HighlightOverlayProps {
	anchorEl: HTMLElement | null;
	visible: boolean;
	transitionMs?: number;
	fadeIn?: boolean;
	fadeInMs?: number;
	blockInteraction?: boolean;
	onOverlayClick?: () => void;
}

export function HighlightOverlay({
	anchorEl,
	visible,
	transitionMs = HIGHLIGHT_TRANSITION_MS,
	fadeIn = false,
	fadeInMs = OVERLAY_FADE_IN_MS,
	blockInteraction = false,
	onOverlayClick,
}: HighlightOverlayProps) {
	const { rect, canAnimate } = useSpotlightRect(anchorEl, { active: visible });
	const maskId = buildSpotlightMaskId(useId().replace(/:/g, ""));

	if (typeof document === "undefined" || !visible) {
		return null;
	}

	const showBackdropPanels = blockInteraction || Boolean(onOverlayClick);
	const backdropPanels = showBackdropPanels ? buildBackdropPanels(rect) : [];

	return createPortal(
		<>
			{backdropPanels.map((panel) => (
				<button
					key={`${panel.top}-${panel.left}-${panel.width}-${panel.height}`}
					type="button"
					tabIndex={-1}
					aria-hidden="true"
					className={cn(
						"app-tour-backdrop-panel fixed cursor-default border-0 bg-transparent p-0",
						fadeIn && "app-tour-backdrop-panel--fade-in",
					)}
					style={{
						top: panel.top,
						left: panel.left,
						width: panel.width,
						height: panel.height,
						zIndex: Z_INDEX.overlay,
						...(fadeIn ? overlayFadeStyle(fadeInMs) : undefined),
					}}
					onClick={onOverlayClick}
				/>
			))}
			<svg
				aria-hidden="true"
				className={cn(
					"app-tour-spotlight-root fixed inset-0 h-full w-full",
					fadeIn && "app-tour-spotlight-root--fade-in",
				)}
				style={{
					...spotlightTransitionStyle(transitionMs),
					...(fadeIn ? overlayFadeStyle(fadeInMs) : undefined),
				}}
			>
				<defs>
					<mask id={maskId}>
						<rect width="100%" height="100%" fill="white" />
						{rect ? (
							<rect
								x={rect.left}
								y={rect.top}
								width={rect.width}
								height={rect.height}
								rx={SPOTLIGHT_HOLE_RADIUS}
								fill="black"
								className={spotlightHoleMotionClass(canAnimate)}
							/>
						) : null}
					</mask>
				</defs>
				<rect
					width="100%"
					height="100%"
					className="app-tour-spotlight-dim"
					mask={`url(#${maskId})`}
				/>
			</svg>
		</>,
		document.body,
	);
}
