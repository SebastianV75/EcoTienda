import Link from "next/link";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { DocumentsPreviewEmptyState } from "@/features/documents/preview-empty-states";

type TrabajoDocumentPreviewEmptyStateProps = {
	email: string;
	shellTitle: string;
	shellDescription: string;
	eyebrow: string;
	emptyTitle: string;
	emptyDescription: string;
	actionLabel: string;
	actionHref: string;
};

function PreviewActionLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
		>
			{children}
		</Link>
	);
}

export function TrabajoDocumentPreviewEmptyState({
	email,
	shellTitle,
	shellDescription,
	eyebrow,
	emptyTitle,
	emptyDescription,
	actionLabel,
	actionHref,
}: TrabajoDocumentPreviewEmptyStateProps) {
	return (
		<AppShell
			role="admin"
			title={shellTitle}
			description={shellDescription}
			email={email}
		>
			<DocumentsPreviewEmptyState
				eyebrow={eyebrow}
				title={emptyTitle}
				description={emptyDescription}
				action={
					<PreviewActionLink href={actionHref}>{actionLabel}</PreviewActionLink>
				}
			/>
		</AppShell>
	);
}
