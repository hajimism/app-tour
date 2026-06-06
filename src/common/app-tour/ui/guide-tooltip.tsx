import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { Button } from "@/common/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
} from "@/common/ui/popover";
import {
	HIGHLIGHT_TRANSITION_MS,
	TOOLTIP_ARROW_PADDING,
	TOOLTIP_COLLISION_AVOIDANCE,
	TOOLTIP_FADE_IN_MS,
	TOOLTIP_SIDE_OFFSET,
	Z_INDEX,
} from "../core/constants";
import {
	attachDescribedBy,
	detachDescribedBy,
} from "../core/libs/aria-describedby";
import { FOCUSABLE_SELECTOR } from "../core/libs/focusable";
import {
	hasTooltipContent,
	resolveShowProgress,
	resolveTooltipButtons,
	resolveTooltipDescription,
	resolveTooltipTitle,
} from "../core/libs/resolve-tooltip";
import { tooltipFadeStyle } from "../core/libs/spotlight-style";
import type { AppTourConfig } from "../core/types/config";
import type { StepGuideViewState } from "../headless/step-guide-state";
import { useFocusTrap } from "../headless/use-focus-trap";
import { usePopoverReveal } from "../headless/use-popover-reveal";
import { useTourKeyboard } from "../headless/use-tour-keyboard";
import { useVirtualElementAnchor } from "../headless/use-virtual-element-anchor";
export interface GuideTooltipProps {
	viewState: StepGuideViewState;
	onNext: () => void;
	onPrevious: () => void;
	onSkip?: () => void;
	isNavigating?: boolean;
	config?: AppTourConfig;
	highlightTransitionMs?: number;
}

export function GuideTooltip({
	viewState,
	onNext,
	onPrevious,
	onSkip,
	isNavigating = false,
	config,
	highlightTransitionMs = HIGHLIGHT_TRANSITION_MS,
}: GuideTooltipProps) {
	const {
		stepId,
		anchorEl,
		tooltip,
		canGoNext,
		canGoPrevious,
		isFirstStep,
		isLastStep,
		isSkippable,
		progress,
	} = viewState;

	const dialogRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const descriptionId = useId();
	const liveRegionId = useId();

	const virtualAnchor = useVirtualElementAnchor(anchorEl);

	const title = tooltip ? resolveTooltipTitle(tooltip) : null;
	const description = tooltip ? resolveTooltipDescription(tooltip) : undefined;
	const isRevealed = usePopoverReveal(
		anchorEl,
		tooltip && hasTooltipContent(tooltip) ? stepId : null,
		highlightTransitionMs,
		viewState.overlayFadeIn,
	);
	const showProgress = resolveShowProgress(tooltip, config);

	const hasContent = Boolean(tooltip && hasTooltipContent(tooltip));

	useTourKeyboard({
		enabled: hasContent && isRevealed,
		dialogRef,
		isFirstStep,
		onNext,
		onPrevious,
	});

	useFocusTrap(dialogRef, isRevealed);

	useEffect(() => {
		if (!anchorEl || !hasContent || !isRevealed) return;
		attachDescribedBy(anchorEl, descriptionId);
		return () => detachDescribedBy(anchorEl, descriptionId);
	}, [anchorEl, descriptionId, hasContent, isRevealed]);

	useLayoutEffect(() => {
		if (!isRevealed || !dialogRef.current) return;
		const focusable =
			dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
		focusable?.focus();
	}, [isRevealed]);

	if (
		typeof document === "undefined" ||
		!tooltip ||
		!hasContent ||
		!anchorEl ||
		!isRevealed
	) {
		return null;
	}

	const placement = tooltip.placement ?? "bottom";
	const buttons = resolveTooltipButtons(tooltip, { isFirstStep, isLastStep });

	return (
		<>
			<div
				id={liveRegionId}
				className="app-tour-sr-only"
				aria-live="polite"
				aria-atomic="true"
			>
				{title}
			</div>
			<Popover open={isRevealed}>
				<PopoverContent
					ref={dialogRef}
					anchor={virtualAnchor}
					positionMethod="fixed"
					side={placement}
					align={tooltip.align ?? "center"}
					alignOffset={tooltip.alignOffset ?? 0}
					sideOffset={TOOLTIP_SIDE_OFFSET}
					arrowPadding={TOOLTIP_ARROW_PADDING}
					collisionAvoidance={TOOLTIP_COLLISION_AVOIDANCE}
					showArrow
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
					aria-describedby={
						description !== undefined ? descriptionId : undefined
					}
					positionerStyle={{ zIndex: Z_INDEX.tooltip }}
					className="app-tour-tooltip pointer-events-auto animate-in fade-in duration-300 data-open:zoom-in-100 data-closed:zoom-out-100"
					style={tooltipFadeStyle(TOOLTIP_FADE_IN_MS)}
				>
					<PopoverHeader>
						<div className="flex items-start justify-between gap-2">
							<PopoverTitle
								id={titleId}
								className="app-tour-tooltip-title min-w-0"
							>
								{title}
							</PopoverTitle>
							{showProgress && progress ? (
								<span className="app-tour-tooltip-progress shrink-0 text-xs tabular-nums">
									{progress.current} / {progress.total}
								</span>
							) : null}
						</div>
						{description !== undefined ? (
							<PopoverDescription
								id={descriptionId}
								className="app-tour-tooltip-description"
							>
								{description}
							</PopoverDescription>
						) : null}
					</PopoverHeader>
					<div className="flex justify-end gap-2">
						{isSkippable && onSkip ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="mr-auto"
								disabled={isNavigating}
								onClick={onSkip}
							>
								{buttons.skip}
							</Button>
						) : null}
						{!isFirstStep && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isNavigating || !canGoPrevious}
								onClick={onPrevious}
							>
								{buttons.previous}
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							disabled={isNavigating || (!isLastStep && !canGoNext)}
							onClick={onNext}
						>
							{buttons.next}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}
