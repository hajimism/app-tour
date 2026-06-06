import { describe, expect, it } from "vitest";
import {
	isEditableFocusTarget,
	resolveTourArrowAction,
} from "./use-tour-keyboard";

describe("resolveTourArrowAction", () => {
	it("navigates from tooltip focus", () => {
		const tooltip = document.createElement("div");
		const button = document.createElement("button");
		tooltip.append(button);
		document.body.append(tooltip);
		button.focus();

		expect(resolveTourArrowAction("ArrowRight", button, tooltip)).toBe("next");
		expect(resolveTourArrowAction("ArrowLeft", button, tooltip)).toBe(
			"previous",
		);
	});

	it("navigates when focus moved to a portal button after autoFill", () => {
		const tooltip = document.createElement("div");
		const close = document.createElement("button");
		close.textContent = "Close";
		document.body.append(tooltip, close);
		close.focus();

		expect(resolveTourArrowAction("ArrowRight", close, tooltip)).toBe("next");
	});

	it("ignores arrows while typing in highlighted field", () => {
		const tooltip = document.createElement("div");
		const textarea = document.createElement("textarea");
		document.body.append(tooltip, textarea);
		textarea.focus();

		expect(resolveTourArrowAction("ArrowRight", textarea, tooltip)).toBeNull();
		expect(isEditableFocusTarget(textarea)).toBe(true);
	});
});
