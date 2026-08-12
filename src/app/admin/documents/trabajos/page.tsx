import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import {
	TrabajoPreviewSelector,
	type DocumentTemplateSlug,
} from "@/features/documents/trabajo-preview-selector";
import { getTrabajosForDocumentSelection } from "@/features/trabajos/data";

const templates: Array<{
	slug: DocumentTemplateSlug;
	title: string;
	description: string;
}> = [
	{
		slug: "carta-poder",
		title: "Carta poder",
		description:
			"Autollenado con el trabajo más reciente y sus datos ya capturados.",
	},
	{
		slug: "ubicacion-cliente",
		title: "Ubicación del cliente",
		description:
			"Vista previa con datos del trabajo y mapa centrado en su ubicación.",
	},
	{
		slug: "diagrama-unifilar",
		title: "Diagrama unifilar",
		description:
			"Panel de datos que acompaña al trabajo para exportaciones técnicas.",
	},
];

function formatStageLabel(stage: string) {
	switch (stage) {
		case "agenda":
			return "Agenda";
		case "visita":
			return "Visita";
		case "cotizacion":
			return "Cotización";
		case "venta":
			return "Venta";
		case "descargables":
			return "Descargables";
		default:
			return stage;
	}
}

export default async function DocumentWorkSelectionPage({
	searchParams,
}: {
	searchParams?: Promise<{ template?: DocumentTemplateSlug }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const params = searchParams ? await searchParams : undefined;
	const template = params?.template;
	const templateLabel =
		templates.find((item) => item.slug === template)?.title ?? template;

	if (!template) {
		return (
			<AppShell
				role={user.role}
				title="Documentos de trabajo"
				description="Elige una plantilla para abrirla con datos del trabajo en curso."
				email={user.email}
			>
				<div className="space-y-4">
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-sm leading-7 text-[var(--muted)]">
							Selecciona primero la plantilla que quieres prellenar con datos
							del trabajo.
						</p>
					</section>

					<section className="grid gap-4 md:grid-cols-3">
						{templates.map((item) => (
							<article
								key={item.slug}
								className="rounded-[26px] border border-[var(--border-soft)] bg-white p-6 shadow-sm"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
									Plantilla
								</p>
								<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
									{item.title}
								</h3>
								<p className="mt-3 text-sm leading-7 text-[var(--muted)]">
									{item.description}
								</p>
								<Link
									href={`/admin/documents/trabajos?template=${item.slug}`}
									className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
								>
									Elegir trabajo
								</Link>
							</article>
						))}
					</section>
				</div>
			</AppShell>
		);
	}

	const trabajos = await getTrabajosForDocumentSelection();

	return (
		<AppShell
			role={user.role}
			title={`Documentos de trabajo · ${templateLabel}`}
			description="Selecciona el trabajo para abrir la vista previa con datos capturados en el flujo operativo."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin/documents/trabajos"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar plantilla
					</Link>
					<Link
						href="/admin/descargables"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a descargables
					</Link>
				</div>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<TrabajoPreviewSelector
						items={trabajos.map((trabajo) => ({
							id: trabajo.id,
							label: trabajo.intake_name,
							supportingText: [
								formatStageLabel(trabajo.current_stage),
								trabajo.intake_phone,
								trabajo.intake_address_text,
							]
								.filter((part): part is string => Boolean(part && part.trim()))
								.join(" · "),
						}))}
						template={template}
					/>
				</section>
			</div>
		</AppShell>
	);
}
