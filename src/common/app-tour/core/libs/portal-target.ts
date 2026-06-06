import { tourTargetSelector } from "./tour-target";
import type { WaitForElementOptions } from "./wait-for-element";
import { waitUntil } from "./wait-until";

/** shadcn / Base UI `data-slot` selectors for portaled content. */
export const SHADCN_PORTAL_SLOTS = {
	dialogContent: "dialog-content",
	sheetContent: "sheet-content",
	alertDialogContent: "alert-dialog-content",
	drawerContent: "drawer-content",
	selectContent: "select-content",
	popoverContent: "popover-content",
} as const;

export type ShadcnPortalSlot = keyof typeof SHADCN_PORTAL_SLOTS;

export function shadcnPortalSelector(slot: ShadcnPortalSlot): string {
	return `[data-slot="${SHADCN_PORTAL_SLOTS[slot]}"]`;
}

export function queryOpenShadcnPortal(
	slot: ShadcnPortalSlot,
	root: ParentNode = document,
): HTMLElement | null {
	const nodes = root.querySelectorAll<HTMLElement>(shadcnPortalSelector(slot));
	return nodes.item(nodes.length - 1);
}

export function openShadcnPortalTarget(
	slot: ShadcnPortalSlot,
): () => HTMLElement | null {
	return () => queryOpenShadcnPortal(slot);
}

export function tourTargetInShadcnPortal(
	stepId: string,
	slot: ShadcnPortalSlot,
): () => HTMLElement | null {
	return () =>
		queryOpenShadcnPortal(slot)?.querySelector<HTMLElement>(
			tourTargetSelector(stepId),
		) ?? null;
}

export function waitForOpenShadcnPortal(
	slot: ShadcnPortalSlot,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	return waitForHighlightPortal(slot, options);
}

export async function waitForHighlightPortal(
	slot: ShadcnPortalSlot,
	options?: WaitForElementOptions,
): Promise<HTMLElement> {
	const selector = shadcnPortalSelector(slot);

	return waitUntil(
		() => {
			const el = queryOpenShadcnPortal(slot);
			return el?.isConnected ? el : null;
		},
		{
			timeoutMs: options?.timeoutMs,
			signal: options?.signal,
			observe: document.body,
			onTimeout: (timeoutMs) =>
				new Error(
					`Portal "${slot}" not found within ${timeoutMs}ms (${selector})`,
				),
		},
	);
}

export function shadcnSelectOptionTarget(
	valueOrLabel: string,
	match: "value" | "label" = "value",
): () => HTMLElement | null {
	return () => findSelectOption(valueOrLabel, match);
}

export function findSelectOption(
	valueOrLabel: string,
	match: "value" | "label" = "value",
	root: ParentNode = document,
): HTMLElement | null {
	const content = queryOpenShadcnPortal("selectContent", root);
	if (!content) return null;

	if (match === "value") {
		const byValue = querySelectOptionByValue(content, valueOrLabel);
		if (byValue) return byValue;

		// Base UI items may omit data-value — match visible label case-insensitively.
		return findSelectOptionByLabel(content, valueOrLabel, true);
	}

	return findSelectOptionByLabel(content, valueOrLabel, false);
}

function querySelectOptionByValue(
	content: ParentNode,
	value: string,
): HTMLElement | null {
	const escaped = CSS.escape(value);
	return (
		content.querySelector<HTMLElement>(
			`[data-slot="select-item"][data-value="${escaped}"]`,
		) ??
		content.querySelector<HTMLElement>(`[data-value="${escaped}"]`) ??
		content.querySelector<HTMLElement>(
			`[role="option"][data-value="${escaped}"]`,
		)
	);
}

function getSelectItemLabel(item: HTMLElement): string {
	const textEl = item.querySelector<HTMLElement>(
		'[data-slot="select-item-text"]',
	);
	return (textEl?.textContent ?? item.textContent ?? "").trim();
}

function findSelectOptionByLabel(
	content: ParentNode,
	label: string,
	caseInsensitive: boolean,
): HTMLElement | null {
	const items = content.querySelectorAll<HTMLElement>(
		'[data-slot="select-item"], [role="option"]',
	);

	for (const item of Array.from(items)) {
		const text = getSelectItemLabel(item);
		if (caseInsensitive) {
			if (text.toLowerCase() === label.toLowerCase()) return item;
		} else if (text === label) {
			return item;
		}
	}

	return null;
}
