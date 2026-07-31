import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			className={cn(
				"rounded-card border border-[var(--border-soft)] bg-white shadow-card transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.14)] hover:shadow-card-hover motion-reduce:transform-none",
				className,
			)}
		/>
	);
}

export function Surface({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			className={cn(
				"rounded-soft border border-[var(--border-soft)] bg-[var(--surface-strong)]",
				className,
			)}
		/>
	);
}
