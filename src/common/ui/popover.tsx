import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type * as React from "react";
import { forwardRef } from "react";

import { cn } from "@/common/lib/cn";
import "./popover-arrow.css";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
	return (
		<PopoverPrimitive.Arrow
			data-slot="popover-arrow"
			className={className}
			{...props}
		>
			<svg
				viewBox="0 0 12 6"
				className="popover-arrow-graphic"
				aria-hidden="true"
			>
				<polygon
					points="0,6 6,0 12,6"
					className="fill-popover stroke-foreground/10"
					strokeWidth="0.5"
					strokeLinejoin="round"
				/>
			</svg>
		</PopoverPrimitive.Arrow>
	);
}

const PopoverContent = forwardRef<
	HTMLDivElement,
	PopoverPrimitive.Popup.Props &
		Pick<
			PopoverPrimitive.Positioner.Props,
			| "align"
			| "alignOffset"
			| "anchor"
			| "arrowPadding"
			| "collisionAvoidance"
			| "positionMethod"
			| "side"
			| "sideOffset"
		> & {
			positionerClassName?: string;
			positionerStyle?: React.CSSProperties;
			showArrow?: boolean;
		}
>(function PopoverContent(
	{
		className,
		positionerClassName,
		positionerStyle,
		align = "center",
		alignOffset = 0,
		side = "bottom",
		sideOffset = 4,
		anchor,
		positionMethod = "absolute",
		collisionAvoidance,
		arrowPadding = 8,
		showArrow = false,
		children,
		...props
	},
	ref,
) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				anchor={anchor}
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
				arrowPadding={arrowPadding}
				positionMethod={positionMethod}
				collisionAvoidance={collisionAvoidance}
				className={cn("isolate z-50", positionerClassName)}
				style={positionerStyle}
			>
				<PopoverPrimitive.Popup
					ref={ref}
					data-slot="popover-content"
					className={cn(
						"z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						showArrow && "relative overflow-visible",
						className,
					)}
					{...props}
				>
					{showArrow && <PopoverArrow />}
					{children}
				</PopoverPrimitive.Popup>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
});

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="popover-header"
			className={cn("flex flex-col gap-0.5 text-sm", className)}
			{...props}
		/>
	);
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
	return (
		<PopoverPrimitive.Title
			data-slot="popover-title"
			className={cn("font-medium", className)}
			{...props}
		/>
	);
}

function PopoverDescription({
	className,
	...props
}: PopoverPrimitive.Description.Props) {
	return (
		<PopoverPrimitive.Description
			data-slot="popover-description"
			className={cn("text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Popover,
	PopoverArrow,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
};
