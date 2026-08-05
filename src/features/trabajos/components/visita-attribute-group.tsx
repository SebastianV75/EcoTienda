import {
	getVisitaAttributeKeys,
	getVisitaAttributeLabel,
	getVisitaAttributeValue,
	visitaAttributeLabels,
	type AttributeGroup,
} from "../visita-attribute-labels";
import { VisitaAttributeImage } from "./visita-attribute-image";

type VisitaAttributeGroupProps = {
	group: AttributeGroup;
	attributes: Record<string, unknown>;
	title: string;
};

/**
 * Render presentacional de un grupo JSONB de atributos de Visita Técnica.
 * Muestra pares etiqueta/valor en orden curado, oculta grupos vacíos y
 * renderiza imágenes, booleanos y valores vacíos con el formato esperado.
 */
export function VisitaAttributeGroup({
	group,
	attributes,
	title,
}: VisitaAttributeGroupProps) {
	if (Object.keys(attributes).length === 0) {
		return null;
	}

	const knownKeys = getVisitaAttributeKeys(group).filter((key) =>
		Object.prototype.hasOwnProperty.call(attributes, key),
	);
	const unknownKeys = Object.keys(attributes)
		.filter((key) => visitaAttributeLabels[group][key] === undefined)
		.sort();
	const keys = [...knownKeys, ...unknownKeys];

	return (
		<section className="space-y-4 rounded-[22px] border border-[var(--border-soft)] bg-[var(--surface)] p-4 md:col-span-2 md:p-5">
			<div className="flex items-center gap-3">
				<span
					className="h-2 w-2 rounded-full bg-[var(--brand)]"
					aria-hidden="true"
				/>
				<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--brand-deep)]">
					{title}
				</h3>
			</div>
			<div className="grid items-start gap-3 md:grid-cols-2">
				{keys.map((key) => {
					const label = getVisitaAttributeLabel(group, key);
					const value = getVisitaAttributeValue(attributes[key], key);

					return (
						<div
							key={key}
							className="min-w-0 space-y-2 rounded-[16px] border border-[var(--border-soft)] bg-white p-3.5"
						>
							<p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
								{label}
							</p>
							{value.kind === "media" ? (
								<VisitaAttributeImage src={value.text} alt={label} />
							) : (
								<p className="text-sm font-medium leading-6 text-[var(--foreground)] whitespace-pre-wrap">
									{value.text}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
}
