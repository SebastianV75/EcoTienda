"use client";

import { useActionState } from "react";

import { ImageUpload } from "./components/image-upload";
import { GoogleMapsPicker } from "./components/google-maps-picker";
import { ToggleGroup } from "./components/toggle-group";
import { SurveySelect } from "./components/survey-select";

import {
	savePanelesSolaresAction,
	type PanelesSolaresActionState,
} from "./paneles-solares-actions";

type PanelesSolaresFormProps = {
	trabajoId: string;
};

const initialState: PanelesSolaresActionState = {
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

export function PanelesSolaresForm({ trabajoId }: PanelesSolaresFormProps) {
	const [state, formAction, isPending] = useActionState(
		savePanelesSolaresAction,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="space-y-5">
				<SectionHeader>Datos Generales</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Nombre de cliente</FieldLabel>
						<input
							type="text"
							name="contact_name"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Correo electrónico</FieldLabel>
						<input
							type="email"
							name="email"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Número de teléfono</FieldLabel>
						<input
							type="text"
							name="contact_phone"
							placeholder="Escribe aquí"
							className={sectionFieldClass()}
						/>
					</div>

					<div className="space-y-2.5 md:col-span-2">
						<FieldLabel>Ubicación</FieldLabel>
						<GoogleMapsPicker name="location" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Datos Técnicos y Evidencia</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Voltaje</FieldLabel>
						<ToggleGroup name="voltage" options={["110v", "220v"]} />
						<p className="text-xs text-[var(--muted)]">Se puede observar en el medidor: F1 o F2</p>
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto del medidor</FieldLabel>
						<ImageUpload name="meter_photo" trabajoId={trabajoId} fieldName="meter_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto de casa</FieldLabel>
						<ImageUpload name="house_photo" trabajoId={trabajoId} fieldName="house_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto del lugar donde va el evaporador</FieldLabel>
						<ImageUpload name="evaporator_photo" trabajoId={trabajoId} fieldName="evaporator_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto de donde va el compresor</FieldLabel>
						<ImageUpload name="compressor_photo" trabajoId={trabajoId} fieldName="compressor_photo" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Cierre de Inspección</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Extra</FieldLabel>
						<SurveySelect
							name="extra"
							options={["Base", "Extensión de línea", "Centro de carga", "N/A"]}
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
