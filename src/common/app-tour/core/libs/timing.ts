export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	if (signal?.aborted) {
		return Promise.reject(new DOMException("Aborted", "AbortError"));
	}

	return new Promise((resolve, reject) => {
		const timer = window.setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		const onAbort = () => {
			window.clearTimeout(timer);
			reject(new DOMException("Aborted", "AbortError"));
		};

		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
