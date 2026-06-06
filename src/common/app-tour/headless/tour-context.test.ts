import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TourStep } from "../core/types/config";
import { TourEngineBridge, TourProvider, useTour } from "./tour-context";

const steps: TourStep[] = [
	{
		id: "intro",
		operation: { highlight: "[data-test='intro']", tooltip: { title: "Hi" } },
	},
];

const reset = vi.fn(async () => {});
const goToStep = vi.fn(async () => {});
let isCompleted = false;

vi.mock("@onboardjs/react", () => ({
	useOnboarding: () => ({
		reset,
		goToStep,
		isCompleted,
	}),
}));

function StartButton() {
	const { startTour } = useTour();
	return createElement(
		"button",
		{ type: "button", onClick: () => void startTour() },
		"Start",
	);
}

function StopButton() {
	const { stopTour } = useTour();
	return createElement(
		"button",
		{ type: "button", onClick: () => void stopTour() },
		"Stop",
	);
}

describe("TourEngineBridge", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
		reset.mockClear();
		goToStep.mockClear();
		isCompleted = false;
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	it("starts the first step when startTour is called", async () => {
		await act(async () => {
			root.render(
				createElement(
					TourProvider,
					{ tours: { default: steps }, defaultTour: "default" },
					createElement(StartButton),
					createElement(TourEngineBridge),
				),
			);
		});

		const button = container.querySelector("button");
		expect(button).not.toBeNull();

		await act(async () => {
			button?.click();
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(reset).toHaveBeenCalledTimes(1);
		expect(goToStep).toHaveBeenCalledWith("intro");
	});

	it("binds engine reset to stopTour", async () => {
		await act(async () => {
			root.render(
				createElement(
					TourProvider,
					{ tours: { default: steps }, defaultTour: "default" },
					createElement(StopButton),
					createElement(TourEngineBridge),
				),
			);
		});

		await act(async () => {
			await Promise.resolve();
		});

		const stopButton = container.querySelector("button");
		await act(async () => {
			stopButton?.click();
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(reset).toHaveBeenCalledTimes(1);
	});

	it("reports start failures via onStartFailed", async () => {
		const onStartFailed = vi.fn();
		goToStep.mockRejectedValueOnce(new Error("goToStep failed"));

		await act(async () => {
			root.render(
				createElement(
					TourProvider,
					{ tours: { default: steps }, defaultTour: "default" },
					createElement(StartButton),
					createElement(TourEngineBridge, { onStartFailed }),
				),
			);
		});

		const button = container.querySelector("button");
		await act(async () => {
			button?.click();
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(onStartFailed).toHaveBeenCalledWith(
			"intro",
			expect.objectContaining({ message: "goToStep failed" }),
		);
	});
});
