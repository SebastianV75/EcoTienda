import Link from "next/link";
import { trabajoStageLabels, trabajoStages } from "@/types/trabajo";
import type { StageStats } from "@/features/trabajos/data";

type StageButtonsProps = {
	stats: StageStats;
};

const stageRoutes: Record<string, string> = {
	agenda: "/agenda",
	visita: "/admin/visits",
	cotizacion: "/admin/quotations",
	venta: "/admin/trabajos?stage=venta",
	descargables: "/admin/documents",
};

const stageIcons: Record<string, React.ReactNode> = {
	agenda: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
	),
	visita: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	),
	cotizacion: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
		</svg>
	),
	venta: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="9" cy="21" r="1" />
			<circle cx="20" cy="21" r="1" />
			<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
		</svg>
	),
	descargables: (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	),
};

export function StageButtons({ stats }: StageButtonsProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
			{trabajoStages.map((stage) => (
				<Link
					key={stage}
					href={stageRoutes[stage]}
					className="group relative flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-emerald-300 hover:shadow-md active:scale-[0.98]"
				>
					<div className="mb-2 text-gray-400 transition-colors duration-200 group-hover:text-emerald-600">
						{stageIcons[stage]}
					</div>
					<div className="text-2xl font-bold text-gray-900">{stats[stage]}</div>
					<div className="mt-1 text-xs font-medium text-gray-500 group-hover:text-gray-700">
						{trabajoStageLabels[stage]}
					</div>
				</Link>
			))}
		</div>
	);
}
