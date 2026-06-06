export const TOUR_IDS = {
	playground: "playground",
	crossPage: "crossPage",
} as const;

export type DemoTourId = (typeof TOUR_IDS)[keyof typeof TOUR_IDS];
