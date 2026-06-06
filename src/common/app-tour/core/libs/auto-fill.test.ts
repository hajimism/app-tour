import { afterEach, describe, expect, it, vi } from "vitest";
import { autoFill } from "./auto-fill";

describe("autoFill", () => {
	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = "";
	});

	it("types character by character", async () => {
		vi.useFakeTimers();
		const input = document.createElement("input");
		document.body.append(input);

		const promise = autoFill(input, {
			text: "ab",
			delayMs: 10,
			focusFirst: false,
		});

		await vi.runAllTimersAsync();
		await promise;

		expect(input.value).toBe("ab");
	});

	it("uses default delay from options", async () => {
		vi.useFakeTimers();
		const input = document.createElement("input");
		document.body.append(input);

		const promise = autoFill(
			input,
			{ text: "x", focusFirst: false },
			{ defaultDelayMs: 0 },
		);

		await vi.runAllTimersAsync();
		await promise;

		expect(input.value).toBe("x");
	});

	it("aborts when signal is aborted", async () => {
		vi.useFakeTimers();
		const input = document.createElement("input");
		document.body.append(input);
		const controller = new AbortController();

		const promise = autoFill(
			input,
			{ text: "hello", delayMs: 50, focusFirst: false },
			{ signal: controller.signal },
		);

		await vi.advanceTimersByTimeAsync(60);
		controller.abort();

		await expect(promise).rejects.toMatchObject({ name: "AbortError" });
		expect(input.value).not.toBe("hello");
	});
});
