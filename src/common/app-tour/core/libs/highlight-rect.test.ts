import { afterEach, describe, expect, it, vi } from "vitest";
import { getConnectedElementRect } from "./highlight-rect";

function mockRect(
	el: Element,
	box: { top: number; left: number; width: number; height: number },
) {
	vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
		x: box.left,
		y: box.top,
		width: box.width,
		height: box.height,
		top: box.top,
		left: box.left,
		right: box.left + box.width,
		bottom: box.top + box.height,
		toJSON: () => ({}),
	});
}

describe("getConnectedElementRect", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	it("returns null when the element is disconnected", () => {
		const el = document.createElement("button");
		mockRect(el, { top: 10, left: 20, width: 100, height: 40 });
		document.body.append(el);
		expect(getConnectedElementRect(el)?.width).toBe(100);

		el.remove();
		expect(getConnectedElementRect(el)).toBeNull();
	});

	it("returns null for zero-size boxes", () => {
		const el = document.createElement("span");
		mockRect(el, { top: 0, left: 0, width: 0, height: 0 });
		document.body.append(el);
		expect(getConnectedElementRect(el)).toBeNull();
	});
});
