const BACKUP_ATTR = "data-app-tour-describedby-backup";

export function attachDescribedBy(el: HTMLElement, id: string): void {
	if (!el.hasAttribute(BACKUP_ATTR)) {
		el.setAttribute(BACKUP_ATTR, el.getAttribute("aria-describedby") ?? "");
	}

	const existing = el.getAttribute("aria-describedby");
	const ids = existing?.split(/\s+/).filter(Boolean) ?? [];
	if (!ids.includes(id)) {
		el.setAttribute("aria-describedby", [...ids, id].join(" "));
	}
}

export function detachDescribedBy(el: HTMLElement, id: string): void {
	const backup = el.getAttribute(BACKUP_ATTR);
	if (backup !== null) {
		if (backup) {
			el.setAttribute("aria-describedby", backup);
		} else {
			el.removeAttribute("aria-describedby");
		}
		el.removeAttribute(BACKUP_ATTR);
		return;
	}

	const existing = el.getAttribute("aria-describedby");
	if (!existing) return;

	const ids = existing.split(/\s+/).filter((value) => value !== id);
	if (ids.length > 0) {
		el.setAttribute("aria-describedby", ids.join(" "));
	} else {
		el.removeAttribute("aria-describedby");
	}
}
