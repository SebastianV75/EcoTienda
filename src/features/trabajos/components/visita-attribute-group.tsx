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
export function VisitaAttributeGroup({ group, attributes, title }: VisitaAttributeGroupProps) {
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
		<div className="space-y-3 md:col-span-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">{title}</p>
			<div className="grid gap-4 md:grid-cols-2">
				{keys.map((key) => {
					const label = getVisitaAttributeLabel(group, key);
					const value = getVisitaAttributeValue(attributes[key], key);

					return (
						<div key={key} className="space-y-1.5">
							<p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">{label}</p>
							{value.kind === "media" ? (
								<VisitaAttributeImage src={value.text} alt={label} />
							) : (
								<p className="text-sm font-medium text-[var(--foreground)] whitespace-pre-wrap">
									{value.text}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
