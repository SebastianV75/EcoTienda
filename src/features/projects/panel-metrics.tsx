import type { PanelMetrics } from "@/features/projects/data";
import { projectStageLabels, projectStages } from "@/types/project";

type PanelMetricsGridProps = {
	metrics: PanelMetrics;
};

const currencyFormatter = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
	maximumFractionDigits: 0,
});

const quotationStatusLabels: Record<keyof PanelMetrics["quotationsByStatus"], string> = {
	draft: "Borradores",
	sent: "Enviadas",
	accepted: "Aceptadas",
	rejected: "Rechazadas",
};

function MetricCard({
	label,
	value,
	detail,
}: {
	label: string;
	value: string;
	detail?: string;
}) {
	return (
		<div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
			<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
				{label}
			</p>
			<p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)]">
				{value}
			</p>
			{detail ? (
				<p className="mt-2 text-sm leading-6 text-[var(--muted)]">{detail}</p>
			) : null}
		</div>
	);
}

export function PanelMetricsGrid({ metrics }: PanelMetricsGridProps) {
	const quotationStatusEntries = Object.entries(metrics.quotationsByStatus) as [
		keyof PanelMetrics["quotationsByStatus"],
		number,
	][];
	const stageEntries = projectStages.map((stage) => ({
		stage,
		count: metrics.projectsByStage[stage],
	}));

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			<MetricCard
				label="Visitas del mes"
				value={`${metrics.visitsCompletedThisMonth} realizadas`}
				detail={`${metrics.visitsNotDoneThisMonth} no realizadas · ${metrics.upcomingVisits} próximas`}
			/>
			<MetricCard
				label="Cotizaciones"
				value={`${metrics.quotationsByStatus.sent + metrics.quotationsByStatus.draft} activas`}
				detail={quotationStatusEntries
					.map(([status, count]) => `${quotationStatusLabels[status]}: ${count}`)
					.join(" · ")}
			/>
			<MetricCard
				label="Vendidos del mes"
				value={String(metrics.soldThisMonth)}
				detail={`${currencyFormatter.format(metrics.soldAmountThisMonth)} vendidos`}
			/>
			<MetricCard
				label="Conversión visita → venta"
				value={
					metrics.visitToSaleConversion === null
						? "Sin datos"
						: `${metrics.visitToSaleConversion}%`
				}
				detail="Vendidos del mes sobre visitas realizadas del mes"
			/>
			<MetricCard
				label="Seguimientos activos"
				value={String(metrics.followUpCount)}
				detail="Trabajos que requieren atención hoy"
			/>
			<div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
					Trabajos por etapa
				</p>
				<ul className="mt-3 space-y-1.5">
					{stageEntries.map(({ stage, count }) => (
						<li
							key={stage}
							className="flex items-center justify-between text-sm"
						>
							<span className="text-[var(--muted)]">
								{projectStageLabels[stage]}
							</span>
							<span className="font-semibold text-[var(--brand-deep)]">
								{count}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
