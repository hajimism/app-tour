import type { Dispatch } from "react";
import type { PointerTarget } from "../core/types/view-state";
import type { StepGuideAction } from "./step-guide-state";

export function createPointerDispatchers(dispatch: Dispatch<StepGuideAction>) {
	return {
		onPointerShow: (target: PointerTarget) =>
			dispatch({ type: "POINTER_SHOW", payload: target }),
		onPointerHide: () => dispatch({ type: "POINTER_HIDE" }),
	};
}
