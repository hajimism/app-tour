import { afterEach, describe, expect, it, vi } from "vitest";
import { readStableElementRect } from "./use-element-rect";

describe("readStableElementRect", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns the same reference when rect values are unchanged", () => {
		const el = document.createElement("div");
		document.body.append(el);

		vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
			top: 10,
			left: 20,
			width: 100,
			height: 40,
			right: 120,
			bottom: 50,
			x: 20,
			y: 10,
			toJSON: () => ({}),
		});

		const first = readStableElementRect(el);
		const second = readStableElementRect(el);

		expect(first).not.toBeNull();
		expect(second).toBe(first);

		el.remove();
	});

	it("returns a new reference when rect values change", () => {
		const el = document.createElement("div");
		document.body.append(el);

		const rect = vi.spyOn(el, "getBoundingClientRect");
		rect.mockReturnValue({
			top: 10,
			left: 20,
			width: 100,
			height: 40,
			right: 120,
			bottom: 50,
			x: 20,
			y: 10,
			toJSON: () => ({}),
		});

		const first = readStableElementRect(el);

		rect.mockReturnValue({
			top: 30,
			left: 20,
			width: 100,
			height: 40,
			right: 120,
			bottom: 70,
			x: 20,
			y: 30,
			toJSON: () => ({}),
		});

		const second = readStableElementRect(el);

		expect(first).not.toBeNull();
		expect(second).not.toBeNull();
		expect(second).not.toBe(first);
		expect(second?.top).toBe(30);

		el.remove();
	});
});
