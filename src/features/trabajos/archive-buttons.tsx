"use client";

import { useActionState, useState } from "react";
import { ArchiveBox, ArrowRotate, Check } from "reicon-react";

import {
	archiveTrabajoAction,
	restoreTrabajoAction,
	type TrabajoArchiveActionState,
} from "./archive-actions";

const initialState: TrabajoArchiveActionState = { error: null, success: null };

export function ArchiveTrabajoButton({ trabajoId }: { trabajoId: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const [state, formAction, isPending] = useActionState(
		archiveTrabajoAction,
		initialState,
	);

	return (
		<>
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-sm font-semibold text-amber-800 shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
				>
					<ArchiveBox size={18} weight="Outline" className="transition-transform duration-200 group-hover:-rotate-6" />
					<span>Archivar</span>
			</button>
			{isOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
						<form
							action={formAction}
							className="motion-safe:animate-[drawer-in_180ms_ease-out_both] w-full max-w-md rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-2xl"
					>
						<input type="hidden" name="trabajo_id" value={trabajoId} />
						<h2 className="text-lg font-semibold text-[var(--brand-deep)]">
							¿Archivar trabajo?
						</h2>
						<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
							Se ocultará de todos los módulos, pero sus datos y archivos se conservarán.
						</p>
						<label className="mt-4 block text-sm font-medium text-[var(--brand-deep)]">
							Motivo <span className="font-normal text-[var(--muted)]">(opcional)</span>
							<textarea
								name="archive_reason"
								rows={3}
								className="mt-2 w-full rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-emerald-300"
								placeholder="Ej. Cliente canceló el proyecto"
							/>
						</label>
						{state.error ? <p className="mt-3 text-sm text-rose-700">{state.error}</p> : null}
						{state.success ? <p className="mt-3 text-sm text-emerald-700">{state.success}</p> : null}
							<div className="mt-5 grid grid-cols-2 gap-3">
								<button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-medium" disabled={isPending}>
								Cancelar
							</button>
								<button type="submit" className="flex-1 rounded-full bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800 active:scale-[0.98] disabled:opacity-60" disabled={isPending}>
								{isPending ? "Archivando..." : "Archivar"}
							</button>
						</div>
					</form>
				</div>
			) : null}
		</>
	);
}

export function RestoreTrabajoButton({ trabajoId }: { trabajoId: string }) {
	const [state, formAction, isPending] = useActionState(
		restoreTrabajoAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-2">
			<input type="hidden" name="trabajo_id" value={trabajoId} />
			<button type="submit" disabled={isPending} className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-md active:translate-y-0 active:scale-[0.98] disabled:opacity-60 motion-reduce:transform-none">
				{isPending ? <ArrowRotate size={18} weight="Outline" className="animate-spin" /> : <Check size={18} weight="Outline" className="transition-transform duration-200 group-hover:scale-110" />}
				{isPending ? "Restaurando" : "Restaurar"}
			</button>
			{state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
			{state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
		</form>
	);
}
