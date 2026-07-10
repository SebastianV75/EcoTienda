import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { ClientForm } from "@/features/clients/client-form";

export default async function NewClientPage() {
	const user = await requireRole(["admin"]);

	return (
		<AppShell
			role="admin"
			title="Nuevo cliente"
			description="Captura los datos básicos que después servirán para plantillas, ubicación y contacto rápido."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href="/admin/clients"
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver a clientes
				</Link>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<ClientForm mode="create" />
				</section>
			</div>
		</AppShell>
	);
}
