import { NavLink } from "react-router-dom";
import { cn } from "@/common/lib/cn";

const linkClass = ({ isActive }: { isActive: boolean }) =>
	cn(
		"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
		isActive
			? "bg-primary/10 text-primary"
			: "text-muted-foreground hover:bg-muted hover:text-foreground",
	);

export function DemoNav() {
	return (
		<header className="demo-nav">
			<div className="demo-nav-inner">
				<span className="demo-nav-brand">app-tour</span>
				<nav className="demo-nav-links" aria-label="Demo pages">
					<NavLink to="/" end className={linkClass}>
						Home
					</NavLink>
					<NavLink to="/settings" className={linkClass} data-app-tour="mp-nav">
						Settings
					</NavLink>
				</nav>
			</div>
		</header>
	);
}
