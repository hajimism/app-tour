import { afterEach, describe, expect, it, vi } from "vitest";
import { runPrepare } from "./run-prepare";

describe("runPrepare", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.useRealTimers();
	});

	it("clicks prepare target before settling", async () => {
		vi.useFakeTimers();
		const trigger = document.createElement("button");
		trigger.id = "open-dialog";
		const clicked = vi.fn();
		trigger.addEventListener("click", clicked);
		document.body.append(trigger);

		const promise = runPrepare(
			{ click: "#open-dialog", settleMs: 100 },
			"dialog-field",
			new AbortController().signal,
		);

		await vi.runAllTimersAsync();
		await promise;

		expect(clicked).toHaveBeenCalledOnce();
	});

	it("clicks prepare target by data-app-tour id", async () => {
		vi.useFakeTimers();
		const trigger = document.createElement("button");
		trigger.setAttribute("data-app-tour", "open-dialog");
		const clicked = vi.fn();
		trigger.addEventListener("click", clicked);
		document.body.append(trigger);

		const promise = runPrepare(
			{ click: "open-dialog", settleMs: 100 },
			"dialog-field",
			new AbortController().signal,
		);

		await vi.runAllTimersAsync();
		await promise;

		expect(clicked).toHaveBeenCalledOnce();
	});
});
