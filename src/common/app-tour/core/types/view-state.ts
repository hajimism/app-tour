import type { PointerOffset } from "./step-operation";

export interface PointerTarget {
	el: HTMLElement;
	offset?: PointerOffset;
}
