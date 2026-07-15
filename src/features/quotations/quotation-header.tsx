"use client";

import type { ClientRecord } from "@/types/client";

type QuotationHeaderProps = {
	clients: ClientRecord[];
	quotationNumber?: string | null;
	status?: string | null;
	orderDeadline?: string | null;
	expectedDelivery?: string | null;
	isEditing?: boolean;
};

export function QuotationHeader({
	clients,
	quotationNumber,
	status,
	orderDeadline,
	expectedDelivery,
	isEditing,
}: QuotationHeaderProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
			<div className="space-y-5">
				<div className="space-y-2.5">
					<label
						htmlFor="project"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Cliente
					</label>
					<select
						id="project"
						name="project"
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						<option value="">Selecciona un cliente</option>
						{clients.map((client) => (
							<option key={client.id} value={client.full_name}>
								{client.full_name}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-5">
					<div className="space-y-2.5">
						<label
							htmlFor="status"
							className="text-sm font-medium text-[var(--brand-deep)]"
						>
							Estado
						</label>
						<select
							id="status"
							name="status"
							defaultValue={status ?? ""}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						>
							<option value="">Selecciona un estado</option>
							<option value="draft">Borrador</option>
							<option value="sent">Enviada</option>
							<option value="accepted">Aceptada</option>
							<option value="rejected">Rechazada</option>
						</select>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2.5">
							<label
								htmlFor="order_deadline"
								className="text-sm font-medium text-[var(--brand-deep)]"
							>
								Cotización válida hasta
							</label>
							<input
								id="order_deadline"
								name="order_deadline"
								type="date"
								defaultValue={orderDeadline ?? ""}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
							/>
						</div>
						<div className="space-y-2.5">
							<label
								htmlFor="expected_delivery"
								className="text-sm font-medium text-[var(--brand-deep)]"
							>
								Fecha de entrega
							</label>
							<input
								id="expected_delivery"
								name="expected_delivery"
								type="date"
								defaultValue={expectedDelivery ?? ""}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
							/>
						</div>
					</div>

					{isEditing && quotationNumber && (
						<div className="space-y-2.5">
							<label
								htmlFor="quotation_number"
								className="text-sm font-medium text-[var(--brand-deep)]"
							>
								Número de cotización
							</label>
							<input
								id="quotation_number"
								name="quotation_number"
								type="text"
								readOnly
								value={quotationNumber}
								className="w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--foreground)] outline-none"
							/>
							<p className="text-xs text-[var(--muted)]">
								Al guardar se agregar&aacute; &ldquo;(editado)&rdquo; si no lo tiene.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
