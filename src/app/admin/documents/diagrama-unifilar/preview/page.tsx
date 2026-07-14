import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClientById } from "@/features/clients/data";
import { DiagramaUnifilarPreview } from "@/features/documents/diagrama-unifilar-preview";

export default async function DiagramaUnifilarPreviewPage({
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
				title="Vista previa · Diagrama unifilar"
				description="Selecciona primero un cliente para revisar el panel de datos del diagrama unifilar."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-sm leading-7 text-[var(--muted)]">
						Falta seleccionar un cliente para generar la vista previa del panel
						de datos del diagrama unifilar.
					</p>
					<Link
						href="/admin/documents/diagrama-unifilar"
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
				title="Vista previa · Diagrama unifilar"
				description="No fue posible cargar el panel de datos para el cliente solicitado."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<p className="text-sm leading-7 text-[var(--muted)]">
						{loadError ??
							"El cliente solicitado no existe o ya no está disponible."}
					</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<Link
							href="/admin/documents/diagrama-unifilar"
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

	return (
		<AppShell
			role="admin"
			title={`Vista previa · Diagrama unifilar de ${client.full_name}`}
			description="Revisa el panel de datos del cliente y del equipo de generación solar."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href={`/admin/documents/diagrama-unifilar?clientId=${client.id}`}
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

				<DiagramaUnifilarPreview client={client} />
			</div>
		</AppShell>
	);
}
