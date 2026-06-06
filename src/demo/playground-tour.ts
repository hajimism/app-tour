import type { TourStep } from "@/common/app-tour";
import { tourTargetInShadcnPortal } from "@/common/app-tour";

export const playgroundTourSteps: TourStep[] = [
	{
		id: "hero",
		operation: {
			tooltip: {
				title: "app-tour demo",
				description:
					"Spotlight, tooltips, and recording-ready demo actions. Click Next to explore each feature.",
				placement: "bottom",
			},
		},
		nextStep: "search",
	},
	{
		id: "search",
		operation: {
			tooltip: {
				title: "autoFill",
				description:
					"Types into React controlled inputs character-by-character — ideal for screen recordings.",
				placement: "left",
			},
			autoFill: {
				text: "Q3 roadmap",
				delayMs: 65,
				pointerOffset: { x: 10, y: 0 },
			},
		},
		previousStep: "hero",
		nextStep: "plan-select",
	},
	{
		id: "plan-select",
		operation: {
			tooltip: {
				title: "select",
				description:
					"Opens a shadcn Select and picks an option via the select operation.",
				placement: "bottom",
			},
			select: { value: "pro", pointer: true },
		},
		previousStep: "search",
		nextStep: "counter",
	},
	{
		id: "counter",
		operation: {
			tooltip: {
				title: "pointer + click",
				description:
					"Pointer draws attention while you narrate. Next fires a declarative click on the target.",
				placement: "top",
			},
			pointer: {},
			click: { when: "complete", pointer: true },
		},
		previousStep: "plan-select",
		nextStep: "dialog-field",
	},
	{
		id: "dialog-field",
		operation: {
			prepare: { click: "open-dialog", settleMs: 350 },
			highlight: tourTargetInShadcnPortal("dialog-field", "dialogContent"),
			tooltip: {
				title: "Dialog + prepare",
				description:
					"prepare.click opens the dialog, then autoFill runs on a field inside the portal.",
				placement: "right",
			},
			autoFill: {
				text: "Acme Corp",
				delayMs: 70,
			},
		},
		onStepComplete: () => {
			document
				.querySelector<HTMLElement>('[data-slot="dialog-close"]')
				?.click();
		},
		previousStep: "counter",
		nextStep: "sheet-note",
	},
	{
		id: "sheet-note",
		operation: {
			prepare: { click: "open-sheet", settleMs: 350 },
			highlight: tourTargetInShadcnPortal("sheet-note", "drawerContent"),
			tooltip: {
				title: "Drawer / sheet",
				description:
					"Same portal helpers work with shadcn Drawer (vaul). prepare opens the panel first.",
				placement: "left",
			},
			autoFill: {
				text: "Ship the demo video",
				delayMs: 55,
			},
		},
		onStepComplete: () => {
			document
				.querySelector<HTMLElement>('[data-slot="drawer-close"]')
				?.click();
		},
		previousStep: "dialog-field",
		nextStep: "finish",
	},
	{
		id: "finish",
		operation: {
			tooltip: {
				title: "You're set",
				description:
					"Copy src/common/app-tour into your shadcn prototype and define steps in src/main.tsx.",
				placement: "top",
			},
		},
		previousStep: "sheet-note",
		nextStep: null,
	},
];
