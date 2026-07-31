import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			aria-hidden="true"
			{...props}
			className={cn(
				"animate-pulse rounded-[18px] bg-[rgba(13,79,46,0.08)] motion-reduce:animate-none",
				className,
			)}
		/>
	);
}

export function Spinner({ className }: { className?: string }) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none",
				className,
			)}
		/>
	);
}

type AlertProps = {
	children: ReactNode;
	variant?: "error" | "warning";
	className?: string;
};

export function Alert({ children, variant = "error", className }: AlertProps) {
	return (
		<div
			role="alert"
			className={cn(
				"rounded-[20px] border px-4 py-3.5 text-sm leading-6",
				variant === "error"
					? "border-rose-200 bg-rose-50 text-rose-800"
					: "border-amber-200 bg-amber-50 text-amber-900",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function ErrorState({
	children,
	action,
	className,
}: {
	children: ReactNode;
	action?: ReactNode;
	className?: string;
}) {
	return (
		<Alert className={cn("p-5", className)}>
			{children}
			{action ? <div className="mt-4">{action}</div> : null}
		</Alert>
	);
}

export function AsyncState({
	loading,
	error,
	children,
}: {
	loading?: ReactNode;
	error?: ReactNode;
	children: ReactNode;
}) {
	if (error) return <ErrorState>{error}</ErrorState>;
	return loading ? <>{loading}</> : <>{children}</>;
}
