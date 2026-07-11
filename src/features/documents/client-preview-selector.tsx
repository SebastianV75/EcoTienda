"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";

type DocumentTemplateSlug =
	| "carta-poder"
	| "ubicacion-cliente"
	| "diagrama-unifilar";

type ClientPreviewSelectorClient = {
	id: string;
	full_name: string;
	rpu: string | null;
};

type ClientPreviewSelectorProps = {
	clients: ClientPreviewSelectorClient[];
	template: DocumentTemplateSlug;
};

export function ClientPreviewSelector({
	clients,
	template,
}: ClientPreviewSelectorProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleChange(event: ChangeEvent<HTMLSelectElement>) {
		const clientId = event.target.value;

		if (!clientId) {
			return;
		}

		startTransition(() => {
			router.push(
				`/admin/documents/${template}/preview?clientId=${encodeURIComponent(clientId)}`,
			);
		});
	}

	return (
		<div className="space-y-2.5">
			<label
				htmlFor="clientId"
				className="text-sm font-medium text-[var(--brand-deep)]"
			>
				Cliente
			</label>
			<select
				id="clientId"
				name="clientId"
				defaultValue=""
				disabled={isPending}
				onChange={handleChange}
				className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300 disabled:cursor-wait disabled:opacity-70"
			>
				<option value="">Selecciona un cliente</option>
				{clients.map((client) => (
					<option key={client.id} value={client.id}>
						{client.full_name} · {client.rpu}
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
