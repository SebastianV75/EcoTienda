import { cloneElement, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "quiet";
	size?: "sm" | "md" | "lg";
	asChild?: boolean;
};

const variants = {
	primary:
		"bg-[var(--brand)] text-white shadow-[0_14px_30px_rgba(47,179,20,0.22)] hover:bg-[var(--brand-strong)] hover:shadow-[0_18px_36px_rgba(47,179,20,0.28)]",
	secondary:
		"border border-[var(--border-soft)] bg-white text-[var(--brand-deep)] shadow-[var(--shadow-secondary)] hover:border-[rgba(13,79,46,0.18)] hover:bg-[var(--surface-strong)] hover:shadow-[var(--shadow-secondary-hover)]",
	quiet:
		"text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--brand-deep)]",
};

const sizes = {
	sm: "min-h-9 px-3 text-xs",
	md: "min-h-11 px-4 text-sm",
	lg: "min-h-12 px-5 text-sm",
};

export function Button({
	variant = "secondary",
	size = "md",
	className,
	asChild = false,
	children,
	...props
}: ButtonProps) {
	const composedClassName = cn(
		"inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[var(--tracking-action)] transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none",
		variants[variant],
		sizes[size],
		className,
	);

	if (asChild && isValidElement(children)) {
		const child = children as ReactElement<{ className?: string }>;
		return cloneElement(child, {
			className: cn(composedClassName, child.props.className),
		});
	}

	return (
		<button {...props} className={composedClassName}>
			{children}
		</button>
	);
}
