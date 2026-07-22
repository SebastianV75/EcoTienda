"use client";

import { useState } from "react";

type TrabajoStageSectionProps = {
	title: string;
	stage: string;
	isCompleted: boolean;
	children: React.ReactNode;
	expandable?: boolean;
};

export function TrabajoStageSection({ title, stage, isCompleted, children, expandable = true }: TrabajoStageSectionProps) {
	const [isExpanded, setIsExpanded] = useState(isCompleted || !expandable);

	if (!isCompleted && !expandable) {
		return (
			<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-[var(--brand-deep)]">{title}</h3>
					<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Pendiente</span>
				</div>
				<p className="mt-3 text-sm text-[var(--muted)]">Esta etapa se habilitará cuando se complete la anterior.</p>
			</section>
		);
	}

	return (
		<section className="rounded-[24px] border border-[var(--border-soft)] bg-white shadow-sm">
			<button
				type="button"
				onClick={() => expandable && setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[var(--surface)]"
				aria-expanded={isExpanded}
			>
				<div className="flex items-center gap-3">
					{expandable && (
						<svg
							className={`h-5 w-5 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					)}
					<h3 className="text-sm font-semibold text-[var(--brand-deep)]">{title}</h3>
					<span className={`rounded-full px-3 py-1 text-xs font-medium ${isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
						{isCompleted ? "Completado" : "Pendiente"}
					</span>
				</div>
			</button>
			{isExpanded && (
				<div className="border-t border-[var(--border-soft)] p-5">
					{children}
				</div>
			)}
		</section>
	);
}