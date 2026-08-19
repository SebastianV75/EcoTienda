"use client";

import Link from "next/link";

import { WorkerDeleteButton } from "@/features/workers/worker-delete-button";

export function WorkerActionsMenu({
	workerId,
	workerName,
}: {
	workerId: string;
	workerName: string;
}) {
	return (
		<details className="relative shrink-0">
			<summary
				aria-label={`Acciones de ${workerName}`}
				className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-2xl leading-none text-[var(--muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--brand-deep)] [&::-webkit-details-marker]:hidden"
			>
				<span aria-hidden="true" className="-mt-1">⋮</span>
			</summary>
			<div className="absolute right-0 top-11 z-20 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_32px_rgba(15,57,35,0.14)]">
				<Link
					href={`/admin/workers/${workerId}/edit`}
					className="block rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--brand-deep)] transition hover:bg-[var(--surface-strong)]"
				>
					Editar
				</Link>
				<WorkerDeleteButton workerId={workerId} menuItem />
			</div>
		</details>
	);
}
