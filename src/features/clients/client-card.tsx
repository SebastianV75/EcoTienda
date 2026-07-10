import { ClientActions } from "@/features/clients/client-actions";
import type { ClientRecord } from "@/types/client";

type ClientCardProps = {
	client: ClientRecord;
};

export function ClientCard({ client }: ClientCardProps) {
	return (
		<article className="rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)]">
			<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
				Cliente
			</p>
			<h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
				{client.full_name}
			</h3>
			<dl className="mt-4 space-y-3 text-sm text-[var(--muted)]">
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">Teléfono</dt>
					<dd>{client.phone}</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">RFC</dt>
					<dd>{client.rfc}</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">RPU</dt>
					<dd>{client.rpu}</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">Colonia</dt>
					<dd>{client.neighborhood}</dd>
				</div>
			</dl>
			<div className="mt-5">
				<ClientActions
					clientId={client.id}
					phone={client.phone}
					latitude={client.latitude}
					longitude={client.longitude}
				/>
			</div>
		</article>
	);
}
