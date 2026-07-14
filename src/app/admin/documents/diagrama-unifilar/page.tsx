import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";
import { ClientPreviewSelector } from "@/features/documents/client-preview-selector";

export default async function DiagramaUnifilarTemplatePage() {
	const user = await requireRole(["admin"]);
	const clients = await getClients();

	return (
		<AppShell
			role="admin"
			title="Diagrama unifilar"
			description="Selecciona un cliente para revisar el panel de datos que acompañará al diagrama unifilar."
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
					<ClientPreviewSelector
						clients={clients.map((client) => ({
							id: client.id,
							full_name: client.full_name,
							rpu: client.rpu,
						}))}
						template="diagrama-unifilar"
					/>
				</section>
			</div>
		</AppShell>
	);
}
