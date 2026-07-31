"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	pendingLabel?: string;
	children: ReactNode;
};

export function ActionButton({
	children,
	pendingLabel = "Procesando…",
	className,
	disabled,
	...props
}: ActionButtonProps) {
	const { pending } = useFormStatus();
	const isPending = pending || disabled;

	return (
		<button
			{...props}
			disabled={isPending}
			aria-disabled={isPending || undefined}
			className={cn("relative", className)}
		>
			<span className={isPending ? "invisible" : undefined}>{children}</span>
			{isPending ? (
				<span
					className="absolute inset-0 inline-flex items-center justify-center gap-2"
					aria-hidden="true"
				>
					<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
					<span>{pendingLabel}</span>
				</span>
			) : null}
		</button>
	);
}
