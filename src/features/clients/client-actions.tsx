"use client";

import { useRouter } from "next/navigation";

type ClientActionsProps = {
	clientId: string;
	phone: string;
	latitude: number;
	longitude: number;
	showEdit?: boolean;
};

export function ClientActions({
	clientId,
	phone,
	latitude,
	longitude,
	showEdit = false,
}: ClientActionsProps) {
	const router = useRouter();

	return (
		<div className="flex flex-wrap gap-2.5">
			<button
				type="button"
				onClick={() => router.push(`/admin/clients/${clientId}`)}
				className="rounded-full bg-[var(--surface-strong)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-100"
			>
				Ver detalle
			</button>
			{showEdit ? (
				<button
					type="button"
					onClick={() => router.push(`/admin/clients/${clientId}/edit`)}
					className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
				>
					Editar cliente
				</button>
			) : null}
			<button
				type="button"
				onClick={() => {
					window.location.href = `tel:${phone}`;
				}}
				className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
			>
				Llamar
			</button>
			<button
				type="button"
				onClick={() => {
					window.open(
						`https://www.google.com/maps?q=${latitude},${longitude}`,
						"_blank",
						"noopener,noreferrer",
					);
				}}
				className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
			>
				Ver mapa
			</button>
		</div>
	);
}
