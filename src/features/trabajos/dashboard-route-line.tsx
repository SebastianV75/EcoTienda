import { trabajoStageLabels, trabajoStages, type TrabajoStage } from "@/types/trabajo";

type DashboardRouteLineProps = {
	currentStage: TrabajoStage;
};

export function DashboardRouteLine({ currentStage }: DashboardRouteLineProps) {
	const currentStageIndex = trabajoStages.indexOf(currentStage);

	return (
		<ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] sm:text-xs">
			{trabajoStages.map((stage, index) => {
				const isCurrentStage = index === currentStageIndex;
				const isPastStage = currentStageIndex > index;

				return (
					<li key={stage} className="flex items-center gap-1.5">
						<span
							className={`inline-flex min-h-[28px] items-center rounded-full border px-2.5 py-1 transition duration-200 ease-out ${
								isCurrentStage
									? "border-[var(--brand-strong)] bg-emerald-50 text-[var(--brand-deep)]"
									: isPastStage
										? "border-[rgba(13,79,46,0.12)] bg-[rgba(239,246,239,0.88)] text-[var(--brand-deep)]"
										: "border-[var(--border-soft)] bg-white text-[var(--muted)]"
								}`}
						>
							{trabajoStageLabels[stage]}
						</span>
						{index < trabajoStages.length - 1 ? (
							<span aria-hidden="true" className="text-[var(--muted)]">
								→
							</span>
						) : null}
					</li>
				);
			})}
		</ol>
	);
}
