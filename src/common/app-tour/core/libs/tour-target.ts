import { APP_TOUR_TARGET_ATTR } from "../constants";
import { type WaitForElementOptions, waitForElement } from "./wait-for-element";

export function tourTargetSelector(stepId: string): string {
	return `[${APP_TOUR_TARGET_ATTR}="${CSS.escape(stepId)}"]`;
}

const CSS_SELECTOR_START = /^[#.[>*+~:]/;

/** Bare ids like `open-dialog` resolve to `[data-app-tour="…"]`; `#id` / `[attr]` stay as CSS. */
export function isCssSelector(value: string): boolean {
	if (CSS_SELECTOR_START.test(value)) return true;
	return /[\s,>+~[\]:.]|::/.test(value);
}

export function resolveStringHighlightTarget(value: string): string {
	return isCssSelector(value) ? value : tourTargetSelector(value);
}

export function queryTourTarget(
	stepId: string,
	root: ParentNode = document,
): HTMLElement | null {
	return root.querySelector<HTMLElement>(tourTargetSelector(stepId));
}

export function waitForTourTarget(
	stepId: string,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	return waitForElement(tourTargetSelector(stepId), options);
}
