export const quotationStatusOrder = ["draft", "sent", "accepted", "rejected"] as const;

export type QuotationStatus = (typeof quotationStatusOrder)[number];

export type QuotationStatusMeta = {
	label: string;
	kind: "pill" | "subtle";
	className: string;
	dotClassName?: string;
};

const quotationStatusMeta: Record<QuotationStatus, QuotationStatusMeta> = {
	draft: {
		label: "Borrador",
		kind: "subtle",
		className: "text-slate-600",
		dotClassName: "bg-slate-400",
	},
	sent: {
		label: "Enviada",
		kind: "subtle",
		className: "text-sky-700",
		dotClassName: "bg-sky-500/70",
	},
	accepted: {
		label: "Aceptada",
		kind: "pill",
		className: "bg-emerald-100 text-emerald-700",
	},
	rejected: {
		label: "Rechazada",
		kind: "pill",
		className: "bg-rose-100 text-rose-700",
	},
};

function formatFallbackStatus(status: string): string {
	const trimmed = status.trim();

	if (!trimmed) {
		return "Sin estado";
	}

	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function getQuotationStatusMeta(status: string): QuotationStatusMeta {
	if (status in quotationStatusMeta) {
		return quotationStatusMeta[status as QuotationStatus];
	}

	return {
		label: formatFallbackStatus(status),
		kind: "subtle",
		className: "text-slate-600",
		dotClassName: "bg-slate-400",
	};
}

export function QuotationStatusBadge({
	status,
	className = "",
}: {
	status: string;
	className?: string;
}) {
	const meta = getQuotationStatusMeta(status);

	if (meta.kind === "pill") {
		return (
			<span
				className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${meta.className} ${className}`}
			>
				{meta.label}
			</span>
		);
	}

	return (
		<span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.className} ${className}`}>
			<span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
			{meta.label}
		</span>
	);
}

export function getQuotationStatusSummary(quotations: Array<{ status: string }>) {
	const counts = quotationStatusOrder.reduce(
		(acc, status) => ({
			...acc,
			[status]: 0,
		}),
		{} as Record<QuotationStatus, number>,
	);

	for (const quotation of quotations) {
		if (quotation.status in counts) {
			counts[quotation.status as QuotationStatus] += 1;
		}
	}

	return quotationStatusOrder.map((status) => ({
		status,
		label: quotationStatusMeta[status].label,
		count: counts[status],
	}));
}
