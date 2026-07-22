import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/features/auth/session";
import { getTrabajoVisitaById } from "@/features/trabajos/data";
import { VisitaMinisplitForm } from "@/features/trabajos/visita-minisplit-form";

export default async function VisitaMinisplitPage({
	params,
}: {
	params: Promise<{ trabajoId: string }>;
}) {
	const user = await requireRole(["admin"]);
	const { trabajoId } = await params;
	const work = await getTrabajoVisitaById(trabajoId);

	if (!work) {
		notFound();
	}

	return (
		<AppShell
			role="admin"
			title={work.agenda?.contact_name || work.intake_name}
			description="Visita Técnica Minisplit"
			email={user.email}
		>
			<div className="space-y-4">
				<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0">
							<h1 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--brand-deep)] sm:text-[1.9rem]">
								Visita Técnica Minisplit
							</h1>
							<p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
								Completa el formulario de visita técnica para minisplit.
							</p>
						</div>

						<Link
							href={`/admin/visits/${trabajoId}`}
							className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(13,79,46,0.18)] hover:bg-[rgba(239,246,239,0.96)] hover:shadow-[0_8px_20px_rgba(10,44,21,0.05)] active:scale-[0.96]"
						>
							Volver al hub
						</Link>
					</div>
				</section>

				<section className="rounded-[24px] border border-[var(--border-soft)] bg-white p-5 shadow-sm sm:p-6">
					<VisitaMinisplitForm trabajoId={trabajoId} />
				</section>
			</div>
		</AppShell>
	);
}
