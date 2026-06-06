import { describe, expect, it } from "vitest";
import {
	FIRST_TOOLTIP_REVEAL_MS,
	HIGHLIGHT_TRANSITION_MS,
} from "../core/constants";
import { resolvePopoverRevealDelay } from "./use-popover-reveal";

describe("resolvePopoverRevealDelay", () => {
	it("uses first reveal delay on overlay entrance", () => {
		expect(resolvePopoverRevealDelay(true, true, HIGHLIGHT_TRANSITION_MS)).toBe(
			FIRST_TOOLTIP_REVEAL_MS,
		);
	});

	it("uses transition delay after first reveal", () => {
		expect(
			resolvePopoverRevealDelay(false, true, HIGHLIGHT_TRANSITION_MS),
		).toBe(HIGHLIGHT_TRANSITION_MS);
	});

	it("uses first reveal delay before any reveal", () => {
		expect(
			resolvePopoverRevealDelay(false, false, HIGHLIGHT_TRANSITION_MS),
		).toBe(FIRST_TOOLTIP_REVEAL_MS);
	});
});
