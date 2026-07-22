import {
	trabajoStageLabels,
	trabajoStages,
	type TrabajoStage,
} from "@/types/trabajo";

type DashboardRouteLineProps = {
	currentStage: TrabajoStage;
};

export function DashboardRouteLine({ currentStage }: DashboardRouteLineProps) {
	const currentStageIndex = trabajoStages.indexOf(currentStage);

	return (
		<ol className="-mx-1 flex flex-nowrap items-center gap-1 overflow-x-auto px-1 pb-1 text-[10px] font-medium text-[var(--muted)] sm:mx-0 sm:gap-1.5 sm:overflow-visible sm:px-0 sm:pb-0 sm:text-[11px]">
			{trabajoStages.map((stage, index) => {
				const isCurrentStage = index === currentStageIndex;
				const isPastStage = currentStageIndex > index;

				return (
					<li key={stage} className="flex items-center gap-1 sm:gap-1.5">
						<span
							className={
								"inline-flex min-h-[22px] items-center rounded-full border px-2 py-0.5 transition duration-200 ease-out sm:min-h-[24px] sm:px-2.5 " +
								(isCurrentStage
									? "border-[rgba(13,79,46,0.22)] bg-[rgba(239,246,239,0.98)] text-[var(--brand-deep)]"
									: isPastStage
										? "border-[rgba(13,79,46,0.10)] bg-[rgba(243,247,243,0.92)] text-[var(--brand-deep)]"
										: "border-transparent bg-transparent text-[var(--muted)]")
							}
						>
							{trabajoStageLabels[stage]}
						</span>
						{index < trabajoStages.length - 1 ? (
							<span aria-hidden="true" className="text-[var(--muted)]/70">
								→
							</span>
						) : null}
					</li>
				);
			})}
		</ol>
	);
}
