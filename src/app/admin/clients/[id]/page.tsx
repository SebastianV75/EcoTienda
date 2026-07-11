import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { ClientActions } from "@/features/clients/client-actions";
import { getClientById } from "@/features/clients/data";

export default async function ClientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;
	const client = await getClientById(id);

	return (
		<AppShell
			role="admin"
			title={client.full_name}
			description="Consulta los datos guardados del cliente y reutilízalos después en plantillas o contacto rápido."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin/clients"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a clientes
					</Link>
					<ClientActions
						clientId={client.id}
						phone={client.phone}
						latitude={client.latitude}
						longitude={client.longitude}
						showEdit
					/>
				</div>

				<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
					<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Datos del cliente
						</p>
						<dl className="mt-5 space-y-4 text-sm text-[var(--muted)]">
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">Teléfono</dt>
								<dd className="mt-1">{client.phone}</dd>
							</div>
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">RFC</dt>
								<dd className="mt-1">{client.rfc}</dd>
							</div>
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">RPU</dt>
								<dd className="mt-1">{client.rpu}</dd>
							</div>
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">Colonia</dt>
								<dd className="mt-1">{client.neighborhood}</dd>
							</div>
							<div>
								<dt className="font-medium text-[var(--brand-deep)]">Dirección</dt>
								<dd className="mt-1 leading-7">{client.address}</dd>
							</div>
						</dl>
					</article>

					<article className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
							Ubicación
						</p>
						<div className="mt-5 rounded-[24px] border border-emerald-100 bg-[var(--surface-strong)] p-5">
							<p className="text-sm font-medium text-[var(--brand-deep)]">
								Coordenadas guardadas
							</p>
							<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
								Latitud: {client.latitude}
								<br />
								Longitud: {client.longitude}
							</p>
						</div>
					</article>
				</section>
			</div>
		</AppShell>
	);
}
