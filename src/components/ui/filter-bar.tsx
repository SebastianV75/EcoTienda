"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
	children,
	activeCount = 0,
	expanded,
	onToggle,
	label = "Filtros",
}: {
	children: ReactNode;
	activeCount?: number;
	expanded: boolean;
	onToggle: () => void;
	label?: string;
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="sr-only">{label}</span>
				<button
					type="button"
					aria-expanded={expanded}
					onClick={onToggle}
					className="relative min-h-11 rounded-full border border-[var(--border-soft)] bg-white px-4 text-sm font-medium text-[var(--brand-deep)] focus-visible:outline-2 focus-visible:outline-emerald-500"
				>
					{expanded ? "Ocultar filtros" : "Mostrar filtros"}
					{activeCount > 0 && (
						<span className="ml-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs text-white">
							{activeCount}
						</span>
					)}
				</button>
			</div>
			<div
				hidden={!expanded}
				className={cn(
					"rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm",
					!expanded && "hidden",
				)}
			>
				{children}
			</div>
		</div>
	);
}
