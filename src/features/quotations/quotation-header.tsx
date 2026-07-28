"use client";

import { DatePicker } from "./date-picker";

type QuotationHeaderProps = {
	quotationNumber?: string | null;
	status?: string | null;
	orderDeadline?: string | null;
	project?: string | null;
	isEditing?: boolean;
	onFieldChange?: () => void;
};

export function QuotationHeader({
	quotationNumber,
	status,
	orderDeadline,
	project,
	isEditing,
	onFieldChange,
}: QuotationHeaderProps) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
			<div className="space-y-5">
				<div className="space-y-2.5">
					<label htmlFor="project" className="text-sm font-medium text-[var(--brand-deep)]">
						Cliente
					</label>
					{project ? (
						<input
							id="project"
							name="project"
							type="text"
							readOnly
							value={project}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-3 text-[var(--foreground)] outline-none"
						/>
					) : (
						<input
							id="project"
							name="project"
							type="text"
							defaultValue=""
							required
							placeholder="Nombre del cliente"
							onChange={onFieldChange}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						/>
					)}
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
							defaultValue={status ?? "draft"}
							onChange={onFieldChange}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						>
							<option value="draft">Borrador</option>
							<option value="sent">Enviada</option>
							<option value="accepted">Aceptada</option>
							<option value="rejected">Rechazada</option>
						</select>
					</div>

					<div className="space-y-2.5">
						<label
							htmlFor="order_deadline_display"
							className="text-sm font-medium text-[var(--brand-deep)]"
						>
							Cotización válida hasta
						</label>
						<DatePicker
							id="order_deadline_display"
							name="order_deadline"
							value={orderDeadline}
							onChange={onFieldChange}
							placeholder="Seleccionar fecha"
						/>
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
