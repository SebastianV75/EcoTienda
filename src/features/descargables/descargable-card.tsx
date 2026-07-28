import Link from "next/link";
import type { DescargableItem } from "./data";

type DescargableCardProps = {
	item: DescargableItem;
};

export function DescargableCard({ item }: DescargableCardProps) {
	return (
		<article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
			<div className="flex flex-col gap-4">
				{/* Encabezado */}
				<div>
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900">
								{item.client_name}
							</h3>
							<p className="mt-1 text-sm text-gray-600">
								Trabajo: {item.id.slice(0, 8)}...
							</p>
						</div>
						<span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
							Finalizado
						</span>
					</div>
				</div>

				{/* Fecha de finalización */}
				{item.completed_at && (
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<svg
							className="h-4 w-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span>
							Completado:{" "}
							{new Date(item.completed_at).toLocaleDateString("es-MX", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						</span>
					</div>
				)}

				{/* Acción */}
				<Link
					href={`/admin/trabajos/${item.id}`}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-gray-700 active:scale-[0.98]"
				>
					<svg
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
						/>
					</svg>
					Ver y descargar archivos
				</Link>
			</div>
		</article>
	);
}
