import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTourEscape } from "./use-tour-escape";

function EscapeProbe({
	enabled,
	onEscape,
}: {
	enabled: boolean;
	onEscape: () => void;
}) {
	useTourEscape({ enabled, onEscape });
	return null;
}

describe("useTourEscape", () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement("div");
		document.body.append(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => {
			root.unmount();
		});
		container.remove();
	});

	it("calls onEscape when Escape is pressed while enabled", async () => {
		const onEscape = vi.fn();

		await act(async () => {
			root.render(createElement(EscapeProbe, { enabled: true, onEscape }));
		});

		await act(async () => {
			window.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});

		expect(onEscape).toHaveBeenCalledTimes(1);
	});

	it("does not call onEscape when disabled", async () => {
		const onEscape = vi.fn();

		await act(async () => {
			root.render(createElement(EscapeProbe, { enabled: false, onEscape }));
		});

		await act(async () => {
			window.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});

		expect(onEscape).not.toHaveBeenCalled();
	});
});
