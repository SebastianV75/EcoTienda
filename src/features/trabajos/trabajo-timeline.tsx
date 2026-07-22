"use client";

import { trabajoStages } from "@/types/trabajo";
import { trabajoStageLabels } from "@/types/trabajo";

type TrabajoTimelineProps = {
	currentStage: string;
	completedStages: string[];
};

export function TrabajoTimeline({ currentStage, completedStages }: TrabajoTimelineProps) {
	const stages = trabajoStages;

	return (
		<div className="flex items-center gap-2 overflow-x-auto pb-4 px-2">
			{stages.map((stage, index) => {
				const label = trabajoStageLabels[stage];
				const isCompleted = completedStages.includes(stage);
				const isCurrent = stage === currentStage;
				const isFuture = !isCompleted && !isCurrent;

				return (
					<div key={stage} className="flex flex-col items-center flex-shrink-0 relative">
						<div
							className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
								isCompleted
									? "bg-[var(--brand)] text-white"
									: isCurrent
									? "bg-[var(--brand)] text-white ring-4 ring-[var(--brand)]/20"
									: "bg-[var(--surface)] border border-[var(--border-soft)] text-[var(--muted)]"
							}`}
						>
							{isCompleted ? (
								<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							) : (
								index + 1
							)}
						</div>
						<p className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${isCurrent ? "text-[var(--brand-deep)]" : "text-[var(--muted)]"}`}>
							{label}
						</p>
						{index < stages.length - 1 && (
							<div
								className={`absolute top-5 left-[50%] w-full h-1 -translate-x-[50%] ${isCompleted ? "bg-[var(--brand)]" : "bg-[var(--border-soft)]"}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}