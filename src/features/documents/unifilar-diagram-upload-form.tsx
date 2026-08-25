import type { UnifilarDiagramResolution } from "./unifilar-diagrams";

export function UnifilarDiagramUploadForm({
	trabajoId,
	resolution,
	success,
	error,
}: {
	trabajoId: string;
	resolution: UnifilarDiagramResolution;
	success?: string;
	error?: string;
}) {
	return (
		<section className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-4 print:hidden">
			<div className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
					Diagrama unifilar
				</p>
				<p className="text-sm font-medium text-amber-950">
					{resolution.status === "manual-required"
						? "Este trabajo necesita un diagrama cargado manualmente."
						: "Puedes reemplazar el diagrama automático solo para este trabajo. "}
				</p>
				<p className="text-sm leading-6 text-amber-900/80">
					El archivo debe ser PNG. La carga manual no modifica la plantilla global.
				</p>
			</div>

			{success ? (
				<p className="mt-3 rounded-[14px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
					Diagrama manual asignado correctamente.
				</p>
			) : null}
			{error ? (
				<p className="mt-3 rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
					{error}
				</p>
			) : null}

			<form
				className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
				method="post"
				encType="multipart/form-data"
				action={`/api/admin/trabajos/${trabajoId}/diagrama-unifilar`}
			>
				<label className="min-w-0 flex-1 text-sm font-medium text-[var(--brand-deep)]">
					<span className="mb-2 block">Seleccionar PNG</span>
					<input
						type="file"
						name="diagram"
						accept="image/png"
						required
						className="block w-full rounded-[16px] border border-amber-200 bg-white px-3 py-2 text-sm"
					/>
				</label>
				<button type="submit" className="ui-primary-action shrink-0">
					Subir y asignar
				</button>
			</form>
		</section>
	);
}
