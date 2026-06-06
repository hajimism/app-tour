import { describe, expect, it } from "vitest";
import {
	AppTourStepError,
	formatStepErrorMessage,
	readStepErrorPhase,
} from "./report-step-error";

describe("formatStepErrorMessage", () => {
	it("returns Error.message", () => {
		expect(formatStepErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("stringifies non-Error values", () => {
		expect(formatStepErrorMessage("plain")).toBe("plain");
	});
});

describe("AppTourStepError", () => {
	it("stores phase for readStepErrorPhase", () => {
		const error = new AppTourStepError("prepare", "Dialog trigger missing");
		expect(readStepErrorPhase(error)).toBe("prepare");
		expect(error.message).toBe("Dialog trigger missing");
	});
});
