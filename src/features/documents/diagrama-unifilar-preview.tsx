import type { DocumentPreviewSubject } from "./preview-data";

type DiagramaUnifilarPreviewProps = {
	client: DocumentPreviewSubject;
	companyName: string;
	diagramUrl: string | null;
};

type PanelField = {
	label: string;
	value: string | null | undefined;
};

type PanelSection = {
	title: string;
	fields: PanelField[];
};

function formatPanelValue(value: string | null | undefined) {
	const trimmed = (value ?? "").trim();
	return trimmed.length > 0 ? trimmed : "—";
}

function PanelSectionCard({ section }: { section: PanelSection }) {
	return (
		<section className="rounded-[22px] border border-[var(--border-soft)] bg-white p-4 shadow-sm sm:p-5 print:rounded-none print:p-2 print:shadow-none">
			<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
				{section.title}
			</p>
				<dl className="mt-3 grid gap-2 sm:grid-cols-2 print:mt-1 print:gap-x-3 print:gap-y-1">
				{section.fields.map((field) => (
					<div key={field.label}>
						<dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
							{field.label}
						</dt>
						<dd className="mt-1 text-sm leading-6 text-[var(--brand-deep)] print:mt-0 print:text-[10px] print:leading-4">
							{formatPanelValue(field.value)}
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}

export function DiagramaUnifilarPreview({
	client,
	companyName,
	diagramUrl,
}: DiagramaUnifilarPreviewProps) {
	const clientSection: PanelSection = {
		title: "Datos del cliente",
		fields: [
			{ label: "Nombre del titular", value: client.full_name },
			{ label: "Número de servicio", value: client.rpu },
			{ label: "R.F.C.", value: client.rfc },
			{ label: "Teléfono", value: client.phone },
			{ label: "Domicilio", value: client.address },
			{ label: "Colonia", value: client.neighborhood },
		],
	};

	const equipmentSection: PanelSection = {
		title: "Equipo de generación",
		fields: [
			{ label: "Cantidad de paneles", value: client.panel_count },
			{ label: "Potencia de paneles", value: client.panel_power },
			{ label: "Inversor", value: client.inverter },
			{ label: "Capacidad instalada", value: client.installed_capacity },
			{
				label: "Generación media mensual estimada",
				value: client.estimated_monthly_generation,
			},
		],
	};

	return (
		<article className="unifilar-print-document mx-auto w-full max-w-[940px] space-y-4 text-black print:space-y-0 print:break-inside-avoid">
			<section className="flex flex-col rounded-[30px] border border-emerald-100 bg-white p-4 shadow-[0_22px_55px_rgba(13,79,46,0.08)] sm:p-6 print:h-[250mm] print:overflow-hidden print:rounded-none print:border-0 print:p-2 print:shadow-none">
				<div className="border-b border-neutral-200 pb-3 print:pb-2">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						{companyName}
					</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] print:text-lg">
						Diagrama unifilar · datos
					</h1>
					<p className="mt-1 text-sm leading-6 text-[var(--muted)] print:hidden">
						Datos del cliente y del equipo de generación solar.
					</p>
				</div>

				<div className="mt-3 grid gap-3 md:grid-cols-2 print:mt-2 print:gap-2">
					<PanelSectionCard section={clientSection} />
					<PanelSectionCard section={equipmentSection} />
				</div>

				{diagramUrl ? (
					<div className="mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] border border-neutral-200 bg-white p-2 print:mt-2 print:rounded-none print:border-0 print:p-0">
						{/* The source PNG is intentionally kept complete, including its native data panel. */}
						{/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL or local fallback */}
						<img
							src={diagramUrl}
							alt="Diagrama unifilar del sistema solar"
							className="max-h-[142mm] w-full object-contain print:max-h-[142mm]"
						/>
					</div>
				) : null}
			</section>
		</article>
	);
}
