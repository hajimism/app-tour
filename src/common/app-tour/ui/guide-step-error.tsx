import { createPortal } from "react-dom";
import { Button } from "@/common/ui/button";
import { Z_INDEX } from "../core/constants";
import type { StepGuideError } from "../headless/step-guide-state";
export interface GuideStepErrorProps {
	error: StepGuideError;
	onRetry: () => void;
	onStopTour: () => void;
	onDismiss: () => void;
}

const PHASE_LABELS = {
	wait: "Target wait",
	prepare: "Prepare",
	autoFill: "Auto-fill",
	select: "Select",
	click: "Click",
	onStepComplete: "Step complete",
	engine: "Engine",
} as const;

export function GuideStepError({
	error,
	onRetry,
	onStopTour,
	onDismiss,
}: GuideStepErrorProps) {
	if (typeof document === "undefined") return null;

	return createPortal(
		<div
			role="alert"
			className="app-tour-step-error fixed right-4 bottom-4 left-4 mx-auto flex max-w-md flex-col gap-3 rounded-lg border p-4 shadow-lg sm:left-auto sm:w-full"
			style={{ zIndex: Z_INDEX.tooltip + 1 }}
		>
			<div>
				<p className="app-tour-step-error-title font-medium text-sm">
					Tour step failed
				</p>
				<p className="app-tour-step-error-meta mt-1 text-xs">
					<span className="font-mono">{error.stepId}</span>
					{" · "}
					{PHASE_LABELS[error.phase]}
				</p>
				<p className="app-tour-step-error-message mt-2 text-sm">
					{error.message}
				</p>
			</div>
			<div className="flex flex-wrap justify-end gap-2">
				<Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
					Dismiss
				</Button>
				<Button type="button" variant="outline" size="sm" onClick={onRetry}>
					Retry
				</Button>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					onClick={onStopTour}
				>
					End tour
				</Button>
			</div>
		</div>,
		document.body,
	);
}
