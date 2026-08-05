"use client";

import { useActionState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { confirmQuotationAction } from "@/features/quotations/actions";

const initialState = { error: null, success: false };

type ConfirmQuotationButtonProps = {
	quotationId: string;
	trabajoId: string;
};

export function ConfirmQuotationButton({
	quotationId,
	trabajoId,
}: ConfirmQuotationButtonProps) {
	const [state, formAction] = useActionState(
		confirmQuotationAction,
		initialState,
	);

	return (
		<div className="space-y-2">
			<form action={formAction}>
				<input type="hidden" name="quotation_id" value={quotationId} />
				<input type="hidden" name="trabajo_id" value={trabajoId} />
				<input type="hidden" name="return_to" value="trabajo" />
				<ActionButton
					type="submit"
					pendingLabel="Confirmando..."
					className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_28px_rgba(47,179,20,0.2)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
				>
					Confirmar cotización y pasar a Venta
				</ActionButton>
			</form>

			{state.error ? (
				<p className="text-sm text-rose-700">{state.error}</p>
			) : null}
		</div>
	);
}
