import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitUntil } from "./wait-until";

describe("waitUntil", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("resolves immediately when check succeeds", async () => {
		const promise = waitUntil(() => document.createElement("div"));
		await expect(promise).resolves.toBeInstanceOf(HTMLElement);
	});

	it("polls until check succeeds", async () => {
		let ready = false;
		const promise = waitUntil(() => (ready ? document.body : null), {
			timeoutMs: 1000,
			pollMs: 100,
		});

		ready = true;
		await vi.advanceTimersByTimeAsync(100);
		await expect(promise).resolves.toBe(document.body);
	});

	it("rejects on timeout", async () => {
		const promise = waitUntil(() => null, {
			timeoutMs: 500,
			pollMs: 100,
			onTimeout: (ms) => new Error(`timed out after ${ms}`),
		});

		const expectation = expect(promise).rejects.toThrow("timed out after 500");
		await vi.advanceTimersByTimeAsync(500);
		await expectation;
	});

	it("rejects when aborted", async () => {
		const controller = new AbortController();
		const promise = waitUntil(() => null, {
			signal: controller.signal,
			timeoutMs: 5000,
		});

		controller.abort();
		await expect(promise).rejects.toMatchObject({ name: "AbortError" });
	});
});
