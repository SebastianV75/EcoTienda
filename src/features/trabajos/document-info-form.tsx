"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/field";
import type { DocumentPreviewSubject } from "@/features/documents/preview-data";
import { getPostalCodeLocation } from "@/features/trabajos/postal-code-location";
import {
	saveTrabajoDocumentInfoAction,
	type DocumentInfoActionState,
} from "./document-info-actions";

type DocumentInfoFormProps = {
	trabajoId: string;
	defaults: DocumentPreviewSubject;
	cfeDefaults: DocumentPreviewSubject;
	missing: string[];
};

const initialState: DocumentInfoActionState = {
	error: null,
	success: null,
};

const fieldClassName =
	"w-full rounded-[16px] border border-[var(--border-soft)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300";

function CfeContactFields({ defaults }: { defaults: DocumentPreviewSubject }) {
	const initialPostalCode = defaults.postal_code ?? "";
	const initialLocation = getPostalCodeLocation(initialPostalCode);
	const [postalCode, setPostalCode] = useState(initialPostalCode);
	const [municipality, setMunicipality] = useState(
		defaults.municipality ?? initialLocation?.municipality ?? "",
	);
	const [state, setState] = useState(
		defaults.state ?? initialLocation?.state ?? "",
	);

	function handlePostalCodeChange(value: string) {
		const nextPostalCode = value.replace(/\D/g, "").slice(0, 5);
		setPostalCode(nextPostalCode);

		const location = getPostalCodeLocation(nextPostalCode);
		if (!location) return;
		if (!municipality.trim()) setMunicipality(location.municipality);
		if (!state.trim()) setState(location.state);
	}

	return (
		<div className="space-y-3">
			<h4 className="text-sm font-semibold text-[var(--brand-deep)]">
				Datos CFE del solicitante
			</h4>
			<p className="text-sm leading-6 text-amber-900/80">
				El municipio y estado se completan al salir del código postal cuando
				existe una coincidencia confirmada; puedes corregirlos manualmente.
			</p>
			<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
				<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)] md:col-span-2">
					<span>Correo electrónico</span>
					<Input
						name="email"
						type="email"
						autoComplete="email"
						defaultValue={defaults.email ?? ""}
						required
						className={fieldClassName}
					/>
				</label>
				<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
					<span>Código postal</span>
					<Input
						name="postal_code"
						inputMode="numeric"
						pattern="[0-9]{5}"
						maxLength={5}
						value={postalCode}
						onChange={(event) => handlePostalCodeChange(event.target.value)}
						required
						className={fieldClassName}
					/>
				</label>
				<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
					<span>Municipio</span>
					<Input
						name="municipality"
						value={municipality}
						onChange={(event) => setMunicipality(event.target.value)}
						required
						className={fieldClassName}
					/>
				</label>
				<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
					<span>Estado</span>
					<Input
						name="state"
						value={state}
						onChange={(event) => setState(event.target.value)}
						required
						className={fieldClassName}
					/>
				</label>
			</div>
		</div>
	);
}

export function DocumentInfoForm({
	trabajoId,
	defaults,
	cfeDefaults,
	missing,
}: DocumentInfoFormProps) {
	const router = useRouter();
	const [state, formAction] = useActionState(
		saveTrabajoDocumentInfoAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) {
			router.refresh();
		}
	}, [router, state.success]);

	return (
		<section className="space-y-4 rounded-[22px] border border-amber-200 bg-amber-50/70 p-4 sm:p-5">
			<div className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
					Información para descargables
				</p>
				<h3 className="text-lg font-semibold text-[var(--brand-deep)]">
					Completa los datos que usarán los documentos
				</h3>
				<p className="text-sm leading-6 text-amber-900/80">
					Esta información se reutiliza en carta poder, ubicación del cliente,
					diagrama unifilar y la solicitud CFE.
				</p>
			</div>

			{missing.length > 0 ? (
				<p className="rounded-[14px] border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-900">
					Pendiente: {missing.join(", ")}.
				</p>
			) : null}

			<form action={formAction} className="space-y-5">
				<input type="hidden" name="trabajo_id" value={trabajoId} />

				<div className="space-y-3">
					<h4 className="text-sm font-semibold text-[var(--brand-deep)]">
						Datos del titular y domicilio
					</h4>
					<div className="grid gap-3 md:grid-cols-2">
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Nombre del titular</span>
							<Input
								name="full_name"
								defaultValue={defaults.full_name}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Teléfono</span>
							<Input
								name="phone"
								defaultValue={defaults.phone ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)] md:col-span-2">
							<span>Domicilio</span>
							<Input
								name="address"
								defaultValue={defaults.address ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Colonia</span>
							<Input
								name="neighborhood"
								defaultValue={defaults.neighborhood ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>RPU</span>
							<Input
								name="rpu"
								defaultValue={defaults.rpu ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>RFC</span>
							<Input
								name="rfc"
								defaultValue={defaults.rfc ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
					</div>
				</div>

				<CfeContactFields defaults={cfeDefaults} />

				<div className="space-y-3">
					<h4 className="text-sm font-semibold text-[var(--brand-deep)]">
						Ubicación y equipo
					</h4>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Latitud</span>
							<Input
								name="latitude"
								type="number"
								step="any"
								defaultValue={defaults.latitude ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Longitud</span>
							<Input
								name="longitude"
								type="number"
								step="any"
								defaultValue={defaults.longitude ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Cantidad de paneles</span>
							<Input
								name="panel_count"
								defaultValue={defaults.panel_count ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Potencia de paneles</span>
							<Input
								name="panel_power"
								defaultValue={defaults.panel_power ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Inversor</span>
							<Input
								name="inverter"
								defaultValue={defaults.inverter ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)]">
							<span>Capacidad instalada</span>
							<Input
								name="installed_capacity"
								defaultValue={defaults.installed_capacity ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
						<label className="space-y-1.5 text-sm font-medium text-[var(--brand-deep)] md:col-span-2 lg:col-span-3">
							<span>Generación media mensual estimada</span>
							<Input
								name="estimated_monthly_generation"
								defaultValue={defaults.estimated_monthly_generation ?? ""}
								required
								className={fieldClassName}
							/>
						</label>
					</div>
				</div>

				{state.error ? (
					<p className="rounded-[14px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{state.error}
					</p>
				) : null}
				{state.success ? (
					<p className="rounded-[14px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
						{state.success}
					</p>
				) : null}

				<div className="flex justify-end">
					<ActionButton
						type="submit"
						pendingLabel="Guardando..."
						className="ui-primary-action"
					>
						Guardar información de descargables
					</ActionButton>
				</div>
			</form>
		</section>
	);
}
