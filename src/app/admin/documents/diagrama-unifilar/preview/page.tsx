import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { DiagramaUnifilarPreview } from "@/features/documents/diagrama-unifilar-preview";
import { TrabajoDocumentPreviewEmptyState } from "@/features/documents/trabajo-preview-empty-state";
import { resolveTrabajoPreviewId } from "@/features/documents/preview-routing";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { PrintButton } from "@/features/documents/print-button";
import { getTrabajoDocumentById } from "@/features/trabajos/data";
import { getCompanySettings } from "@/features/settings/data";
import { getUnifilarDiagramResolution } from "@/features/documents/unifilar-diagrams";

export default async function DiagramaUnifilarPreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
	const { settings: company } = await getCompanySettings();
	const params = searchParams ? await searchParams : undefined;
	const trabajoId = await resolveTrabajoPreviewId(params);

	if (!trabajoId) {
		return (
			<TrabajoDocumentPreviewEmptyState
				email={user.email ?? ""}
				shellTitle="Vista previa · Diagrama unifilar"
				shellDescription="Selecciona un trabajo para revisar el panel de datos del diagrama unifilar."
				eyebrow="Trabajo no seleccionado"
				emptyTitle="Selecciona un trabajo"
				emptyDescription="Elige el trabajo desde el que quieres revisar el panel de datos del diagrama unifilar."
				actionLabel="Elegir trabajo"
				actionHref="/admin/documents/trabajos?template=diagrama-unifilar"
			/>
		);
	}

	const trabajo = await getTrabajoDocumentById(trabajoId);

	if (!trabajo) {
		return (
			<TrabajoDocumentPreviewEmptyState
				email={user.email ?? ""}
				shellTitle="Vista previa · Diagrama unifilar"
				shellDescription="No fue posible cargar el trabajo solicitado."
				eyebrow="Trabajo no disponible"
				emptyTitle="No fue posible cargar el trabajo solicitado"
				emptyDescription="El trabajo solicitado no existe o ya no está disponible."
				actionLabel="Elegir otro trabajo"
				actionHref="/admin/documents/trabajos?template=diagrama-unifilar"
			/>
		);
	}

	const previewClient = buildTrabajoPreviewSubject(trabajo, "diagrama-unifilar");
	const diagram = await getUnifilarDiagramResolution(
		trabajo.id,
		previewClient.panel_count,
	);

	return (
		<AppShell
			role={user.role}
			title={`Vista previa · Diagrama unifilar de ${previewClient.full_name}`}
			description="Revisa el panel de datos del trabajo y del equipo de generación solar."
			email={user.email ?? ""}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3 print:hidden">
					<Link
						href="/admin/documents/trabajos?template=diagrama-unifilar"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar trabajo
					</Link>
					<Link
						href="/admin/descargables"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a descargables
					</Link>
						<PrintButton />
					</div>

					{diagram.url && diagram.downloadUrl ? (
						<div className="flex flex-wrap items-center gap-3 print:hidden">
							<a
								href={diagram.downloadUrl}
								download={diagram.originalFilename ?? "diagrama-unifilar.png"}
								className="ui-secondary-action"
							>
								Descargar PNG original
							</a>
							<p className="text-sm text-[var(--muted)]">{diagram.message}</p>
						</div>
					) : (
						<div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
							{diagram.message} Regresa al trabajo para cargarlo manualmente.
						</div>
					)}

					<DiagramaUnifilarPreview
						client={previewClient}
						companyName={company?.company_name ?? "EcoTienda"}
						diagramUrl={diagram.url}
					/>
			</div>
		</AppShell>
	);
}
