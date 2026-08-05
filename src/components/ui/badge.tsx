import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			{...props}
			className={cn(
				"inline-flex items-center rounded-full border border-[rgba(13,79,46,0.12)] bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-deep)]",
				className,
			)}
		/>
	);
}
