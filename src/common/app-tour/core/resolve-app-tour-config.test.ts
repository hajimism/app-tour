import { describe, expect, it } from "vitest";
import { ELEMENT_WAIT_TIMEOUT_MS, HIGHLIGHT_TRANSITION_MS } from "./constants";
import { resolveAppTourConfig } from "./resolve-app-tour-config";

describe("resolveAppTourConfig", () => {
	it("fills defaults when config is omitted", () => {
		const resolved = resolveAppTourConfig();

		expect(resolved.elementWaitTimeoutMs).toBe(ELEMENT_WAIT_TIMEOUT_MS);
		expect(resolved.highlightTransitionMs).toBe(HIGHLIGHT_TRANSITION_MS);
		expect(resolved.defaultScrollIntoView).toBe(true);
		expect(resolved.allowOverlayClose).toBe(false);
		expect(resolved.showStepErrors).toBe(true);
	});

	it("preserves explicit overrides", () => {
		const resolved = resolveAppTourConfig({
			elementWaitTimeoutMs: 1234,
			showProgress: true,
			blockOverlayInteraction: true,
		});

		expect(resolved.elementWaitTimeoutMs).toBe(1234);
		expect(resolved.showProgress).toBe(true);
		expect(resolved.blockOverlayInteraction).toBe(true);
	});
});
