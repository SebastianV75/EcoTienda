"use client";

import { useActionState } from "react";

import { VoiceInput } from "./components/voice-input";
import { ImageUpload } from "./components/image-upload";

import {
	saveCambio220Action,
	type Cambio220ActionState,
} from "./cambio-220-actions";

type Cambio220FormProps = {
	trabajoId: string;
};

const initialState: Cambio220ActionState = {
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

export function Cambio220Form({ trabajoId }: Cambio220FormProps) {
	const [state, formAction, isPending] = useActionState(
		saveCambio220Action,
		initialState,
	);

	return (
		<form action={formAction} className="space-y-5">
			<input type="hidden" name="trabajo_id" value={trabajoId} />

			<div className="space-y-5">
				<SectionHeader>Datos Generales</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Nombre del cliente</FieldLabel>
						<VoiceInput name="contact_name" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Dirección</FieldLabel>
						<VoiceInput name="address" />
					</div>
				</div>
			</div>

			<div className="space-y-5">
				<SectionHeader>Evidencia Fotográfica</SectionHeader>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2.5">
						<FieldLabel>Foto del medidor</FieldLabel>
						<ImageUpload name="meter_photo" />
					</div>

					<div className="space-y-2.5">
						<FieldLabel>Foto de la quinta terminal puesta</FieldLabel>
						<ImageUpload name="terminal_photo" />
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
