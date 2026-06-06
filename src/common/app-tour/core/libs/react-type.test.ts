import { describe, expect, it, vi } from "vitest";
import { reactType } from "./react-type";

describe("reactType", () => {
	it("sets value via native setter and dispatches input event", () => {
		const input = document.createElement("input");
		const onInput = vi.fn();
		input.addEventListener("input", onInput);

		reactType(input, "hello");

		expect(input.value).toBe("hello");
		expect(onInput).toHaveBeenCalledOnce();
	});

	it("updates textarea incrementally", () => {
		const textarea = document.createElement("textarea");

		reactType(textarea, "a");
		reactType(textarea, "ab");

		expect(textarea.value).toBe("ab");
	});
});
