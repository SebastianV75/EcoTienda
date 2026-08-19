import { Card } from "@/components/ui/card";
import { workerRoleLabels, type WorkerRecord } from "@/types/worker";
import { WorkerActionsMenu } from "@/features/workers/worker-actions-menu";

type WorkerCardProps = {
	worker: WorkerRecord;
};

export function WorkerCard({ worker }: WorkerCardProps) {
	return (
					<Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-[0_8px_24px_rgba(15,57,35,0.05)] transition-shadow duration-200 hover:shadow-[0_12px_30px_rgba(15,57,35,0.08)] sm:p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
							Trabajador
						</p>
						<h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] sm:text-2xl">
							{worker.full_name}
						</h3>
						<p className="mt-1 truncate text-sm text-[var(--muted)]">
							{workerRoleLabels[worker.role]} · {worker.email ?? "Sin correo"}
						</p>
					</div>
					<WorkerActionsMenu workerId={worker.id} workerName={worker.full_name} />
				</div>

				<dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
					<div>
						<dt className="text-xs text-[var(--muted)]">Estado</dt>
						<dd className="mt-0.5 font-medium text-[var(--brand-deep)]">
							{worker.active ? "Activo" : "Inactivo"}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-[var(--muted)]">Acceso</dt>
						<dd className="mt-0.5 font-medium text-[var(--brand-deep)]">
							{worker.accessStatus === "linked"
								? "Vinculado"
								: worker.accessStatus === "pending"
									? "Pendiente"
									: worker.accessStatus === "unknown"
										? "Sin verificar"
										: "Sin acceso"}
						</dd>
					</div>
					{worker.accessStatus === "unknown" ? (
						<div className="col-span-2 rounded-[12px] bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800">
							No se pudo consultar Supabase Auth. El vínculo puede existir; revisa antes
							de crear o modificar accesos.
						</div>
					) : null}
					{worker.phone ? (
						<div className="col-span-2">
							<dt className="text-xs text-[var(--muted)]">Teléfono</dt>
							<dd className="mt-0.5 text-[var(--brand-deep)]">{worker.phone}</dd>
						</div>
					) : null}
				</dl>
			</Card>
	);
}
