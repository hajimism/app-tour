import { describe, expect, it } from "vitest";
import { resolveOverlayClick } from "./resolve-overlay-click";

describe("resolveOverlayClick", () => {
	it("defaults to overlay click disabled for recording-safe demos", () => {
		expect(resolveOverlayClick({})).toEqual({
			allowClose: false,
			behavior: "close",
		});
	});

	it("prefers step override over config", () => {
		expect(
			resolveOverlayClick({
				config: {
					allowOverlayClose: true,
					overlayClickBehavior: "close",
				},
				operation: {
					allowOverlayClose: false,
					overlayClickBehavior: "nextStep",
				},
			}),
		).toEqual({
			allowClose: false,
			behavior: "nextStep",
		});
	});
});
