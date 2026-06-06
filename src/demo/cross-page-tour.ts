import type { NavigateFunction } from "react-router-dom";
import type { TourStep } from "@/common/app-tour";
import { createRouteHandler } from "./navigate";

export function createCrossPageTourSteps(
	navigate: NavigateFunction,
): TourStep[] {
	const route = (path: string) => createRouteHandler(navigate, path);

	return [
		{
			id: "mp-intro",
			operation: {
				tooltip: {
					title: "Cross-page tour",
					description:
						"This flow starts on Home and continues on Settings. Same GuideProvider, different routes.",
					placement: "bottom",
				},
			},
			onStepActive: route("/"),
			nextStep: "mp-search",
		},
		{
			id: "mp-search",
			operation: {
				highlight: "search",
				tooltip: {
					title: "Home · autoFill",
					description: "Step effects still wait for the spotlight to settle.",
					placement: "left",
				},
				autoFill: {
					text: "Cross-page demo",
					delayMs: 60,
					pointerOffset: { x: 8, y: 0 },
				},
			},
			onStepActive: route("/"),
			previousStep: "mp-intro",
			nextStep: "mp-nav",
		},
		{
			id: "mp-nav",
			operation: {
				tooltip: {
					title: "Route on Next",
					description:
						"Next runs onStepComplete → navigate('/settings'). onStepActive keeps Previous in sync.",
					placement: "bottom",
				},
				pointer: {},
			},
			onStepActive: route("/"),
			onStepComplete: route("/settings"),
			previousStep: "mp-search",
			nextStep: "mp-settings-intro",
		},
		{
			id: "mp-settings-intro",
			pageRevealMs: 1000,
			operation: {
				tooltip: {
					title: "Settings page",
					description:
						"Highlight targets live on another route. pageRevealMs shows the page before the spotlight returns.",
					placement: "bottom",
				},
			},
			onStepActive: route("/settings"),
			previousStep: "mp-nav",
			nextStep: "mp-display-name",
		},
		{
			id: "mp-display-name",
			operation: {
				highlight: "settings-display-name",
				tooltip: {
					title: "Settings · autoFill",
					description:
						"autoFill works the same after a client-side route change.",
					placement: "left",
				},
				autoFill: {
					text: "Hajime",
					delayMs: 65,
				},
			},
			onStepActive: route("/settings"),
			previousStep: "mp-settings-intro",
			nextStep: "mp-done",
		},
		{
			id: "mp-done",
			operation: {
				tooltip: {
					title: "Done",
					description:
						"Pair onStepComplete / onStepActive with your router for multi-page product tours.",
					placement: "top",
				},
			},
			onStepActive: route("/settings"),
			onStepComplete: route("/"),
			previousStep: "mp-display-name",
			nextStep: null,
		},
	];
}
