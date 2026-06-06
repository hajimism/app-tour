import { afterEach, describe, expect, it } from "vitest";
import { APP_TOUR_TARGET_ATTR } from "../constants";
import {
	findSelectOption,
	openShadcnPortalTarget,
	queryOpenShadcnPortal,
	shadcnPortalSelector,
	shadcnSelectOptionTarget,
	tourTargetInShadcnPortal,
} from "./portal-target";

describe("shadcnPortalSelector", () => {
	it("returns data-slot selector", () => {
		expect(shadcnPortalSelector("dialogContent")).toBe(
			'[data-slot="dialog-content"]',
		);
	});
});

describe("queryOpenShadcnPortal", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("returns the topmost matching portal", () => {
		const first = document.createElement("div");
		first.dataset.slot = "dialog-content";
		const second = document.createElement("div");
		second.dataset.slot = "dialog-content";
		document.body.append(first, second);

		expect(queryOpenShadcnPortal("dialogContent")).toBe(second);
	});
});

describe("tourTargetInShadcnPortal", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("finds data-app-tour inside open dialog", () => {
		const dialog = document.createElement("div");
		dialog.dataset.slot = "dialog-content";
		const field = document.createElement("input");
		field.setAttribute(APP_TOUR_TARGET_ATTR, "dialog-field");
		dialog.append(field);
		document.body.append(dialog);

		expect(tourTargetInShadcnPortal("dialog-field", "dialogContent")()).toBe(
			field,
		);
	});
});

describe("shadcnSelectOptionTarget", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("finds option by data-value", () => {
		const content = document.createElement("div");
		content.dataset.slot = "select-content";
		const option = document.createElement("div");
		option.dataset.slot = "select-item";
		option.dataset.value = "pro";
		content.append(option);
		document.body.append(content);

		expect(shadcnSelectOptionTarget("pro")()).toBe(option);
		expect(findSelectOption("pro")).toBe(option);
	});

	it("falls back to label match when data-value is missing", () => {
		const content = document.createElement("div");
		content.dataset.slot = "select-content";
		const option = document.createElement("div");
		option.dataset.slot = "select-item";
		option.setAttribute("role", "option");
		const text = document.createElement("span");
		text.dataset.slot = "select-item-text";
		text.textContent = "Pro";
		option.append(text);
		content.append(option);
		document.body.append(content);

		expect(findSelectOption("pro", "value")).toBe(option);
		expect(findSelectOption("Pro", "label")).toBe(option);
	});
});

describe("openShadcnPortalTarget", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("resolves lazily", () => {
		expect(openShadcnPortalTarget("sheetContent")()).toBeNull();

		const sheet = document.createElement("aside");
		sheet.dataset.slot = "sheet-content";
		document.body.append(sheet);

		expect(openShadcnPortalTarget("sheetContent")()).toBe(sheet);
	});
});
