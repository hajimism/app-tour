import { useMemo } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import type { AppTourConfig } from "@/common/app-tour";
import { GuideProvider } from "@/common/app-tour";
import { DemoNav } from "@/components/DemoNav";
import { DemoTourTriggers } from "@/components/DemoTourTriggers";
import { createCrossPageTourSteps } from "@/demo/cross-page-tour";
import { playgroundTourSteps } from "@/demo/playground-tour";
import { TOUR_IDS } from "@/demo/tour-ids";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";

const demoGuideConfig: AppTourConfig = {
	showProgress: true,
	elementWaitTimeoutMs: 8000,
};

function DemoRoutes() {
	const navigate = useNavigate();
	const tours = useMemo(
		() => ({
			[TOUR_IDS.playground]: playgroundTourSteps,
			[TOUR_IDS.crossPage]: createCrossPageTourSteps(navigate),
		}),
		[navigate],
	);

	return (
		<GuideProvider
			tours={tours}
			defaultTour={TOUR_IDS.playground}
			config={demoGuideConfig}
		>
			<DemoNav />
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>
			<DemoTourTriggers />
		</GuideProvider>
	);
}

export function DemoApp() {
	return (
		<BrowserRouter>
			<DemoRoutes />
		</BrowserRouter>
	);
}
