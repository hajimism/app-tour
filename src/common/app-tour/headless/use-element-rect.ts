import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
	type ElementRect,
	getConnectedElementRect,
} from "../core/libs/highlight-rect";

type RectListener = () => void;

interface ElementRectStore {
	listeners: Set<RectListener>;
	cachedSnapshot: ElementRect | null;
	top: number;
	left: number;
	width: number;
	height: number;
}

const elementRectStores = new WeakMap<Element, ElementRectStore>();

function getOrCreateStore(el: Element): ElementRectStore {
	let store = elementRectStores.get(el);
	if (!store) {
		store = {
			listeners: new Set(),
			cachedSnapshot: null,
			top: Number.NaN,
			left: Number.NaN,
			width: Number.NaN,
			height: Number.NaN,
		};
		elementRectStores.set(el, store);
	}
	return store;
}

/** Returns a referentially stable snapshot when rect values are unchanged. */
export function readStableElementRect(el: Element): ElementRect | null {
	const next = getConnectedElementRect(el);
	const store = getOrCreateStore(el);

	if (!next) {
		store.cachedSnapshot = null;
		return null;
	}

	if (
		store.cachedSnapshot &&
		store.top === next.top &&
		store.left === next.left &&
		store.width === next.width &&
		store.height === next.height
	) {
		return store.cachedSnapshot;
	}

	store.top = next.top;
	store.left = next.left;
	store.width = next.width;
	store.height = next.height;
	store.cachedSnapshot = next;
	return next;
}

function subscribeElementRect(
	anchorEl: Element,
	onStoreChange: () => void,
): () => void {
	const store = getOrCreateStore(anchorEl);
	store.listeners.add(onStoreChange);

	let rafId = 0;

	const scheduleUpdate = () => {
		if (rafId) return;
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			onStoreChange();
		});
	};

	readStableElementRect(anchorEl);
	scheduleUpdate();

	const observer = new ResizeObserver(scheduleUpdate);
	observer.observe(anchorEl);
	window.addEventListener("scroll", scheduleUpdate, true);
	window.addEventListener("resize", scheduleUpdate);

	return () => {
		if (rafId) cancelAnimationFrame(rafId);
		store.listeners.delete(onStoreChange);
		observer.disconnect();
		window.removeEventListener("scroll", scheduleUpdate, true);
		window.removeEventListener("resize", scheduleUpdate);
	};
}

function getElementRectSnapshot(
	anchorEl: Element | null,
	active: boolean,
): ElementRect | null {
	if (!active || anchorEl === null || !anchorEl.isConnected) {
		return null;
	}
	return readStableElementRect(anchorEl);
}

export function useElementRect(anchorEl: Element | null, active = true) {
	const rect = useSyncExternalStore(
		(onStoreChange) => {
			if (!active || anchorEl === null || !anchorEl.isConnected) {
				return () => {};
			}
			return subscribeElementRect(anchorEl, onStoreChange);
		},
		() => getElementRectSnapshot(anchorEl, active),
		() => null,
	);

	const [canAnimate, setCanAnimate] = useState(false);
	const hasPositionedRef = useRef(false);

	useEffect(() => {
		if (!active || anchorEl === null || !anchorEl.isConnected) {
			hasPositionedRef.current = false;
			setCanAnimate(false);
			return;
		}

		let frame = 0;
		if (!hasPositionedRef.current) {
			hasPositionedRef.current = true;
			frame = requestAnimationFrame(() => {
				requestAnimationFrame(() => setCanAnimate(true));
			});
		} else {
			setCanAnimate(true);
		}

		return () => {
			if (frame) cancelAnimationFrame(frame);
		};
	}, [active, anchorEl]);

	return { rect, canAnimate };
}
