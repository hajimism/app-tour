import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import viteLogo from "@/assets/vite.svg";
import { cn } from "@/common/lib/cn";
import { Button, buttonVariants } from "@/common/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/common/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/common/ui/drawer";
import { Input } from "@/common/ui/input";
import { Label } from "@/common/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/common/ui/select";
import "@/App.css";

export function HomePage() {
	const [count, setCount] = useState(0);
	const [search, setSearch] = useState("");
	const [plan, setPlan] = useState("starter");
	const [company, setCompany] = useState("");
	const [note, setNote] = useState("");

	return (
		<>
			<section id="center" className="demo-hero" data-app-tour="hero">
				<div className="hero">
					<img src={reactLogo} className="framework" alt="React logo" />
					<img src={viteLogo} className="vite" alt="Vite logo" />
				</div>
				<div className="demo-hero-copy" data-app-tour="mp-intro">
					<h1>app-tour playground</h1>
					<p>
						Interactive demo for <code>src/common/app-tour</code> — built for
						shadcn prototypes and screen recordings.
					</p>
					<p className="demo-hero-hint">
						Try <strong>Cross-page tour</strong> (⌘⇧K) to continue on Settings.
					</p>
				</div>
			</section>

			<div className="ticks" />

			<section className="demo-panel">
				<h2 className="demo-panel-title">Core actions</h2>
				<div className="demo-panel-grid">
					<div className="demo-field">
						<Label htmlFor="search-input">Search</Label>
						<Input
							id="search-input"
							type="search"
							data-app-tour="search"
							placeholder="Search docs…"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</div>

					<div className="demo-field">
						<Label htmlFor="plan-select">Plan</Label>
						<Select
							value={plan}
							onValueChange={(value) => setPlan(value ?? "starter")}
						>
							<SelectTrigger
								id="plan-select"
								data-app-tour="plan-select"
								className="w-full"
							>
								<SelectValue placeholder="Choose a plan" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="starter">Starter</SelectItem>
								<SelectItem value="pro">Pro</SelectItem>
								<SelectItem value="enterprise">Enterprise</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="demo-field">
						<Label htmlFor="counter-button">Counter</Label>
						<button
							id="counter-button"
							type="button"
							className="counter"
							data-app-tour="counter"
							onClick={() => setCount((value) => value + 1)}
						>
							Count is {count}
						</button>
					</div>
				</div>
			</section>

			<div className="ticks" />

			<section className="demo-panel">
				<h2 className="demo-panel-title">Portals</h2>
				<p className="demo-panel-lead">
					Dialog and Drawer content lives in portals — app-tour waits for them
					after <code>prepare.click</code>.
				</p>
				<div className="demo-panel-actions">
					<Dialog>
						<DialogTrigger
							data-app-tour="open-dialog"
							className={cn(buttonVariants({ variant: "outline" }))}
						>
							Open dialog
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Company profile</DialogTitle>
								<DialogDescription>
									Fields inside Dialog portals can be highlighted and
									auto-filled.
								</DialogDescription>
							</DialogHeader>
							<div className="demo-field">
								<Label htmlFor="dialog-company">Company name</Label>
								<Input
									id="dialog-company"
									data-app-tour="dialog-field"
									value={company}
									onChange={(event) => setCompany(event.target.value)}
									placeholder="Acme Corp"
								/>
							</div>
							<DialogFooter>
								<DialogClose
									data-slot="dialog-close"
									className={cn(buttonVariants({ variant: "outline" }))}
								>
									Close
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Drawer direction="right">
						<DrawerTrigger asChild>
							<Button
								type="button"
								variant="outline"
								data-app-tour="open-sheet"
							>
								Open sheet
							</Button>
						</DrawerTrigger>
						<DrawerContent>
							<DrawerHeader>
								<DrawerTitle>Release notes</DrawerTitle>
								<DrawerDescription>
									Drawer content uses the same tourTargetInShadcnPortal helper.
								</DrawerDescription>
							</DrawerHeader>
							<div className="demo-field px-4">
								<Label htmlFor="sheet-note">Note</Label>
								<textarea
									id="sheet-note"
									data-app-tour="sheet-note"
									className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
									value={note}
									onChange={(event) => setNote(event.target.value)}
									placeholder="What are you shipping?"
								/>
							</div>
							<DrawerFooter>
								<DrawerClose asChild>
									<Button
										type="button"
										variant="outline"
										data-slot="drawer-close"
									>
										Close
									</Button>
								</DrawerClose>
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				</div>
			</section>

			<div className="ticks" />

			<section className="demo-finish" data-app-tour="finish">
				<h2>Next steps</h2>
				<p>
					Read <code>src/common/app-tour/README.md</code> and copy the module
					into your prototype.
				</p>
			</section>
		</>
	);
}
