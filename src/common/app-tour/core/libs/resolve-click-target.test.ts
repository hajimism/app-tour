import { describe, expect, it, vi } from "vitest";
import { resolveClickTarget, waitForClickTarget } from "./resolve-click-target";

describe("resolveClickTarget", () => {
	it("returns highlight element when target is undefined", () => {
		const highlight = document.createElement("button");
		expect(resolveClickTarget(highlight, undefined, "step-1")).toBe(highlight);
	});

	it("throws when selector target is missing", () => {
		const highlight = document.createElement("button");
		expect(() => resolveClickTarget(highlight, "#missing", "step-1")).toThrow(
			"Click target not found",
		);
	});
});

describe("waitForClickTarget", () => {
	it("waits for selector target to appear", async () => {
		vi.useFakeTimers();
		const highlight = document.createElement("div");
		document.body.append(highlight);

		const target = document.createElement("button");
		target.id = "click-me";

		const promise = waitForClickTarget(highlight, "#click-me", "step-1", {
			timeoutMs: 1000,
		});

		document.body.append(target);
		await vi.advanceTimersByTimeAsync(100);

		await expect(promise).resolves.toBe(target);

		target.remove();
		highlight.remove();
		vi.useRealTimers();
	});
});
