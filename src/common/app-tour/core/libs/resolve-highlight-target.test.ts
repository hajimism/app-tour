import { afterEach, describe, expect, it } from "vitest";
import { APP_TOUR_TARGET_ATTR } from "../constants";
import {
	resolveHighlightTarget,
	waitForHighlightTarget,
} from "./resolve-highlight-target";

describe("resolveHighlightTarget", () => {
	it("falls back to data-app-tour selector", () => {
		expect(resolveHighlightTarget(undefined, "hero")).toBe(
			`[${APP_TOUR_TARGET_ATTR}="hero"]`,
		);
	});

	it("returns explicit selector", () => {
		expect(resolveHighlightTarget("#nav", "hero")).toBe("#nav");
	});

	it("maps bare id to data-app-tour selector", () => {
		expect(resolveHighlightTarget("open-dialog", "dialog-field")).toBe(
			`[${APP_TOUR_TARGET_ATTR}="open-dialog"]`,
		);
	});
});

describe("waitForHighlightTarget", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("resolves CSS selector", async () => {
		const el = document.createElement("nav");
		el.id = "nav";
		document.body.append(el);

		await expect(waitForHighlightTarget("#nav", "unused")).resolves.toBe(el);
	});

	it("resolves data-app-tour fallback", async () => {
		const el = document.createElement("div");
		el.setAttribute(APP_TOUR_TARGET_ATTR, "hero");
		document.body.append(el);

		await expect(waitForHighlightTarget(undefined, "hero")).resolves.toBe(el);
	});

	it("resolves prepare click by tour id", async () => {
		const el = document.createElement("button");
		el.setAttribute(APP_TOUR_TARGET_ATTR, "open-dialog");
		document.body.append(el);

		await expect(
			waitForHighlightTarget("open-dialog", "dialog-field"),
		).resolves.toBe(el);
	});

	it("resolves function target", async () => {
		const el = document.createElement("button");
		el.id = "action";
		document.body.append(el);

		await expect(
			waitForHighlightTarget(() => document.getElementById("action"), "unused"),
		).resolves.toBe(el);
	});

	it("resolves HTMLElement directly", async () => {
		const el = document.createElement("span");
		document.body.append(el);

		await expect(waitForHighlightTarget(el, "unused")).resolves.toBe(el);
	});
});
