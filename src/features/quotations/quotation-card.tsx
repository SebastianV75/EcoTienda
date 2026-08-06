"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, startTransition } from "react";
import { Card } from "@/components/ui/card";
import { deleteQuotationAction, confirmQuotationAction } from "./actions";
import type { QuotationListItem } from "./data";
import { QuotationStatusBadge } from "./quotation-status";
import { formatDisplayDate } from "@/lib/date-utils";

type QuotationCardProps = {
	quotation: QuotationListItem;
};

function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("es-MX", {
		style: "currency",
		currency: "MXN",
		minimumFractionDigits: 2,
	}).format(amount);
}

const DotsIcon = () => (
	<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
		<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
	</svg>
);

const EditIcon = () => (
	<svg
		className="h-4 w-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M15 5l3.5 3.5m-2-5a2.5 2.5 0 113.5 3.5L6.5 21H3v-3.5L16 3.7z"
		/>
	</svg>
);

const DeleteIcon = () => (
	<svg
		className="h-4 w-4"
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 7l-.9 12A2 2 0 0116 21H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
		/>
	</svg>
);

export function QuotationCard({ quotation }: QuotationCardProps) {
	const router = useRouter();
	const createdDate = formatDisplayDate(quotation.created_at);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const dropdownRef = useRef<HTMLDivElement>(null);

	const [deleteState, deleteAction, isDeletingAction] = useActionState(
		deleteQuotationAction,
		{ error: null, success: false },
	);

	const [confirmState, confirmAction, isConfirmingAction] = useActionState(
		confirmQuotationAction,
		{ error: null, success: false },
	);

	const isDeleted = deleteState.success;
	const isConfirmed = confirmState.success;

	useEffect(() => {
		if (confirmState.success) {
			router.refresh();
		}
	}, [confirmState.success, router]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsDropdownOpen(false);
			}
		}

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isDropdownOpen]);

	function handleDelete() {
		if (
			!window.confirm(
				"¿Eliminar esta cotización? Esta acción también elimina sus productos y no se puede deshacer.",
			)
		) {
			return;
		}

		setIsDropdownOpen(false);
		startTransition(() => {
			deleteAction(quotation.id);
		});
	}

	function handleConfirmQuotation() {
		const formData = new FormData();
		formData.append("quotation_id", quotation.id);
		formData.append("trabajo_id", quotation.trabajo_id || "");

		startTransition(() => {
			confirmAction(formData);
		});
	}

	return (
		<>
			{!isDeleted && !isConfirmed && (
				<div className="relative motion-safe:transition-opacity motion-reduce:transition-none">
					<Card className="group relative p-5">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								<p className="text-xs font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
									Cotización
								</p>
								<h3 className="mt-2 truncate text-xl font-semibold tracking-display text-[var(--brand-deep)]">
									{quotation.quotation_number ?? "Sin número"}
								</h3>
								<p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
									{quotation.supplier_name}
									{quotation.project ? ` · ${quotation.project}` : ""}
								</p>
							</div>
							<div className="flex items-start gap-2">
								<QuotationStatusBadge
									status={quotation.status}
									className="mt-1"
								/>
								<div className="relative" ref={dropdownRef}>
									<button
										type="button"
										onClick={() => setIsDropdownOpen(!isDropdownOpen)}
										className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 ease-out hover:border-emerald-200 hover:text-[var(--brand-deep)]"
										aria-label="Opciones de cotización"
										aria-expanded={isDropdownOpen}
									>
										<DotsIcon />
									</button>
									{isDropdownOpen && (
										<div
											role="menu"
											className="absolute right-0 z-50 mt-2 w-44 rounded-[14px] border border-[var(--border-soft)] bg-white py-1 shadow-lg"
										>
											<Link
												href={`/admin/quotations/${quotation.id}/edit`}
												role="menuitem"
												className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--brand-deep)] hover:bg-emerald-50"
												onClick={() => setIsDropdownOpen(false)}
											>
												<EditIcon />
												Editar
											</Link>
											<hr className="my-1 border-[var(--border-soft)]" />
											<button
												type="button"
												onClick={handleDelete}
												disabled={isDeletingAction}
												role="menuitem"
												className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
											>
												<DeleteIcon />
												Eliminar
											</button>
										</div>
									)}
								</div>
							</div>
						</div>

						<dl className="mt-4 grid gap-3 border-t border-[var(--border-soft)] pt-4 sm:grid-cols-2">
							<div className="min-w-0">
								<dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
									Total
								</dt>
								<dd className="mt-1 text-lg font-semibold tracking-display text-[var(--brand-deep)]">
									{formatCurrency(quotation.total)}
								</dd>
							</div>
							<div className="min-w-0">
								<dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
									Fecha
								</dt>
								<dd className="mt-1 text-sm text-[var(--foreground)]">
									{createdDate}
								</dd>
							</div>
							{quotation.trabajo_id ? (
								<div className="sm:col-span-2">
									<dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
										Trabajo vinculado
									</dt>
									<dd className="mt-1">
										<Link
											href={`/agenda/${quotation.trabajo_id}`}
											className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
										>
											Abrir trabajo vinculado
										</Link>
									</dd>
								</div>
							) : null}
						</dl>

						<div className="mt-5 flex flex-wrap gap-2">
							<Link
								href={`/admin/quotations/${quotation.id}`}
								className="ui-secondary-action"
							>
								Ver detalles
							</Link>
							{quotation.pdf_url && (
								<a
									href={`/api/quotations/${quotation.id}/pdf`}
									className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
								>
									Descargar PDF
								</a>
							)}
							{quotation.trabajo_id && (
								<button
									type="button"
									onClick={handleConfirmQuotation}
									disabled={isConfirmingAction}
									className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(22,163,74,0.22)] transition duration-200 ease-out hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isConfirmingAction ? (
										<>
											<svg
												className="h-4 w-4 animate-spin"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												/>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												/>
											</svg>
											Confirmando...
										</>
									) : (
										<>
											<svg
												className="h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
											Confirmar cotización
										</>
									)}
								</button>
							)}
						</div>

						{confirmState.error && (
							<p
								role="alert"
								className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
							>
								{confirmState.error}
							</p>
						)}
						{deleteState.error && (
							<p
								role="alert"
								className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
							>
								{deleteState.error}
							</p>
						)}
					</Card>
				</div>
			)}
		</>
	);
}
