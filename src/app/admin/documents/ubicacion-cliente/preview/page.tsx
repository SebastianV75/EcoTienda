import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClientById } from "@/features/clients/data";
import { DocumentsPreviewEmptyState } from "@/features/documents/preview-empty-states";
import { PrintButton } from "@/features/documents/print-button";
import {
	buildClientPreviewSubject,
	buildTrabajoPreviewSubject,
} from "@/features/documents/preview-data";
import { UbicacionClientePreview } from "@/features/documents/ubicacion-cliente-preview";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

export default async function UbicacionClientePreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{ clientId?: string; trabajoId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const clientId = params?.clientId;
	const trabajoId = params?.trabajoId;

	if (!clientId && !trabajoId) {
		return (
			<AppShell
				role="admin"
				title="Vista previa · Ubicación del cliente"
				description="Selecciona primero un cliente o un trabajo para revisar la información de ubicación."
				email={user.email}
			>
				<DocumentsPreviewEmptyState
					eyebrow="Sin origen seleccionado"
					title="Selecciona un cliente o un trabajo"
					description="Elige desde dónde quieres revisar la ubicación guardada del cliente."
					action={
						<>
							<Link
								href="/admin/documents/ubicacion-cliente"
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
							>
								Elegir cliente
							</Link>
							<Link
								href="/admin/documents/trabajos?template=ubicacion-cliente"
								className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
							>
								Elegir trabajo
							</Link>
						</>
					}
				/>
			</AppShell>
		);
	}

	if (trabajoId) {
		const trabajo = await getTrabajoDocumentById(trabajoId);

		if (!trabajo) {
			return (
				<AppShell
					role="admin"
					title="Vista previa · Ubicación del cliente"
					description="No fue posible cargar el trabajo solicitado."
					email={user.email}
				>
					<DocumentsPreviewEmptyState
						eyebrow="Trabajo no disponible"
						title="No fue posible cargar el trabajo solicitado"
						description="El trabajo solicitado no existe o ya no está disponible."
						action={
							<Link
								href="/admin/documents/trabajos?template=ubicacion-cliente"
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
							>
								Elegir otro trabajo
							</Link>
						}
					/>
				</AppShell>
			);
		}

		const previewClient = buildTrabajoPreviewSubject(trabajo, "ubicacion-cliente");

		return (
			<AppShell
				role="admin"
				title={`Vista previa · Ubicación de ${previewClient.full_name}`}
				description="Revisa la información guardada del trabajo y la vista de mapa centrada en sus coordenadas."
				email={user.email}
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

					<UbicacionClientePreview client={previewClient} mapApiKey={process.env.GOOGLE_MAPS_API_KEY ?? null} />
				</div>
			</AppShell>
		);
	}

	if (!clientId) {
		return (
			<AppShell
				role="admin"
				title="Vista previa · Ubicación del cliente"
				description="Selecciona primero un cliente para revisar la información de ubicación."
				email={user.email}
			>
				<DocumentsPreviewEmptyState
					eyebrow="Cliente no seleccionado"
					title="Selecciona un cliente"
					description="Elige el cliente desde el que quieres revisar la información de ubicación."
					action={
						<>
							<Link
								href="/admin/documents/ubicacion-cliente"
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
							>
								Elegir cliente
							</Link>
							<Link
								href="/admin/documents/trabajos?template=ubicacion-cliente"
								className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
							>
								Elegir trabajo
							</Link>
						</>
					}
				/>
			</AppShell>
		);
	}

	let client: Awaited<ReturnType<typeof getClientById>> | null = null;
	let loadError: string | null = null;

	try {
		client = await getClientById(clientId);
	} catch {
		loadError = "No se pudo cargar el cliente seleccionado.";
	}

	if (loadError || !client) {
		return (
			<AppShell
				role="admin"
				title="Vista previa · Ubicación del cliente"
				description="No fue posible cargar la información de ubicación para el cliente solicitado."
				email={user.email}
			>
				<DocumentsPreviewEmptyState
					eyebrow="Cliente no disponible"
					title="No fue posible cargar el cliente solicitado"
					description={loadError ?? "El cliente solicitado no existe o ya no está disponible."}
					action={
						<>
							<Link
								href="/admin/documents/ubicacion-cliente"
								className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
							>
								Elegir otro cliente
							</Link>
							<Link
								href="/admin/documents"
								className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
							>
								Volver a documentos
							</Link>
						</>
					}
				/>
			</AppShell>
		);
	}

	const mapApiKey = process.env.GOOGLE_MAPS_API_KEY ?? null;

	return (
		<AppShell
			role="admin"
			title={`Vista previa · Ubicación de ${client.full_name}`}
			description="Revisa la información guardada del cliente y la vista de mapa centrada en sus coordenadas."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3 print:hidden">
					<Link
						href={`/admin/documents/ubicacion-cliente?clientId=${client.id}`}
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar cliente
					</Link>
					<Link
						href="/admin/documents/trabajos?template=ubicacion-cliente"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Elegir trabajo
					</Link>
					<Link
						href="/admin/documents"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a documentos
					</Link>
					<PrintButton />
				</div>

				<UbicacionClientePreview client={buildClientPreviewSubject(client)} mapApiKey={mapApiKey} />
			</div>
		</AppShell>
	);
}
