import type { DocumentPreviewSubject } from "./preview-data";

type DiagramaUnifilarPreviewProps = {
	client: DocumentPreviewSubject;
	companyName: string;
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
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
			<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
				{section.title}
			</p>
			<dl className="mt-4 grid gap-3 sm:grid-cols-2">
				{section.fields.map((field) => (
					<div key={field.label}>
						<dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
							{field.label}
						</dt>
						<dd className="mt-1 text-sm leading-6 text-[var(--brand-deep)]">
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
		<article className="mx-auto w-full max-w-[940px] space-y-4 text-black">
			<section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_22px_55px_rgba(13,79,46,0.08)] sm:p-8">
				<div className="border-b border-neutral-200 pb-5">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)]">
						{companyName}
					</p>
					<h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						Diagrama unifilar · datos
					</h1>
					<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
						Panel de datos del cliente y del equipo de generación solar. La
						representación gráfica del diagrama eléctrico se agregará cuando se
						entreguen los diagramas de referencia.
					</p>
				</div>

				<div className="mt-5 space-y-4">
					<PanelSectionCard section={clientSection} />
					<PanelSectionCard section={equipmentSection} />
				</div>
			</section>
		</article>
	);
}
