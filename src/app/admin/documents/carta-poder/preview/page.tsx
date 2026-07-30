import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import {
	CartaPoderPreview,
	DEFAULT_POWER_ACCEPTOR,
	DEFAULT_WITNESS_ONE,
	DEFAULT_WITNESS_TWO,
} from "@/features/documents/carta-poder-preview";
import { DocumentsPreviewEmptyState } from "@/features/documents/preview-empty-states";
import { resolveTrabajoPreviewId } from "@/features/documents/preview-routing";
import { buildTrabajoPreviewSubject } from "@/features/documents/preview-data";
import { PrintButton } from "@/features/documents/print-button";
import { getTrabajoDocumentById } from "@/features/trabajos/data";

export default async function CartaPoderPreviewPage({
	searchParams,
}: {
	searchParams?: Promise<{
		trabajoId?: string;
		clientId?: string;
		powerAcceptorName?: string;
		witnessOneName?: string;
		witnessTwoName?: string;
	}>;
}) {
	const user = await requireRole(["admin"]);
	const params = searchParams ? await searchParams : undefined;
	const trabajoId = await resolveTrabajoPreviewId(params);
	const powerAcceptorName = params?.powerAcceptorName?.trim() ?? DEFAULT_POWER_ACCEPTOR;
	const witnessOneName = params?.witnessOneName?.trim() ?? DEFAULT_WITNESS_ONE;
	const witnessTwoName = params?.witnessTwoName?.trim() ?? DEFAULT_WITNESS_TWO;

	const signatureEditor = (
		<form method="get" className="rounded-card border border-[var(--border-soft)] bg-white p-4 print:hidden">
			{trabajoId ? <input type="hidden" name="trabajoId" value={trabajoId} /> : null}
			<div className="grid gap-3 md:grid-cols-3">
				<label className="space-y-2 text-sm text-[var(--muted)]">
					<span className="block font-medium text-[var(--brand-deep)]">Acepta el poder</span>
					<input
						name="powerAcceptorName"
						defaultValue={powerAcceptorName}
						placeholder="Nombre de quien acepta"
						className="w-full rounded-soft border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</label>
				<label className="space-y-2 text-sm text-[var(--muted)]">
					<span className="block font-medium text-[var(--brand-deep)]">Testigo 1</span>
					<input
						name="witnessOneName"
						defaultValue={witnessOneName}
						className="w-full rounded-soft border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</label>
				<label className="space-y-2 text-sm text-[var(--muted)]">
					<span className="block font-medium text-[var(--brand-deep)]">Testigo 2</span>
					<input
						name="witnessTwoName"
						defaultValue={witnessTwoName}
						className="w-full rounded-soft border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</label>
			</div>
			<div className="mt-4 flex flex-wrap gap-3">
				<button type="submit" className="ui-secondary-action">
					Actualizar firmas
				</button>
			</div>
		</form>
	);

	if (!trabajoId) {
		return (
			<AppShell
				role="admin"
				title="Carta poder"
				description="Selecciona un trabajo para generar la vista previa del documento."
				email={user.email}
			>
				<DocumentsPreviewEmptyState
					eyebrow="Trabajo no seleccionado"
					title="Selecciona un trabajo"
					description="Elige el trabajo desde el que quieres completar la vista previa de Carta poder."
					action={
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Elegir trabajo
						</Link>
					}
				/>
			</AppShell>
		);
	}

	const trabajo = await getTrabajoDocumentById(trabajoId);

	if (!trabajo) {
		return (
			<AppShell
				role="admin"
				title="Carta poder"
				description="No fue posible cargar el trabajo solicitado."
				email={user.email}
			>
				<DocumentsPreviewEmptyState
					eyebrow="Trabajo no disponible"
					title="No fue posible cargar el trabajo solicitado"
					description="El trabajo solicitado no existe o ya no está disponible."
					action={
						<Link
							href="/admin/documents/trabajos?template=carta-poder"
							className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							Elegir otro trabajo
						</Link>
					}
				/>
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

				{signatureEditor}
				<CartaPoderPreview
					client={previewClient}
					powerAcceptorName={powerAcceptorName}
					witnessOneName={witnessOneName}
					witnessTwoName={witnessTwoName}
				/>
			</div>
		</AppShell>
	);
}
