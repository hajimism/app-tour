export function reactType(
	el: HTMLInputElement | HTMLTextAreaElement,
	value: string,
): void {
	const proto = Object.getPrototypeOf(el) as HTMLInputElement;
	const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
	const setter = descriptor?.set;
	if (!setter) {
		throw new Error("Unable to resolve native value setter");
	}
	setter.call(el, value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
}
