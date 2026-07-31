"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTrabajoAction } from "@/features/trabajos/actions";

type DeleteTrabajoButtonProps = {
	trabajoId: string;
};

export function DeleteTrabajoButton({ trabajoId }: DeleteTrabajoButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = () => {
		startTransition(async () => {
			const result = await deleteTrabajoAction({ error: null, success: false }, trabajoId);
			if (result.error) {
				setError(result.error);
				setShowConfirm(false);
			} else {
				// Cerrar modal y navegar a la lista. El listener de realtime se
				// encargará de refrescar la lista cuando el DELETE se propague.
				setShowConfirm(false);
				router.replace("/admin/trabajos");
				router.refresh();
			}
		});
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setShowConfirm(true)}
				disabled={isPending}
				className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition duration-200 ease-out hover:bg-red-50 disabled:opacity-50"
			>
				{isPending ? "Eliminando..." : "Eliminar trabajo"}
			</button>

			{showConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
					<div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
						<h3 className="text-lg font-semibold text-gray-900">
							¿Eliminar trabajo?
						</h3>
						<p className="mt-2 text-sm text-gray-600">
							Esta acción eliminará permanentemente el trabajo y todos sus datos asociados:
						</p>
						<ul className="mt-2 list-inside list-disc text-sm text-gray-600">
							<li>Cotizaciones y sus items</li>
							<li>Datos de visita técnica</li>
							<li>Datos de agenda</li>
							<li>Archivos multimedia</li>
							<li>Información de venta</li>
						</ul>
						<p className="mt-3 text-sm font-medium text-red-600">
							Esta acción no se puede deshacer.
						</p>

						{error && (
							<p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
								{error}
							</p>
						)}

						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() => {
									setShowConfirm(false);
									setError(null);
								}}
								disabled={isPending}
								className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition duration-200 ease-out hover:bg-gray-50 disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={handleDelete}
								disabled={isPending}
								className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition duration-200 ease-out hover:bg-red-700 disabled:opacity-50"
							>
								{isPending ? "Eliminando..." : "Sí, eliminar"}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
