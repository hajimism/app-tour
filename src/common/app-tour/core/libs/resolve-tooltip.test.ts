import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
	hasTooltipContent,
	resolveShowProgress,
	resolveTooltipButtons,
	resolveTooltipDescription,
	resolveTooltipTitle,
} from "./resolve-tooltip";

describe("resolveTooltipTitle", () => {
	it("returns title when set", () => {
		expect(resolveTooltipTitle({ title: "Hello" })).toBe("Hello");
	});

	it("falls back to default title", () => {
		expect(resolveTooltipTitle({})).toBe("Guide");
	});
});

describe("resolveTooltipDescription", () => {
	it("prefers description over text", () => {
		expect(resolveTooltipDescription({ description: "A", text: "B" })).toBe(
			"A",
		);
	});

	it("uses text shorthand", () => {
		expect(resolveTooltipDescription({ text: "B" })).toBe("B");
	});

	it("returns undefined for empty nodes", () => {
		expect(resolveTooltipDescription({})).toBeUndefined();
	});
});

describe("hasTooltipContent", () => {
	it("accepts ReactNode title", () => {
		expect(
			hasTooltipContent({
				title: createElement("strong", null, "Hello"),
			}),
		).toBe(true);
	});
});

describe("resolveShowProgress", () => {
	it("prefers tooltip override over config", () => {
		expect(
			resolveShowProgress({ showProgress: false }, { showProgress: true }),
		).toBe(false);
	});

	it("falls back to config then false", () => {
		expect(resolveShowProgress({}, { showProgress: true })).toBe(true);
		expect(resolveShowProgress({}, {})).toBe(false);
	});
});

describe("resolveTooltipButtons", () => {
	it("uses first/last step labels and skip", () => {
		expect(
			resolveTooltipButtons({}, { isFirstStep: true, isLastStep: false }),
		).toEqual({ next: "Start!", previous: "Back", skip: "Skip" });

		expect(
			resolveTooltipButtons({}, { isFirstStep: false, isLastStep: true }),
		).toEqual({ next: "Done!", previous: "Back", skip: "Skip" });
	});

	it("merges custom button labels", () => {
		expect(
			resolveTooltipButtons(
				{ buttons: { next: "続ける", previous: "戻る", skip: "飛ばす" } },
				{ isFirstStep: false, isLastStep: false },
			),
		).toEqual({ next: "続ける", previous: "戻る", skip: "飛ばす" });
	});
});
