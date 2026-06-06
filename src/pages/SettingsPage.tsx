import { useState } from "react";
import { Input } from "@/common/ui/input";
import { Label } from "@/common/ui/label";
import "@/App.css";

export function SettingsPage() {
	const [displayName, setDisplayName] = useState("");

	return (
		<>
			<section className="demo-settings-hero" data-app-tour="mp-settings-intro">
				<h1>Settings</h1>
				<p>
					This page only exists for the cross-page tour.{" "}
					<code>onStepActive</code> routes here when you go forward or back.
				</p>
			</section>

			<div className="ticks" />

			<section className="demo-panel">
				<h2 className="demo-panel-title">Profile</h2>
				<div className="demo-field max-w-md">
					<Label htmlFor="settings-display-name">Display name</Label>
					<Input
						id="settings-display-name"
						data-app-tour="settings-display-name"
						value={displayName}
						onChange={(event) => setDisplayName(event.target.value)}
						placeholder="Your name"
					/>
				</div>
			</section>

			<div className="ticks" />

			<section className="demo-finish" data-app-tour="mp-done">
				<h2>Cross-page complete</h2>
				<p>
					Last step runs <code>onStepComplete</code> to return Home when you
					finish.
				</p>
			</section>
		</>
	);
}
