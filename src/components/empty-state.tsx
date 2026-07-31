import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
	eyebrow: string;
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
};

export function EmptyState({
	eyebrow,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<Card
			className={`p-6 motion-reduce:transform-none ${className ?? ""}`.trim()}
		>
			<p className="text-[11px] font-semibold uppercase tracking-eyebrow text-[var(--brand-strong)]">
				{eyebrow}
			</p>
			<h3 className="mt-3 text-2xl font-semibold tracking-display text-[var(--brand-deep)]">
				{title}
			</h3>
			<p className="mt-3 text-sm leading-6 text-[var(--muted)]">
				{description}
			</p>
			{action ? (
				<div className="mt-5 flex flex-wrap gap-3">{action}</div>
			) : null}
		</Card>
	);
}
