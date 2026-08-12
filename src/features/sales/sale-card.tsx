"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusFeedback } from "@/components/ui/status-feedback";
import { formatDisplayDate } from "@/lib/date-utils";
import type { SaleListItem } from "./data";
import {
	confirmSaleAction,
	markSaleAsLostAction,
	type SaleActionState,
} from "./actions";

type SaleCardProps = {
	sale: SaleListItem;
};

function InfoRow({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string | null;
}) {
	if (!value) return null;
	return (
		<div className="flex items-start gap-2 text-sm">
			<span className="mt-0.5 text-[var(--muted)]/70">{icon}</span>
			<div className="min-w-0 flex-1">
				<span className="block text-xs text-[var(--muted)]">{label}</span>
				<span className="block truncate font-medium text-[var(--foreground)]">
					{value}
				</span>
			</div>
		</div>
	);
}

export function SaleCard({ sale }: SaleCardProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [state, setState] = useState<SaleActionState>({
		error: null,
		success: null,
	});

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-MX", {
			style: "currency",
			currency: "MXN",
		}).format(amount);
	};

	const handleConfirmSale = () => {
		startTransition(async () => {
			const formData = new FormData();
			formData.append("trabajo_id", sale.trabajo_id);
			formData.append("quotation_id", sale.quotation_id ?? "");
			formData.append(
				"confirmed_on",
				sale.confirmed_on || new Date().toISOString().split("T")[0],
			);
			formData.append("agreed_amount", sale.quotation_amount.toString());
			formData.append("notes", "Venta confirmada desde el panel de ventas");

			const result = await confirmSaleAction(
				{ error: null, success: null },
				formData,
			);
			setState(result);

			if (!result.error) {
				router.refresh();
			}
		});
	};

	const handleMarkAsLost = () => {
		if (!confirm("¿Estás seguro de marcar esta venta como no realizada?")) {
			return;
		}

		startTransition(async () => {
			const formData = new FormData();
			formData.append("trabajo_id", sale.trabajo_id);

			const result = await markSaleAsLostAction(
				{ error: null, success: null },
				formData,
			);
			setState(result);

			if (!result.error) {
				router.refresh();
			}
		});
	};

	return (
		<Card className="p-5">
			<div className="flex flex-col gap-4">
				{/* Header */}
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-lg font-semibold text-[var(--brand-deep)]">
							{sale.client_name}
						</h3>
						{sale.quotation_number && sale.quotation_id && (
							<Link
								href={`/admin/quotations/${sale.quotation_id}`}
								className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
							>
								<svg
									className="h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								{sale.quotation_number}
							</Link>
						)}
					</div>
					{sale.completed && (
						<Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
							<svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							Completada
						</Badge>
					)}
				</div>

				{/* Info grid */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<InfoRow
						icon={
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						}
						label="Dirección"
						value={sale.intake_address_text}
					/>
					<InfoRow
						icon={
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
								/>
							</svg>
						}
						label="Teléfono"
						value={sale.intake_phone}
					/>
					<InfoRow
						icon={
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						}
						label="Tipo de trabajo"
						value={sale.work_type}
					/>
					<InfoRow
						icon={
							<svg
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						}
						label="Monto acordado"
						value={formatCurrency(sale.quotation_amount)}
					/>
				</div>

				{/* Confirmation date */}
				{sale.confirmed_on && (
					<div className="flex items-center gap-2 text-sm text-[var(--muted)]">
						<svg
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span>
							Confirmada:{" "}
							{formatDisplayDate(sale.confirmed_on, { month: "short" })}
						</span>
					</div>
				)}

				{/* Action buttons */}
				{!sale.completed ? (
					<div className="flex flex-col gap-2 sm:flex-row">
						<ActionButton
							type="button"
							onClick={handleConfirmSale}
							disabled={isPending}
							pendingLabel="Procesando…"
							className="ui-primary-action flex-1 justify-center"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							{isPending ? "Procesando..." : "Venta realizada"}
						</ActionButton>
						<ActionButton
							type="button"
							onClick={handleMarkAsLost}
							disabled={isPending}
							pendingLabel="Procesando…"
							className="ui-secondary-action flex-1 justify-center"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							{isPending ? "Procesando..." : "Venta no realizada"}
						</ActionButton>
					</div>
				) : (
					<StatusFeedback
						variant="success"
						className="flex items-center justify-center gap-2"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Venta confirmada - Listo para descargables
					</StatusFeedback>
				)}

				{/* Messages */}
				{state.error && (
					<StatusFeedback variant="warning">{state.error}</StatusFeedback>
				)}
				{state.success && (
					<StatusFeedback variant="success">{state.success}</StatusFeedback>
				)}
			</div>
		</Card>
	);
}
