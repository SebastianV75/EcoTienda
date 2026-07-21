import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getClientById } from "@/features/clients/data";
import { CartaPoderPreview } from "@/features/documents/carta-poder-preview";
import { buildClientPreviewSubject, buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { PrintButton } from "@/features/documents/print-button";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

export default async function CartaPoderPreviewPage({
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
				title="Carta poder"
				description="Selecciona primero un cliente o un trabajo para generar la vista previa del documento."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<div className="flex flex-wrap gap-3">
						<Link
							href="/admin/documents/carta-poder"
							className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Elegir cliente
						</Link>
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
						>
							Elegir trabajo
						</Link>
					</div>
				</section>
			</AppShell>
		);
	}

	if (trabajoId) {
		const trabajo = await getTrabajoDocumentById(trabajoId);

		if (!trabajo) {
			return (
				<AppShell
					role="admin"
					title="Carta poder"
					description="No fue posible cargar el trabajo solicitado."
					email={user.email}
				>
					<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
						<p className="text-sm leading-7 text-[var(--muted)]">
							El trabajo solicitado no existe o ya no está disponible.
						</p>
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="mt-5 inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Elegir otro trabajo
						</Link>
					</section>
				</AppShell>
			);
		}

		const previewClient = buildTrabajoPreviewSubject(trabajo, "carta-poder");

		return (
			<AppShell
				role="admin"
				title="Vista previa · Carta poder"
				description="Revisa el documento autollenado desde el trabajo y descárgalo o imprímelo cuando esté correcto."
				email={user.email}
			>
				<div className="space-y-4">
					<div className="flex flex-wrap gap-3 print:hidden">
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
						>
							Cambiar trabajo
						</Link>
						<PrintButton />
					</div>

					<CartaPoderPreview client={previewClient} />
				</div>
			</AppShell>
		);
	}

	if (!clientId) {
		return (
			<AppShell
				role="admin"
				title="Carta poder"
				description="Selecciona primero un cliente para generar la vista previa del documento."
				email={user.email}
			>
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
					<div className="flex flex-wrap gap-3">
						<Link
							href="/admin/documents/carta-poder"
							className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Elegir cliente
						</Link>
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
						>
							Elegir trabajo
						</Link>
					</div>
				</section>
			</AppShell>
		);
	}

	const client = await getClientById(clientId);
	const previewClient = buildClientPreviewSubject(client);

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
					<Link
						href="/admin/documents/trabajos?template=carta-poder"
						className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
					>
						Elegir trabajo
					</Link>
					<PrintButton />
				</div>

				<CartaPoderPreview client={previewClient} />
			</div>
		</AppShell>
	);
}
