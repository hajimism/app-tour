import type { AppTourConfig, StepErrorPhase } from "./types/config";

export class AppTourStepError extends Error {
	readonly phase: StepErrorPhase;

	constructor(
		phase: StepErrorPhase,
		message: string,
		options?: { cause?: unknown },
	) {
		super(message, { cause: options?.cause });
		this.name = "AppTourStepError";
		this.phase = phase;
	}
}

export function readStepErrorPhase(error: unknown): StepErrorPhase | undefined {
	if (error instanceof AppTourStepError) return error.phase;
	return undefined;
}

export function formatStepErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

export function reportStepError(
	config: AppTourConfig | undefined,
	stepId: string,
	phase: StepErrorPhase,
	error: unknown,
): void {
	console.error(`[app-tour] ${phase} failed:`, error);
	config?.onStepError?.({ stepId, phase, error });
}
