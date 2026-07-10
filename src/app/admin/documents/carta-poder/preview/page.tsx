import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClientById } from "@/features/clients/data";
import { CartaPoderPreview } from "@/features/documents/carta-poder-preview";
import { PrintButton } from "@/features/documents/print-button";

export default async function CartaPoderPreviewPage({
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
				title="Carta poder"
				description="Selecciona primero un cliente para generar la vista previa del documento."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<Link
						href="/admin/documents/carta-poder"
						className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
					>
						Elegir cliente
					</Link>
				</section>
			</AppShell>
		);
	}

	const client = await getClientById(clientId);

	return (
		<AppShell
			role="admin"
			title="Vista previa · Carta poder"
			description="Revisa el documento autollenado y descárgalo o imprímelo cuando esté correcto."
			email={user.email}
		>
			<div className="space-y-4">
				<div className="flex flex-wrap gap-3 print:hidden">
					<Link
						href={`/admin/documents/carta-poder?clientId=${client.id}`}
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Cambiar cliente
					</Link>
					<PrintButton />
				</div>

				<CartaPoderPreview client={client} />
			</div>
		</AppShell>
	);
}
