import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { TrabajoDocumentPreviewEmptyState } from "@/features/documents/trabajo-preview-empty-state";
import { PrintButton } from "@/features/documents/print-button";
import { resolveTrabajoPreviewId } from "@/features/documents/preview-routing";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { UbicacionClientePreview } from "@/features/documents/ubicacion-cliente-preview";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

export default async function UbicacionClientePreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{ trabajoId?: string; clientId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const trabajoId = await resolveTrabajoPreviewId(params);

	if (!trabajoId) {
		return (
			<TrabajoDocumentPreviewEmptyState
				email={user.email ?? ""}
				shellTitle="Vista previa · Ubicación del cliente"
				shellDescription="Selecciona un trabajo para revisar la información de ubicación."
				eyebrow="Trabajo no seleccionado"
				emptyTitle="Selecciona un trabajo"
				emptyDescription="Elige el trabajo desde el que quieres revisar la ubicación guardada del cliente."
				actionLabel="Elegir trabajo"
				actionHref="/admin/documents/trabajos?template=ubicacion-cliente"
			/>
		);
	}

	const trabajo = await getTrabajoDocumentById(trabajoId);

	if (!trabajo) {
		return (
			<TrabajoDocumentPreviewEmptyState
				email={user.email ?? ""}
				shellTitle="Vista previa · Ubicación del cliente"
				shellDescription="No fue posible cargar el trabajo solicitado."
				eyebrow="Trabajo no disponible"
				emptyTitle="No fue posible cargar el trabajo solicitado"
				emptyDescription="El trabajo solicitado no existe o ya no está disponible."
				actionLabel="Elegir otro trabajo"
				actionHref="/admin/documents/trabajos?template=ubicacion-cliente"
			/>
		);
	}

	const previewClient = buildTrabajoPreviewSubject(
		trabajo,
		"ubicacion-cliente",
	);
	const mapApiKey = process.env.GOOGLE_MAPS_API_KEY ?? null;

	return (
		<AppShell
			role="admin"
			title={`Vista previa · Ubicación de ${previewClient.full_name}`}
			description="Revisa la información guardada del trabajo y la vista de mapa centrada en sus coordenadas."
			email={user.email ?? ""}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3 print:hidden">
					<Link
						href="/admin/documents/trabajos?template=ubicacion-cliente"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar trabajo
					</Link>
					<Link
						href="/admin/documents"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a documentos
					</Link>
					<PrintButton />
				</div>

				<UbicacionClientePreview client={previewClient} mapApiKey={mapApiKey} />
			</div>
		</AppShell>
	);
}
