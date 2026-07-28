"use client";

import {
	trabajoStageLabels,
	trabajoStages,
	type TrabajoStage,
} from "@/types/trabajo";

type TrabajoTimelineProps = {
	currentStage: string;
	completedStages: string[];
};

function getNodeStyles({
	isCompleted,
	isCurrent,
}: {
	isCompleted: boolean;
	isCurrent: boolean;
}) {
	if (isCompleted) {
		return "border-transparent bg-[var(--brand)] text-white";
	}

	if (isCurrent) {
		return "border-[rgba(13,79,46,0.16)] bg-[rgba(243,247,243,0.96)] text-[var(--brand-deep)] shadow-[inset_0_0_0_1px_rgba(13,79,46,0.08)]";
	}

	return "border-[var(--border-soft)] bg-white text-[var(--muted)]";
}

function getConnectorStyles({
	isCompleted,
	isCurrent,
}: {
	isCompleted: boolean;
	isCurrent: boolean;
}) {
	if (isCompleted || isCurrent) {
		return "bg-[rgba(47,179,20,0.65)]";
	}

	return "bg-[var(--border-soft)]";
}

export function TrabajoTimeline({
	currentStage,
	completedStages,
}: TrabajoTimelineProps) {
	const stages = trabajoStages;

	return (
		<div className="overflow-x-auto px-1 pb-1">
			<div className="flex min-w-max items-start">
				{stages.map((stage, index) => {
					const label = trabajoStageLabels[stage as TrabajoStage];
					const isCompleted = completedStages.includes(stage);
					const isCurrent = stage === currentStage;
					const isLast = index === stages.length - 1;

					return (
						<div
							key={stage}
							className={`flex items-start ${isLast ? "" : "pr-4 sm:pr-5"}`}
						>
							<div className="flex w-[96px] flex-col items-center text-center sm:w-[112px]">
								<div
									className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ease-out ${getNodeStyles({ isCompleted, isCurrent })}`}
								>
									{isCompleted ? (
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2.2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									) : (
										index + 1
									)}
								</div>
								<p
									className={`mt-2 text-xs font-medium leading-5 ${isCurrent ? "text-[var(--brand-deep)]" : "text-[var(--muted)]"}`}
								>
									{label}
								</p>
							</div>
							{!isLast ? (
								<div className="mt-5 flex min-w-[16px] flex-1 items-center">
									<div
										aria-hidden="true"
										className={`h-px w-full rounded-full ${getConnectorStyles({ isCompleted, isCurrent })}`}
									/>
								</div>
							) : null}
						</div>
					);
				})}
			</div>
		</div>
	);
}
