import { trabajoStages, trabajoStageLabels, type TrabajoStage } from "@/types/trabajo";

type StageProgressIndicatorProps = {
	currentStage: TrabajoStage;
	size?: "sm" | "md";
};

export function StageProgressIndicator({ currentStage, size = "md" }: StageProgressIndicatorProps) {
	const currentIndex = trabajoStages.indexOf(currentStage);

	return (
		<div className="flex items-center gap-1">
			{trabajoStages.map((stage, index) => {
				const isCompleted = index < currentIndex;
				const isCurrent = index === currentIndex;

				return (
					<div key={stage} className="flex items-center gap-1">
						<div
							className={`flex items-center justify-center rounded-full transition-all ${
								size === "sm" ? "h-5 w-5" : "h-6 w-6"
							} ${
								isCompleted
									? "bg-emerald-500 text-white"
									: isCurrent
									? "bg-blue-500 text-white ring-2 ring-blue-200"
									: "bg-gray-200 text-gray-400"
							}`}
						>
							{isCompleted ? (
								<svg
									className={size === "sm" ? "h-3 w-3" : "h-4 w-4"}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							) : (
								<span className={size === "sm" ? "text-xs" : "text-xs"}>
									{index + 1}
								</span>
							)}
						</div>
						{index < trabajoStages.length - 1 && (
							<div
								className={`h-0.5 ${size === "sm" ? "w-3" : "w-4"} ${
									isCompleted ? "bg-emerald-500" : "bg-gray-200"
								}`}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}

export function StageBadge({ stage }: { stage: TrabajoStage }) {
	const stageColors: Record<TrabajoStage, string> = {
		agenda: "bg-purple-100 text-purple-700 border-purple-200",
		visita: "bg-blue-100 text-blue-700 border-blue-200",
		cotizacion: "bg-orange-100 text-orange-700 border-orange-200",
		venta: "bg-green-100 text-green-700 border-green-200",
		descargables: "bg-gray-100 text-gray-700 border-gray-200",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${stageColors[stage]}`}
		>
			{trabajoStageLabels[stage]}
		</span>
	);
}
