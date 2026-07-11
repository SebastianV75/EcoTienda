import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClientById } from "@/features/clients/data";
import { UbicacionClientePreview } from "@/features/documents/ubicacion-cliente-preview";

export default async function UbicacionClientePreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{ clientId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const clientId = params?.clientId;

	if (!clientId) {
		return (
			<AppShell
				role="admin"
				title="Vista previa · Ubicación del cliente"
				description="Selecciona primero un cliente para revisar la información de ubicación."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-sm leading-7 text-[var(--muted)]">
						Falta seleccionar un cliente para generar la vista previa de
						ubicación.
					</p>
					<Link
						href="/admin/documents/ubicacion-cliente"
						className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Elegir cliente
					</Link>
				</section>
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
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-sm leading-7 text-[var(--muted)]">
						{loadError ??
							"El cliente solicitado no existe o ya no está disponible."}
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
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
							Volver a descargables
						</Link>
					</div>
				</section>
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
				<div className="flex flex-wrap gap-3">
					<Link
						href={`/admin/documents/ubicacion-cliente?clientId=${client.id}`}
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar cliente
					</Link>
					<Link
						href="/admin/documents"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a descargables
					</Link>
				</div>

				<UbicacionClientePreview client={client} mapApiKey={mapApiKey} />
			</div>
		</AppShell>
	);
}
