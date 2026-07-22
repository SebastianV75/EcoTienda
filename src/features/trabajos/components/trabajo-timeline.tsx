"use client";

import { trabajoStageLabels, trabajoStages, type TrabajoStage } from "@/types/trabajo";

type TrabajoTimelineProps = {
	currentStage: TrabajoStage;
	completedStages: Record<TrabajoStage, boolean>;
};

export function TrabajoTimeline({ currentStage, completedStages }: TrabajoTimelineProps) {
	const currentIndex = trabajoStages.indexOf(currentStage);

	return (
		<div className="overflow-x-auto pb-4">
			<div className="flex items-center gap-0 min-w-max">
				{trabajoStages.map((stage, index) => {
					const isCompleted = completedStages[stage];
					const isCurrent = stage === currentStage;
					const isPast = index < currentIndex;

					return (
						<div key={stage} className="flex flex-col items-center relative">
							{index < trabajoStages.length - 1 && (
								<div className="absolute left-1/2 top-8 -translate-x-1/2 w-full h-1.5 z-0" style={{ width: "120px" }}>
									<div
										className="h-full rounded-full"
										style={{
											backgroundColor: isCompleted || isPast
												? "var(--brand)"
												: "var(--border-soft)",
										}}
									/>
								</div>
							)}
							<div
								className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all ${
									isCompleted
										? "bg-[var(--brand)] border-[var(--brand)] text-white"
										: isCurrent
										? "bg-white border-[var(--brand)] text-[var(--brand)] shadow-[0_0_0_3px_rgba(13,79,46,0.15)]"
										: "bg-white border-[var(--border-soft)] text-[var(--muted)]"
								}`}
							>
								{isCompleted ? (
									<svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<span className="text-lg font-semibold">{index + 1}</span>
								)}
							</div>
							<p className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${isCurrent ? "text-[var(--brand-deep)]" : "text-[var(--muted)]"}`}>
								{trabajoStageLabels[stage]}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}