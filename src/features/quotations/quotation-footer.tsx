type QuotationFooterProps = {
	subtotal: number;
	total: number;
};

export function QuotationFooter({ subtotal, total }: QuotationFooterProps) {
	return (
		<section className="grid gap-6 lg:grid-cols-2">
			<div className="space-y-2.5">
				<label
					htmlFor="terms_and_conditions"
					className="text-sm font-medium text-[var(--brand-deep)]"
				>
					Términos y condiciones
				</label>
				<textarea
					id="terms_and_conditions"
					name="terms_and_conditions"
					rows={6}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					placeholder="Defina sus términos y condiciones..."
				/>
			</div>

			<div className="flex items-end lg:justify-end">
				<div className="w-full space-y-4 rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm lg:max-w-sm">
					<div className="flex items-center justify-between">
						<span className="text-sm text-[var(--muted)]">Subtotal</span>
						<span className="text-lg font-medium text-[var(--brand-deep)]">
							$ {subtotal.toFixed(2)}
						</span>
					</div>
					<div className="border-t border-[var(--border-soft)] pt-4">
						<div className="flex items-center justify-between">
							<span className="text-base font-semibold text-[var(--brand-deep)]">
								Total
							</span>
							<span className="text-2xl font-bold text-[var(--brand-deep)]">
								$ {total.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
