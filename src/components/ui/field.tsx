import { cloneElement, isValidElement } from "react";
import type {
	InputHTMLAttributes,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
	ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const controlClassName =
	"w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition-[border-color,background-color,box-shadow,opacity] duration-200 ease-out placeholder:text-[var(--muted)]/70 focus:border-emerald-300 focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-wait disabled:opacity-75 motion-reduce:transition-none";

export function Input({
	className,
	type,
	...props
}: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			type={type}
			className={cn(
				type === "hidden" || type === "checkbox" ? undefined : controlClassName,
				className,
			)}
		/>
	);
}

export function Select({
	className,
	...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select {...props} className={cn(controlClassName, className)} />;
}

export function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			{...props}
			className={cn(controlClassName, "min-h-24 resize-y", className)}
		/>
	);
}

type FieldProps = {
	label: ReactNode;
	htmlFor: string;
	hint?: ReactNode;
	children: ReactNode;
	className?: string;
};

export function Field({
	label,
	htmlFor,
	hint,
	children,
	className,
}: FieldProps) {
	const hintId = hint ? `${htmlFor}-hint` : undefined;
	return (
		<div className={cn("space-y-2.5", className)}>
			<label
				htmlFor={htmlFor}
				className="text-sm font-medium text-[var(--brand-deep)]"
			>
				{label}
			</label>
			{hint && isValidElement(children)
				? cloneElement(children, {
						"aria-describedby": hintId,
					} as { "aria-describedby": string })
				: children}
			{hint ? (
				<p id={hintId} className="text-xs leading-5 text-[var(--muted)]">
					{hint}
				</p>
			) : null}
		</div>
	);
}

export { controlClassName };
