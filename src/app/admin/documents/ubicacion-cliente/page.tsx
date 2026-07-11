import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";

export default async function UbicacionClienteTemplatePage({
	searchParams,
}: {
	searchParams?: Promise<{ clientId?: string }>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const selectedClientId = params?.clientId ?? "";
	const clients = await getClients();

	return (
		<AppShell
			role="admin"
			title="Ubicación del cliente"
			description="Selecciona un cliente para revisar su información de ubicación y el mapa centrado en las coordenadas guardadas."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3">
					<Link
						href="/admin/documents"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Volver a descargables
					</Link>
				</div>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<form className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
						<div className="space-y-2.5">
							<label
								htmlFor="clientId"
								className="text-sm font-medium text-[var(--brand-deep)]"
							>
								Cliente
							</label>
							<select
								id="clientId"
								name="clientId"
								defaultValue={selectedClientId}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
							>
								<option value="">Selecciona un cliente</option>
								{clients.map((client) => (
									<option key={client.id} value={client.id}>
										{client.full_name} · {client.rpu}
									</option>
								))}
							</select>
						</div>
						<button
							type="submit"
							className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Seleccionar cliente
						</button>
					</form>
				</section>

				{selectedClientId ? (
					<section className="rounded-[26px] border border-emerald-100 bg-[var(--surface-strong)] p-5 text-sm leading-6 text-[var(--muted)]">
						Cliente seleccionado. Continúa a la vista previa para revisar la
						información de ubicación y el mapa.
						<div className="mt-4">
							<Link
								href={`/admin/documents/ubicacion-cliente/preview?clientId=${selectedClientId}`}
								className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-50"
							>
								Abrir vista previa
							</Link>
						</div>
					</section>
				) : null}
			</div>
		</AppShell>
	);
}
