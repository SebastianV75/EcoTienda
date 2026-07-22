import Link from "next/link";

import { workerRoleLabels, type WorkerRecord } from "@/types/worker";

type WorkerCardProps = {
	worker: WorkerRecord;
};

export function WorkerCard({ worker }: WorkerCardProps) {
	return (
		<article className="rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)]">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
						Trabajador
					</p>
					<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
						{worker.full_name}
					</h3>
				</div>

				<div className="flex flex-wrap gap-2">
					<span className="rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--brand-deep)]">
						{workerRoleLabels[worker.role]}
					</span>
					<span
						className={`rounded-full px-3 py-1 text-xs font-medium ${worker.active ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-slate-200 bg-slate-50 text-slate-700"}`}
					>
						{worker.active ? "Activo" : "Inactivo"}
					</span>
				</div>
			</div>

			<dl className="mt-4 space-y-3 text-sm text-[var(--muted)]">
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">Teléfono</dt>
					<dd>{worker.phone ?? "Sin teléfono"}</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">Vínculo de auth</dt>
					<dd className="break-all font-mono text-xs text-[var(--muted)]">
						{worker.auth_user_id ?? "Sin vínculo"}
					</dd>
				</div>
			</dl>

			<div className="mt-5">
				<Link
					href={`/admin/workers/${worker.id}/edit`}
					className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200 hover:bg-white"
				>
					Editar
				</Link>
			</div>
		</article>
	);
}
