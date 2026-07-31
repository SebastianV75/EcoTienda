import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusFeedbackProps = {
	children: ReactNode;
	variant?: "info" | "success" | "warning";
	className?: string;
};

const variantClasses = {
	info: "border-[var(--border-soft)] bg-[var(--surface-strong)] text-[var(--brand-deep)]",
	success: "border-emerald-200 bg-emerald-50 text-emerald-900",
	warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function StatusFeedback({
	children,
	variant = "info",
	className,
}: StatusFeedbackProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"rounded-[22px] border px-4 py-3 text-sm",
				variantClasses[variant],
				className,
			)}
		>
			{children}
		</div>
	);
}
