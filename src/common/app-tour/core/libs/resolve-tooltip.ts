import type { ReactNode } from "react";
import type { ResolvedAppTourConfig } from "../resolve-app-tour-config";
import { getResolvedConfig } from "../resolve-app-tour-config";
import type { AppTourConfig } from "../types/config";
import type { TooltipButtonLabels, TooltipSpec } from "../types/step-operation";

export const DEFAULT_TOOLTIP_TITLE = "Guide";

export const DEFAULT_TOOLTIP_BUTTONS = {
	next: "Next",
	previous: "Back",
	firstNext: "Start!",
	lastNext: "Done!",
	skip: "Skip",
} as const satisfies TooltipButtonLabels;

interface ResolveTooltipButtonsOptions {
	isFirstStep: boolean;
	isLastStep: boolean;
}

function isEmptyTooltipNode(value: ReactNode | undefined): boolean {
	return value === undefined || value === null || value === false;
}

export function resolveTooltipDescription(
	tooltip: TooltipSpec,
): ReactNode | undefined {
	const description = tooltip.description ?? tooltip.text;
	return isEmptyTooltipNode(description) ? undefined : description;
}

export function resolveTooltipTitle(tooltip: TooltipSpec): ReactNode {
	const title = tooltip.title;
	return isEmptyTooltipNode(title) ? DEFAULT_TOOLTIP_TITLE : title;
}

export function hasTooltipContent(tooltip: TooltipSpec): boolean {
	return (
		!isEmptyTooltipNode(resolveTooltipDescription(tooltip)) ||
		!isEmptyTooltipNode(tooltip.title)
	);
}

export function resolveShowProgress(
	tooltip: TooltipSpec | null | undefined,
	config?: AppTourConfig | ResolvedAppTourConfig,
): boolean {
	if (tooltip?.showProgress !== undefined) return tooltip.showProgress;
	const resolved = getResolvedConfig(config);
	return resolved.showProgress;
}

export function resolveTooltipButtons(
	tooltip: TooltipSpec,
	{ isFirstStep, isLastStep }: ResolveTooltipButtonsOptions,
) {
	const labels = { ...DEFAULT_TOOLTIP_BUTTONS, ...tooltip.buttons };

	return {
		next: isLastStep
			? labels.lastNext
			: isFirstStep
				? labels.firstNext
				: labels.next,
		previous: labels.previous,
		skip: labels.skip,
	};
}
