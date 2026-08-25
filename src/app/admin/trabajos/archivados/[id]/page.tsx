import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { RestoreTrabajoButton } from "@/features/trabajos/archive-buttons";
import {
	getArchivedTrabajoDocumentById,
	getTrabajoArchiveEvents,
} from "@/features/trabajos/data";
import { composeTrabajoDocumentDefaults } from "@/features/trabajos/defaults";
import { trabajoStageLabels } from "@/types/trabajo";

function display(value: unknown) {
	if (value === null || value === undefined || value === "") return "—";
	return typeof value === "string" ? value : String(value);
}

export default async function ArchivedTrabajoDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const { id } = await params;
	const [trabajo, events] = await Promise.all([
		getArchivedTrabajoDocumentById(id),
		getTrabajoArchiveEvents(id),
	]);

	if (!trabajo || trabajo.status !== "archived") notFound();

	const defaults = composeTrabajoDocumentDefaults(trabajo);

	return (
		<AppShell
			role={user.role}
			title={`Trabajo archivado · ${defaults.client_name}`}
			description="Consulta de solo lectura. Restaura el trabajo para volver a operar o descargar documentos."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link href="/admin/trabajos/archivados" className="ui-secondary-action">Volver a archivados</Link>
					<RestoreTrabajoButton trabajoId={trabajo.id} />
				</div>

				<section className="rounded-[26px] border border-amber-200 bg-amber-50 p-5">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">Solo lectura</p>
					<h1 className="mt-2 text-2xl font-semibold text-amber-950">{defaults.client_name}</h1>
					<p className="mt-2 text-sm leading-6 text-amber-900">Este trabajo está oculto de los módulos operativos. No se pueden editar ni descargar sus derivados hasta restaurarlo.</p>
				</section>

				<section className="grid gap-4 md:grid-cols-2">
					<div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5">
						<h2 className="font-semibold text-[var(--brand-deep)]">Datos del trabajo</h2>
						<dl className="mt-4 space-y-2 text-sm">
							<div><dt className="text-[var(--muted)]">Etapa</dt><dd className="font-medium">{trabajoStageLabels[trabajo.current_stage]}</dd></div>
							<div><dt className="text-[var(--muted)]">Estado anterior</dt><dd className="font-medium">{display(trabajo.archived_previous_status)}</dd></div>
							<div><dt className="text-[var(--muted)]">Teléfono</dt><dd className="font-medium">{display(defaults.client_phone)}</dd></div>
							<div><dt className="text-[var(--muted)]">Domicilio</dt><dd className="font-medium">{display(defaults.address_text)}</dd></div>
						</dl>
					</div>
					<div className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5">
						<h2 className="font-semibold text-[var(--brand-deep)]">Derivados conservados</h2>
						<ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
							<li>Agenda: {trabajo.agenda ? "con datos" : "sin datos"}</li>
							<li>Visita: {trabajo.visita ? "con datos" : "sin datos"}</li>
							<li>Cotización: {trabajo.cotizacion ? "con datos" : "sin datos"}</li>
							<li>Venta: {trabajo.venta ? "con datos" : "sin datos"}</li>
							<li>Archivos multimedia: {trabajo.media_assets.length}</li>
							<li>Overrides de documentos: {trabajo.document_overrides.length}</li>
						</ul>
					</div>
				</section>

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5">
					<h2 className="font-semibold text-[var(--brand-deep)]">Historial de archivado</h2>
					<div className="mt-4 space-y-3">
						{events.map((event) => (
							<div key={event.id} className="rounded-xl bg-[var(--surface)] px-4 py-3 text-sm">
								<p className="font-medium text-[var(--brand-deep)]">{event.action === "archived" ? "Archivado" : "Restaurado"}</p>
								<p className="mt-1 text-[var(--muted)]">{new Date(event.created_at).toLocaleString("es-MX")}{event.reason ? ` · ${event.reason}` : ""}</p>
							</div>
						))}
					</div>
				</section>
			</div>
		</AppShell>
	);
}
