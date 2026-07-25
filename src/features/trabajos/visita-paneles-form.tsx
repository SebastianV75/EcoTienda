"use client";

import { useActionState, useState } from "react";

import { VoiceInput } from "./components/voice-input";
import { SignaturePad } from "./components/signature-pad";
import { ImageUpload } from "./components/image-upload";
import { GoogleMapsPicker } from "./components/google-maps-picker";
import { ToggleGroup } from "./components/toggle-group";
import { SurveySelect } from "./components/survey-select";
import { DropdownSelect } from "./components/dropdown-select";
import { DateTimePicker } from "./components/date-time-picker";

import {
	saveVisitaPanelesAction,
	type VisitaPanelesActionState,
} from "./visita-paneles-actions";

type VisitaPanelesFormProps = {
	trabajoId: string;
};

const initialState: VisitaPanelesActionState = {
	error: null,
	success: null,
};

function SectionHeader({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-strong)]">
			{children}
		</h2>
	);
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
	return (
		<label className="flex items-center gap-1 text-sm font-medium text-[var(--brand-deep)]">
			{children}
			{required && <span className="text-rose-500">•</span>}
		</label>
	);
}

function sectionFieldClass() {
	return "w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300";
}

export function VisitaPanelesForm({ trabajoId }: VisitaPanelesFormProps) {
	const [state, formAction, isPending] = useActionState(
		saveVisitaPanelesAction,
		initialState,
	);
	const [hasMinisplit, setHasMinisplit] = useState("");

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="space-y-5">
				<SectionHeader>Datos Generales del Cliente</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel required>Fecha de realización</FieldLabel>
						<DateTimePicker name="execution_date" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Nombre de cliente</FieldLabel>
						<VoiceInput name="contact_name" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Teléfono</FieldLabel>
						<input
							type="text"
							name="contact_phone"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Correo electrónico</FieldLabel>
						<VoiceInput name="email" />
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Ubicación</FieldLabel>
						<GoogleMapsPicker name="location" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Información del Proyecto / Cotización</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Recibo de luz</FieldLabel>
						<ImageUpload name="utility_bill" trabajoId={trabajoId} fieldName="utility_bill" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Paquete de interés</FieldLabel>
						<VoiceInput name="interest_package" />
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Tipo de cotización</FieldLabel>
						<SurveySelect
							name="quotation_type"
							options={["De contado", "Precio de lista", "Plan 50/50"]}
						/>
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Lógica Condicional (Minisplits)</SectionHeader>
				<div className="space-y-4">
					<div className="space-y-2.5">
						<FieldLabel>¿Con minisplits?</FieldLabel>
						<SurveySelect
							name="has_minisplit"
							options={["Si", "No"]}
							onChange={setHasMinisplit}
						/>
					</div>

					{hasMinisplit === "Si" && (
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2.5">
								<FieldLabel>Especificaciones de minisplit</FieldLabel>
								<VoiceInput name="minisplit_specs" />
							</div>

							<div className="space-y-2.5">
								<FieldLabel>Foto de donde va el minisplit</FieldLabel>
								<ImageUpload name="minisplit_photo" trabajoId={trabajoId} fieldName="minisplit_photo" />
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Evidencia Fotográfica y Detalles Técnicos (Casa y Medidor)</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Hojas de visita</FieldLabel>
						<ImageUpload name="hojas_visita" trabajoId={trabajoId} fieldName="hojas_visita" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de casa</FieldLabel>
						<ImageUpload name="house_image" trabajoId={trabajoId} fieldName="house_image" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Orientación</FieldLabel>
						<DropdownSelect
							name="orientation"
							options={["Norte", "Sur", "Este", "Oeste", "Noreste", "Noroeste", "Sureste", "Suroeste"]}
							description="viendo la casa de la puerta hacia la calle"
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Pisos</FieldLabel>
						<ToggleGroup name="floors" options={["1", "2"]} />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen del medidor de lejos</FieldLabel>
						<ImageUpload name="meter_far" trabajoId={trabajoId} fieldName="meter_far" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de medidor de cerca</FieldLabel>
						<ImageUpload name="meter_close" trabajoId={trabajoId} fieldName="meter_close" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Voltaje</FieldLabel>
						<ToggleGroup name="voltage" options={["110v", "220v"]} />
						<p className="text-xs text-[var(--muted)]">En el medidor dice 1F o 2F</p>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Medidor</FieldLabel>
						<ToggleGroup name="meter_position" options={["Da a la calle", "Adentro del barandal"]} />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Tiene mufa</FieldLabel>
						<ToggleGroup name="has_mufa" options={["Si", "No"]} />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de centro de carga</FieldLabel>
						<ImageUpload name="load_center" trabajoId={trabajoId} fieldName="load_center" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de subida eléctrica</FieldLabel>
						<ImageUpload name="electrical_rise" trabajoId={trabajoId} fieldName="electrical_rise" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Inspección del Techo y Estructura</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Tiene escalera marina</FieldLabel>
						<ToggleGroup name="has_marine_ladder" options={["Si", "No"]} />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen del techo</FieldLabel>
						<ImageUpload name="roof_image" trabajoId={trabajoId} fieldName="roof_image" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Material del techo</FieldLabel>
						<SurveySelect name="roof_material" options={["Losa", "Lámina", "Madera"]} />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Tipo de aislamiento</FieldLabel>
						<DropdownSelect
							name="insulation_type"
							options={["Ninguno", "Básico", "Térmico", "Impermeable"]}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de sombreado 1</FieldLabel>
						<ImageUpload name="shading_1" trabajoId={trabajoId} fieldName="shading_1" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Imagen de sombreado 2</FieldLabel>
						<ImageUpload name="shading_2" trabajoId={trabajoId} fieldName="shading_2" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Medidas del techo</FieldLabel>
						<ImageUpload name="roof_measurements" trabajoId={trabajoId} fieldName="roof_measurements" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Tipo de estructura</FieldLabel>
						<SurveySelect name="structure_type" options={["1 nivel", "2 niveles", "Ambos"]} />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Cierre del Formulario</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Notas adicionales</FieldLabel>
						<VoiceInput name="notes" />
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Cliente (firma)</FieldLabel>
						<SignaturePad name="signature" />
					</div>
				</div>
			</div>

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			{state.success ? (
				<p className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
					{state.success}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? "Guardando..." : "Guardar"}
			</button>
		</form>
	);
}
