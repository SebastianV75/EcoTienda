"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";

export type DocumentTemplateSlug =
	| "carta-poder"
	| "ubicacion-cliente"
	| "diagrama-unifilar";

export type DocumentPreviewSelectorItem = {
	id: string;
	label: string;
	supportingText?: string | null;
};

type ClientPreviewSelectorProps = {
	items: DocumentPreviewSelectorItem[];
	template: DocumentTemplateSlug;
	mode?: "client" | "trabajo";
};

export function ClientPreviewSelector({
	items,
	template,
	mode = "client",
}: ClientPreviewSelectorProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const fieldName = mode === "trabajo" ? "trabajoId" : "clientId";
	const label = mode === "trabajo" ? "Trabajo" : "Cliente";
	const placeholder =
		mode === "trabajo" ? "Selecciona un trabajo" : "Selecciona un cliente";

	function handleChange(event: ChangeEvent<HTMLSelectElement>) {
		const selectedId = event.target.value;

		if (!selectedId) {
			return;
		}

		startTransition(() => {
			router.push(
				`/admin/documents/${template}/preview?${fieldName}=${encodeURIComponent(selectedId)}`,
			);
		});
	}

	return (
		<div className="space-y-2.5">
			<label
				htmlFor={fieldName}
				className="text-sm font-medium text-[var(--brand-deep)]"
			>
				{label}
			</label>
			<select
				id={fieldName}
				name={fieldName}
				defaultValue=""
				disabled={isPending}
				onChange={handleChange}
				className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300 disabled:cursor-wait disabled:opacity-70"
			>
				<option value="">{placeholder}</option>
				{items.map((item) => (
					<option key={item.id} value={item.id}>
						{item.label}
						{item.supportingText ? ` · ${item.supportingText}` : ""}
					</option>
				))}
			</select>
			{isPending ? (
				<p
					className="text-sm text-[var(--muted)]"
					role="status"
					aria-live="polite"
				>
					Abriendo vista previa…
				</p>
			) : null}
		</div>
	);
}
