import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { DiagramaUnifilarPreview } from "@/features/documents/diagrama-unifilar-preview";
import { TrabajoDocumentPreviewEmptyState } from "@/features/documents/trabajo-preview-empty-state";
import { resolveTrabajoPreviewId } from "@/features/documents/preview-routing";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { PrintButton } from "@/features/documents/print-button";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

export default async function DiagramaUnifilarPreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string }>;
}) {
	const user = await requireRole(["admin", "administrative"]);
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

	const previewClient = buildTrabajoPreviewSubject(
		trabajo,
		"diagrama-unifilar",
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

				<DiagramaUnifilarPreview client={previewClient} />
			</div>
		</AppShell>
	);
}
