import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { workerRoleLabels, type WorkerRecord } from "@/types/worker";

type WorkerCardProps = {
	worker: WorkerRecord;
};

export function WorkerCard({ worker }: WorkerCardProps) {
	return (
		<Card className="p-5">
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
					<Badge>{workerRoleLabels[worker.role]}</Badge>
					<Badge
						className={
							worker.active
								? "border-emerald-200 bg-emerald-50 text-emerald-800"
								: "border-slate-200 bg-slate-50 text-slate-700"
						}
					>
						{worker.active ? "Activo" : "Inactivo"}
					</Badge>
				</div>
			</div>

			<dl className="mt-4 space-y-3 text-sm text-[var(--muted)]">
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">Teléfono</dt>
					<dd>{worker.phone ?? "Sin teléfono"}</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">
						Vínculo de auth
					</dt>
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
		</Card>
	);
}
