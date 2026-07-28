"use client";

import { useActionState } from "react";

import { ImageUpload } from "./components/image-upload";
import { VideoUpload } from "./components/video-upload";
import { GoogleMapsPicker } from "./components/google-maps-picker";
import { DateTimePicker } from "./components/date-time-picker";

import {
	saveVisitaAmpliarAction,
	type VisitaAmpliarActionState,
} from "./visita-ampliar-actions";

type VisitaAmpliarFormProps = {
	trabajoId: string;
};

const initialState: VisitaAmpliarActionState = {
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

export function VisitaAmpliarForm({ trabajoId }: VisitaAmpliarFormProps) {
	const [state, formAction, isPending] = useActionState(
		saveVisitaAmpliarAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="space-y-5">
				<SectionHeader>Datos Generales</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Fecha</FieldLabel>
						<DateTimePicker name="execution_date" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Nombre</FieldLabel>
						<input
							type="text"
							name="contact_name"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto de la casa</FieldLabel>
						<ImageUpload name="house_photo" trabajoId={trabajoId} fieldName="house_photo" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Evidencia del Medidor y Contacto</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Medidor (foto)</FieldLabel>
						<ImageUpload name="meter_photo" trabajoId={trabajoId} fieldName="meter_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Medidor (video)</FieldLabel>
						<VideoUpload name="meter_video" trabajoId={trabajoId} fieldName="meter_video" />
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
						<FieldLabel>Correo</FieldLabel>
						<input
							type="email"
							name="email"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Ubicación</FieldLabel>
						<GoogleMapsPicker name="location" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Recibo de luz</FieldLabel>
						<ImageUpload name="utility_bill" trabajoId={trabajoId} fieldName="utility_bill" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Sistema Existente (Inversor y Paneles Actuales)</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Capacidad del inversor</FieldLabel>
						<input
							type="text"
							name="inverter_capacity"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto del inversor</FieldLabel>
						<ImageUpload name="inverter_photo" trabajoId={trabajoId} fieldName="inverter_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Etiqueta del inversor</FieldLabel>
						<ImageUpload name="inverter_label" trabajoId={trabajoId} fieldName="inverter_label" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Paneles previos</FieldLabel>
						<input
							type="text"
							name="previous_panels"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto paneles</FieldLabel>
						<ImageUpload name="panels_photo" trabajoId={trabajoId} fieldName="panels_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Etiqueta de los paneles</FieldLabel>
						<ImageUpload name="panels_label" trabajoId={trabajoId} fieldName="panels_label" />
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Estado de los paneles</FieldLabel>
						<input
							type="text"
							name="panels_condition"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Detalles de la Ampliación</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Paneles por instalar</FieldLabel>
						<input
							type="text"
							name="panels_to_install"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Fotos del área</FieldLabel>
						<ImageUpload name="area_photos" trabajoId={trabajoId} fieldName="area_photos" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Video del área</FieldLabel>
						<VideoUpload name="area_video" trabajoId={trabajoId} fieldName="area_video" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Medidas</FieldLabel>
						<ImageUpload name="measurements" trabajoId={trabajoId} fieldName="measurements" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Tipo de aislante</FieldLabel>
						<input
							type="text"
							name="insulation_type"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Nota</FieldLabel>
						<textarea
							name="notes"
							rows={3}
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
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
