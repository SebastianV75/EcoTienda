import type { VisitContact } from "../visit-contact";

export function VisitContactDetails({ contact }: { contact: VisitContact }) {
	return (
		<div className="space-y-3 rounded-card border border-[var(--border-soft)] bg-[var(--surface)] p-4">
			<dl className="grid gap-3 text-sm sm:grid-cols-2">
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">
						Teléfono del cliente
					</dt>
					<dd className="mt-1 break-words text-[var(--muted)]">
						{contact.phone || "Sin teléfono registrado"}
					</dd>
				</div>
				<div>
					<dt className="font-medium text-[var(--brand-deep)]">
						Domicilio de la visita
					</dt>
					<dd className="mt-1 break-words text-[var(--muted)]">
						{contact.address || "Sin domicilio registrado"}
					</dd>
				</div>
			</dl>
			{contact.phoneHref || contact.mapHref ? (
				<div className="flex flex-wrap gap-2">
					{contact.phoneHref ? (
						<a
							href={contact.phoneHref}
							className="ui-secondary-action"
							aria-label={`Llamar a ${contact.name || "cliente"}`}
						>
							Llamar
						</a>
					) : null}
					{contact.mapHref ? (
						<a
							href={contact.mapHref}
							target="_blank"
							rel="noopener noreferrer"
							className="ui-secondary-action"
							aria-label={`Abrir ubicación de ${contact.name || "la visita"}`}
						>
							Abrir mapa
						</a>
					) : null}
				</div>
			) : null}
		</div>
	);
}
