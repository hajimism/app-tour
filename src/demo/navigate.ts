import type { NavigateFunction } from "react-router-dom";

export async function waitForRoutePaint(): Promise<void> {
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => resolve());
		});
	});
	await new Promise<void>((resolve) => {
		queueMicrotask(resolve);
	});
}

export function createRouteHandler(navigate: NavigateFunction, path: string) {
	return async () => {
		navigate(path);
		await waitForRoutePaint();
	};
}
