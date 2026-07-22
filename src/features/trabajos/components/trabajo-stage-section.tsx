"use client";

import { useState } from "react";
import { trabajoStageLabels } from "@/types/trabajo";

type TrabajoStageSectionProps = {
	title: string;
	stage: string;
	isCompleted: boolean;
	children: React.ReactNode;
	expandable?: boolean;
};

export function TrabajoStageSection({ title, stage, isCompleted, children, expandable = true }: TrabajoStageSectionProps) {
	const [isOpen, setIsOpen] = useState(isCompleted || !expandable);

	if (!expandable) {
		return (
			<section className="rounded-[24px] border border-[var(--border-soft)] bg-white">
				<div className="px-5 py-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-[var(--brand-deep)]">{title}</h3>
						<span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
							Completado
						</span>
					</div>
				</div>
				<div className="border-t border-[var(--border-soft)] p-5">{children}</div>
			</section>
		);
	}

	return (
		<section className="rounded-[24px] border border-[var(--border-soft)] bg-white overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--surface)]"
			>
				<div className="flex items-center gap-3">
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface)] text-sm font-medium text-[var(--brand-deep)]">
						{trabajoStageLabels[stage as keyof typeof trabajoStageLabels]?.[0] || "?"}
					</span>
					<h3 className="text-sm font-semibold text-[var(--brand-deep)]">{title}</h3>
					{!isCompleted && (
						<span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
							Pendiente
						</span>
					)}
					{isCompleted && (
						<span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
							Completado
						</span>
					)}
				</div>
				<svg
					className={`h-5 w-5 text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			</button>
			{isOpen && <div className="border-t border-[var(--border-soft)] p-5">{children}</div>}
		</section>
	);
}