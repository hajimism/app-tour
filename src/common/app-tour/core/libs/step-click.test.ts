import { describe, expect, it, vi } from "vitest";
import { stepClick } from "./step-click";

describe("stepClick", () => {
	it("clicks target and toggles pointer callbacks", async () => {
		const button = document.createElement("button");
		const clicked = vi.fn();
		button.addEventListener("click", clicked);
		document.body.append(button);

		const onPointerShow = vi.fn();
		const onPointerHide = vi.fn();

		await stepClick(
			button,
			{ when: "active", pointer: true, pointerDelayMs: 0 },
			new AbortController().signal,
			{ onPointerShow, onPointerHide },
		);

		expect(onPointerShow).toHaveBeenCalledOnce();
		expect(clicked).toHaveBeenCalledOnce();
		expect(onPointerHide).toHaveBeenCalledOnce();
	});
});
