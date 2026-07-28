import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";

type DocumentsPreviewEmptyStateProps = {
	eyebrow: string;
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
};

export function DocumentsPreviewEmptyState({
	eyebrow,
	title,
	description,
	action,
	className,
}: DocumentsPreviewEmptyStateProps) {
	return (
		<EmptyState
			eyebrow={eyebrow}
			title={title}
			description={description}
			action={action}
			className={className}
		/>
	);
}
