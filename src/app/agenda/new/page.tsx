import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { AgendaItemForm } from "@/features/agenda/agenda-item-form";
import { requireRole } from "@/features/auth/session";
import { getClients } from "@/features/clients/data";
import type { AgendaItemFormValues } from "@/types/agenda";

const defaultValues: AgendaItemFormValues = {
	fecha: new Date().toISOString().slice(0, 10),
	titulo: "",
	tipo: "cita",
	estado: "pendiente",
	descripcion: "",
	client_id: "",
};

export default async function NewAgendaItemPage() {
	const user = await requireRole(["admin"]);

	let clients: Awaited<ReturnType<typeof getClients>> = [];
	let clientsNotice: string | null = null;

	try {
		clients = await getClients();
	} catch {
		clientsNotice =
			"No pudimos cargar la lista de clientes en este momento. Podés crear la cita o tarea y vincular el cliente más tarde.";
	}

	return (
		<AppShell
			role="admin"
			title="Nuevo elemento"
			description="Crea una cita, visita, instalación o recordatorio interno de forma simple y ordenada."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href="/agenda"
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver a agenda
				</Link>

				{clientsNotice ? (
					<section className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{clientsNotice}
					</section>
				) : null}

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<AgendaItemForm
						mode="create"
						clients={clients.map((client) => ({
							id: client.id,
							full_name: client.full_name,
							rpu: client.rpu,
						}))}
						defaultValues={defaultValues}
					/>
				</section>
			</div>
		</AppShell>
	);
}
