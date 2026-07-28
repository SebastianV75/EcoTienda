"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SaleListItem } from "./data";
import { confirmSaleAction, type ConfirmSaleState } from "./actions";

type SaleCardProps = {
	sale: SaleListItem;
};

export function SaleCard({ sale }: SaleCardProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [state, setState] = useState<ConfirmSaleState>({ error: null, success: null });

	const handleConfirmSale = () => {
		startTransition(async () => {
			const formData = new FormData();
			formData.append("trabajo_id", sale.trabajo_id);
			formData.append("quotation_trabajo_id", sale.trabajo_id);
			formData.append("confirmed_on", sale.confirmed_on || new Date().toISOString().split("T")[0]);
			formData.append("agreed_amount", sale.quotation_amount.toString());
			formData.append("notes", "Venta confirmada desde el panel de ventas");

			const result = await confirmSaleAction({ error: null, success: null }, formData);
			setState(result);

			if (!result.error) {
				router.refresh();
			}
		});
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-MX", {
			style: "currency",
			currency: "MXN",
		}).format(amount);
	};

	return (
		<article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
			<div className="flex flex-col gap-4">
				{/* Encabezado */}
				<div>
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900">
								{sale.client_name}
							</h3>
							<p className="mt-1 text-sm text-gray-600">
								Trabajo: {sale.trabajo_id.slice(0, 8)}...
							</p>
						</div>
						{sale.completed && (
							<span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
								<svg
									className="mr-1 h-3 w-3"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
								Completada
							</span>
						)}
					</div>
				</div>

				{/* Monto */}
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
							d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span className="font-semibold text-gray-900">
						{formatCurrency(sale.quotation_amount)}
					</span>
				</div>

				{/* Fecha de confirmación */}
				{sale.confirmed_on && (
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
							Confirmada:{" "}
							{new Date(sale.confirmed_on).toLocaleDateString("es-MX", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						</span>
					</div>
				)}

				{/* Acción */}
				{!sale.completed ? (
					<button
						onClick={handleConfirmSale}
						disabled={isPending}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
						{isPending ? "Confirmando..." : "Confirmar venta"}
					</button>
				) : (
					<div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Venta confirmada - Avanzar a descargables
					</div>
				)}

				{/* Mensajes de error/éxito */}
				{state.error && (
					<p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{state.error}
					</p>
				)}
				{state.success && (
					<p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
						{state.success}
					</p>
				)}
			</div>
		</article>
	);
}
