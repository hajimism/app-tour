export type OverlayClickBehavior = "close" | "nextStep";

export interface OverlayClickContext {
	stepId: string;
	anchorEl: HTMLElement | null;
	isFirstStep: boolean;
	isLastStep: boolean;
}

export type OverlayClickHandler = (ctx: OverlayClickContext) => void;

export type ResolvedOverlayClickBehavior =
	| OverlayClickBehavior
	| OverlayClickHandler;
