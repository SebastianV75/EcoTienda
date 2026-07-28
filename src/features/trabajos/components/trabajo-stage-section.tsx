"use client";

import { useId, useState, type ReactNode } from "react";

import { trabajoStageLabels, type TrabajoStage } from "@/types/trabajo";

type TrabajoStageSectionProps = {
	title: string;
	stage: TrabajoStage;
	isCompleted: boolean;
	children: ReactNode;
	expandable?: boolean;
};

const statusStyles = {
	completed: "text-[var(--brand-strong)]",
	pending: "text-[var(--muted)]",
} as const;

export function TrabajoStageSection({
	title,
	stage,
	isCompleted,
	children,
	expandable = true,
}: TrabajoStageSectionProps) {
	const [isOpen, setIsOpen] = useState(() => isCompleted || !expandable);
	const contentId = useId();
	const stageInitial = trabajoStageLabels[stage].slice(0, 1);
	const statusLabel = isCompleted ? "Completado" : "Pendiente";
	const statusClassName = isCompleted
		? statusStyles.completed
		: statusStyles.pending;

	if (!expandable) {
		return (
			<section className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white shadow-sm">
				<div className="flex items-start justify-between gap-4 px-5 py-4">
					<div className="flex min-w-0 items-center gap-3">
						<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-sm font-medium text-[var(--brand-deep)]">
							{stageInitial}
						</span>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h3 className="text-sm font-semibold text-[var(--brand-deep)]">
									{title}
								</h3>
								<span className={`text-xs font-medium ${statusClassName}`}>
									{statusLabel}
								</span>
							</div>
							{!isCompleted ? (
								<p className="mt-1 text-sm text-[var(--muted)]">
									Esta etapa se habilitará cuando se complete la anterior.
								</p>
							) : null}
						</div>
					</div>
				</div>
				<div className="border-t border-[var(--border-soft)] p-5">
					{children}
				</div>
			</section>
		);
	}

	return (
		<section className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white shadow-sm">
			<button
				type="button"
				onClick={() => setIsOpen((value) => !value)}
				aria-expanded={isOpen}
				aria-controls={contentId}
				className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 ease-out hover:bg-[var(--surface)]"
			>
				<div className="flex min-w-0 items-center gap-3">
					<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-sm font-medium text-[var(--brand-deep)]">
						{stageInitial}
					</span>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="text-sm font-semibold text-[var(--brand-deep)]">
								{title}
							</h3>
							<span className={`text-xs font-medium ${statusClassName}`}>
								{statusLabel}
							</span>
						</div>
					</div>
				</div>
				<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 ease-out group-hover:text-[var(--brand-deep)]">
					<svg
						aria-hidden="true"
						className={`h-4 w-4 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : "rotate-0"}`}
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</span>
			</button>

			{isOpen ? (
				<div
					id={contentId}
					className="border-t border-[var(--border-soft)] p-5"
				>
					{children}
				</div>
			) : null}
		</section>
	);
}
