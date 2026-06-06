import { afterEach, describe, expect, it, vi } from "vitest";
import { runStepSequence } from "./run-step-sequence";
import {
	validateAutoFillTarget,
	warnConflictingStepEffects,
} from "./validate-step-operation";

describe("validateAutoFillTarget", () => {
	it("accepts input and textarea elements", () => {
		expect(
			validateAutoFillTarget(document.createElement("input"), "s"),
		).toBeNull();
		expect(
			validateAutoFillTarget(document.createElement("textarea"), "s"),
		).toBeNull();
	});

	it("rejects non-input elements", () => {
		const error = validateAutoFillTarget(document.createElement("div"), "bad");
		expect(error).toBeInstanceOf(Error);
		expect(error?.message).toContain("bad");
	});
});

describe("warnConflictingStepEffects", () => {
	it("warns when multiple effects are configured", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

		warnConflictingStepEffects(
			{
				autoFill: { text: "x" },
				select: { value: "a" },
				pointer: {},
			},
			"conflict",
		);

		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('Step "conflict"'),
		);
		expect(warn.mock.calls[0]?.[0]).toContain("autoFill");
		warn.mockRestore();
	});

	it("does not warn for a single effect", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

		warnConflictingStepEffects({ pointer: {} }, "ok");

		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe("runStepSequence", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.useRealTimers();
	});

	it("fails before TARGET_READY when autoFill target is not an input", async () => {
		const target = document.createElement("div");
		target.setAttribute("data-app-tour", "bad");
		document.body.append(target);

		const onTargetReady = vi.fn();
		const onStepFailed = vi.fn();

		const result = await runStepSequence(
			{
				stepId: "bad",
				operation: { autoFill: { text: "x", delayMs: 0 } },
				scrollIntoView: false,
				hasActivatedStepBefore: false,
			},
			new AbortController().signal,
			{
				onTargetReady,
				onStepFailed,
				onOverlayPaused: vi.fn(),
				onPointerShow: vi.fn(),
				onPointerHide: vi.fn(),
			},
		);

		expect(result).toMatchObject({
			status: "failed",
			stepId: "bad",
			phase: "autoFill",
		});
		expect(onTargetReady).not.toHaveBeenCalled();
		expect(onStepFailed).toHaveBeenCalledWith(
			"bad",
			"autoFill",
			expect.any(Error),
		);
	});

	it("returns ready after autoFill on a valid input", async () => {
		vi.useFakeTimers();
		const input = document.createElement("input");
		input.setAttribute("data-app-tour", "search");
		document.body.append(input);

		const onTargetReady = vi.fn();
		const onStepFailed = vi.fn();

		const promise = runStepSequence(
			{
				stepId: "search",
				operation: { autoFill: { text: "hi", delayMs: 0 } },
				scrollIntoView: false,
				hasActivatedStepBefore: false,
			},
			new AbortController().signal,
			{
				onTargetReady,
				onStepFailed,
				onOverlayPaused: vi.fn(),
				onPointerShow: vi.fn(),
				onPointerHide: vi.fn(),
			},
		);

		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result).toEqual({
			status: "ready",
			stepId: "search",
			activatedStep: true,
		});
		expect(onTargetReady).toHaveBeenCalledOnce();
		expect(onStepFailed).not.toHaveBeenCalled();
		expect(input.value).toBe("hi");
	});

	it("returns failed when select effect cannot find a portal", async () => {
		vi.useFakeTimers();
		const trigger = document.createElement("button");
		trigger.setAttribute("data-app-tour", "plan");
		document.body.append(trigger);

		const onTargetReady = vi.fn();
		const onStepFailed = vi.fn();

		const promise = runStepSequence(
			{
				stepId: "plan",
				operation: { select: { value: "pro" } },
				scrollIntoView: false,
				hasActivatedStepBefore: true,
				config: { elementWaitTimeoutMs: 50 },
			},
			new AbortController().signal,
			{
				onTargetReady,
				onStepFailed,
				onOverlayPaused: vi.fn(),
				onPointerShow: vi.fn(),
				onPointerHide: vi.fn(),
			},
		);

		await vi.runAllTimersAsync();
		const result = await promise;

		expect(result.status).toBe("failed");
		if (result.status === "failed") {
			expect(result.phase).toBe("select");
		}
		expect(onTargetReady).toHaveBeenCalledOnce();
		expect(onStepFailed).toHaveBeenCalledWith(
			"plan",
			"select",
			expect.any(Error),
		);
	});
});
