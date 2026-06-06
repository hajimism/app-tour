import { afterEach, describe, expect, it } from "vitest";
import { APP_TOUR_TARGET_ATTR } from "../constants";
import {
	isCssSelector,
	queryTourTarget,
	resolveStringHighlightTarget,
	tourTargetSelector,
	waitForTourTarget,
} from "./tour-target";

describe("tourTargetSelector", () => {
	it("builds a data attribute selector", () => {
		expect(tourTargetSelector("hero")).toBe(`[${APP_TOUR_TARGET_ATTR}="hero"]`);
	});
});

describe("isCssSelector", () => {
	it("detects CSS selectors", () => {
		expect(isCssSelector("#open-dialog")).toBe(true);
		expect(isCssSelector('[data-slot="dialog-trigger"]')).toBe(true);
		expect(isCssSelector("button.primary")).toBe(true);
	});

	it("treats bare tour ids as non-CSS", () => {
		expect(isCssSelector("open-dialog")).toBe(false);
		expect(isCssSelector("hero")).toBe(false);
	});
});

describe("resolveStringHighlightTarget", () => {
	it("maps tour ids to data-app-tour selectors", () => {
		expect(resolveStringHighlightTarget("open-dialog")).toBe(
			`[${APP_TOUR_TARGET_ATTR}="open-dialog"]`,
		);
	});

	it("passes through CSS selectors", () => {
		expect(resolveStringHighlightTarget("#open-dialog")).toBe("#open-dialog");
	});
});

describe("queryTourTarget", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("finds an element by step id", () => {
		const el = document.createElement("div");
		el.setAttribute(APP_TOUR_TARGET_ATTR, "search");
		document.body.append(el);

		expect(queryTourTarget("search")).toBe(el);
		expect(queryTourTarget("missing")).toBeNull();
	});
});

describe("waitForTourTarget", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("resolves immediately when element exists", async () => {
		const el = document.createElement("input");
		el.setAttribute(APP_TOUR_TARGET_ATTR, "search");
		document.body.append(el);

		await expect(waitForTourTarget("search")).resolves.toBe(el);
	});

	it("waits for element to appear", async () => {
		const promise = waitForTourTarget("counter", { timeoutMs: 1000 });

		const el = document.createElement("button");
		el.setAttribute(APP_TOUR_TARGET_ATTR, "counter");
		document.body.append(el);

		await expect(promise).resolves.toBe(el);
	});

	it("rejects when aborted", async () => {
		const controller = new AbortController();
		const promise = waitForTourTarget("missing", {
			signal: controller.signal,
			timeoutMs: 5000,
		});

		controller.abort();

		await expect(promise).rejects.toMatchObject({ name: "AbortError" });
	});
});
