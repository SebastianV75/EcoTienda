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

function getStageIcon(stage: string, isCompleted: boolean) {
	if (isCompleted) {
		return (
			<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
			</svg>
		);
	}

	const iconClass = "h-3 w-3";
	
	switch (stage) {
		case "agenda":
			return (
				<svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			);
		case "visita":
			return (
				<svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
				</svg>
			);
		case "cotizacion":
			return (
				<svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
			);
		case "venta":
			return (
				<svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		case "descargables":
			return (
				<svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
			);
		default:
			return null;
	}
}

export function TrabajoTimeline({
	currentStage,
	completedStages,
}: TrabajoTimelineProps) {
	const stages = trabajoStages;

	return (
		<>
			{/* Mobile: Compact Vertical Timeline */}
			<div className="block sm:hidden">
				<div className="space-y-2">
					{stages.map((stage, index) => {
						const label = trabajoStageLabels[stage as TrabajoStage];
						const isCompleted = completedStages.includes(stage);
						const isCurrent = stage === currentStage;

						return (
							<div key={stage} className="flex items-center gap-2">
								<div className="flex flex-col items-center">
									<div
										className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-200 ease-out ${getNodeStyles({ isCompleted, isCurrent })}`}
									>
										{getStageIcon(stage, isCompleted)}
									</div>
									{index < stages.length - 1 && (
										<div
											className={`w-px h-4 mt-1 ${getConnectorStyles({ isCompleted, isCurrent })}`}
										/>
									)}
								</div>
								<div className="flex-1">
									<p
										className={`text-xs font-medium ${isCurrent ? "text-[var(--brand-deep)]" : "text-[var(--muted)]"}`}
									>
										{label}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Desktop: Horizontal Timeline with Icons */}
			<div className="hidden sm:block">
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
									className={`flex items-start ${isLast ? "" : "pr-3 sm:pr-4"}`}
								>
									<div className="flex w-[80px] flex-col items-center text-center sm:w-[96px]">
										<div
											className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ease-out ${getNodeStyles({ isCompleted, isCurrent })}`}
										>
											{getStageIcon(stage, isCompleted)}
										</div>
										<p
											className={`mt-1.5 text-xs font-medium leading-tight ${isCurrent ? "text-[var(--brand-deep)]" : "text-[var(--muted)]"}`}
										>
											{label}
										</p>
									</div>
									{!isLast ? (
										<div className="mt-4.5 flex min-w-[12px] flex-1 items-center">
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
			</div>
		</>
	);
}
