import { useCallback, useEffect } from "react";
import { useTour } from "@/common/app-tour";
import { Button } from "@/common/ui/button";
import { type DemoTourId, TOUR_IDS } from "@/demo/tour-ids";

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;

	return Boolean(
		target.closest("input, textarea, select, [contenteditable='true']") ||
			target.isContentEditable,
	);
}

function TourStartButton({
	tourId,
	label,
	shortcut,
	onStart,
}: {
	tourId: DemoTourId;
	label: string;
	shortcut: string;
	onStart: (tourId: DemoTourId) => void;
}) {
	return (
		<Button type="button" className="shadow-md" onClick={() => onStart(tourId)}>
			<kbd className="pointer-events-none rounded-md border border-white/60 bg-black/25 px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none text-white">
				{shortcut}
			</kbd>
			{label}
		</Button>
	);
}

export function DemoTourTriggers() {
	const { isRunning, startTour } = useTour();

	const handleStart = useCallback(
		(tourId: DemoTourId) => {
			if (isRunning) return;
			void startTour(tourId);
		},
		[isRunning, startTour],
	);

	useEffect(() => {
		if (isRunning) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey)) return;
			if (event.altKey) return;
			if (isEditableTarget(event.target)) return;

			if (event.key.toLowerCase() === "k" && !event.shiftKey) {
				event.preventDefault();
				handleStart(TOUR_IDS.playground);
				return;
			}

			if (event.key.toLowerCase() === "k" && event.shiftKey) {
				event.preventDefault();
				handleStart(TOUR_IDS.crossPage);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleStart, isRunning]);

	if (isRunning) return null;

	return (
		<div className="demo-tour-triggers">
			<TourStartButton
				tourId={TOUR_IDS.playground}
				label="Playground tour"
				shortcut="⌘K"
				onStart={handleStart}
			/>
			<TourStartButton
				tourId={TOUR_IDS.crossPage}
				label="Cross-page tour"
				shortcut="⌘⇧K"
				onStart={handleStart}
			/>
		</div>
	);
}
