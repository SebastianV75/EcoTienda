import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { ClientForm } from "@/features/clients/client-form";
import { getClientById } from "@/features/clients/data";

export default async function EditClientPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { id } = await params;
	const client = await getClientById(id);
	const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? null;

	return (
		<AppShell
			role="admin"
			title={`Editar ${client.full_name}`}
			description="Actualiza los datos del cliente para mantener plantillas, ubicación y contacto siempre alineados."
			email={user.email}
		>
			<div className="space-y-4">
				<Link
					href={`/admin/clients/${client.id}`}
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Volver al detalle
				</Link>

				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<ClientForm
						mode="edit"
						clientId={client.id}
						googleMapsApiKey={googleMapsApiKey}
						defaultValues={{
							full_name: client.full_name,
							phone: client.phone,
							address: client.address,
							neighborhood: client.neighborhood,
							rfc: client.rfc,
							rpu: client.rpu,
							latitude: String(client.latitude),
							longitude: String(client.longitude),
						}}
					/>
				</section>
			</div>
		</AppShell>
	);
}
