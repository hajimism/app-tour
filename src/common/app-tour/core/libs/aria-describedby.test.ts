import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { attachDescribedBy, detachDescribedBy } from "./aria-describedby";

describe("aria-describedby", () => {
	let el: HTMLButtonElement;

	afterEach(() => {
		document.body.innerHTML = "";
	});

	beforeEach(() => {
		el = document.createElement("button");
		document.body.append(el);
	});

	it("attaches and restores original describedby", () => {
		el.setAttribute("aria-describedby", "existing");

		attachDescribedBy(el, "tooltip-id");
		expect(el.getAttribute("aria-describedby")).toBe("existing tooltip-id");

		detachDescribedBy(el, "tooltip-id");
		expect(el.getAttribute("aria-describedby")).toBe("existing");
	});

	it("removes describedby when none existed originally", () => {
		attachDescribedBy(el, "tooltip-id");
		expect(el.getAttribute("aria-describedby")).toBe("tooltip-id");

		detachDescribedBy(el, "tooltip-id");
		expect(el.hasAttribute("aria-describedby")).toBe(false);
	});
});
