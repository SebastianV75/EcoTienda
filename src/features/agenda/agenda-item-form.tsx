"use client";

import { useActionState, useMemo, useState } from "react";

import {
	createAgendaItemAction,
	updateAgendaItemAction,
	type AgendaActionState,
} from "@/features/agenda/actions";
import type { AgendaItemFormValues } from "@/types/agenda";

type AgendaFormClientOption = {
	id: string;
	full_name: string;
	rpu: string;
};

type AgendaItemFormProps = {
	mode: "create" | "edit";
	agendaItemId?: string;
	clients: AgendaFormClientOption[];
	defaultValues: AgendaItemFormValues;
};

const initialState: AgendaActionState = {
	error: null,
};

type LocationMessage = {
	tone: "success" | "error" | "info";
	text: string;
};

function buildAgendaTitle(workType: string, contactName: string) {
	const baseTitle = workType.trim() || "Visita técnica";
	const contactLabel = contactName.trim() || "Nuevo trabajo";

	return `${baseTitle} · ${contactLabel}`;
}

export function AgendaItemForm({
	mode,
	agendaItemId,
	clients,
	defaultValues,
}: AgendaItemFormProps) {
	const action =
		mode === "create" ? createAgendaItemAction : updateAgendaItemAction;
	const [state, formAction, isPending] = useActionState(action, initialState);
	const [title, setTitle] = useState(defaultValues.title);
	const [workType, setWorkType] = useState(defaultValues.work_type);
	const [contactName, setContactName] = useState(defaultValues.contact_name);
	const [addressText, setAddressText] = useState(defaultValues.address_text);
	const [latitude, setLatitude] = useState(defaultValues.latitude);
	const [longitude, setLongitude] = useState(defaultValues.longitude);
	const [isLocating, setIsLocating] = useState(false);
	const [locationMessage, setLocationMessage] =
		useState<LocationMessage | null>(null);
	const generatedTitle = useMemo(
		() => buildAgendaTitle(workType, contactName),
		[workType, contactName],
	);
	const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(
		defaultValues.title.trim() !==
			buildAgendaTitle(defaultValues.work_type, defaultValues.contact_name),
	);

	function syncGeneratedTitle(nextWorkType: string, nextContactName: string) {
		if (isTitleManuallyEdited) {
			return;
		}

		setTitle(buildAgendaTitle(nextWorkType, nextContactName));
	}

	function handleTitleChange(nextTitle: string) {
		setTitle(nextTitle);
		setIsTitleManuallyEdited(nextTitle.trim() !== generatedTitle);
	}

	function handleWorkTypeChange(nextWorkType: string) {
		setWorkType(nextWorkType);
		syncGeneratedTitle(nextWorkType, contactName);
	}

	function handleContactNameChange(nextContactName: string) {
		setContactName(nextContactName);
		syncGeneratedTitle(workType, nextContactName);
	}

	function handleUseMyLocation() {
		setLocationMessage(null);

		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			setLocationMessage({
				tone: "error",
				text: "Tu navegador no permite obtener la ubicación. Puedes seguir capturando los datos manualmente.",
			});
			return;
		}

		setIsLocating(true);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				setLatitude(String(position.coords.latitude));
				setLongitude(String(position.coords.longitude));
				setLocationMessage({
					tone: "success",
					text: "Coordenadas capturadas. Completa o ajusta la dirección antes de guardar.",
				});
				setIsLocating(false);
			},
			(error) => {
				setLocationMessage({
					tone: "error",
					text:
						error.code === error.PERMISSION_DENIED
							? "Permiso de ubicación denegado. Puedes seguir capturando la dirección manualmente."
							: "No se pudo obtener tu ubicación. Intenta de nuevo o captura los datos manualmente.",
				});
				setIsLocating(false);
			},
			{ timeout: 5000 },
		);
	}

	return (
		<form action={formAction} className="space-y-5">
			{mode === "edit" && agendaItemId ? (
				<input type="hidden" name="id" value={agendaItemId} />
			) : null}
			<input type="hidden" name="tipo" value={defaultValues.tipo} />
			<input type="hidden" name="estado" value={defaultValues.estado} />

			<div className="rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4 sm:px-5">
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
					{mode === "create" ? "Inicio de Trabajo" : "Ajuste de trabajo"}
				</p>
				<h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
					{mode === "create"
						? "Abrir el ingreso desde Agenda"
						: "Mantener la Agenda alineada"}
				</h2>
				<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
					Captura título, fecha, contacto y ubicación en una sola superficie. El
					título sigue el tipo de trabajo y el contacto hasta que lo cambies a
					mano.
				</p>
			</div>

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="title"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Título del trabajo
					</label>
					<input
						id="title"
						name="title"
						value={title}
						onChange={(event) => handleTitleChange(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Visita técnica · Nuevo trabajo"
					/>
					<p className="text-xs leading-6 text-[var(--muted)]">
						Se usa como nombre del Trabajo en Agenda y se actualiza solo
						mientras no lo edites manualmente.
					</p>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="fecha"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Fecha
					</label>
					<input
						id="fecha"
						name="fecha"
						type="date"
						defaultValue={defaultValues.fecha}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="hora"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Hora
					</label>
					<input
						id="hora"
						name="hora"
						type="time"
						defaultValue={defaultValues.hora}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="work_type"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Tipo de trabajo
					</label>
					<input
						id="work_type"
						name="work_type"
						value={workType}
						onChange={(event) => handleWorkTypeChange(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Visita técnica, revisión, instalación pendiente"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="assignee_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Asignado a
					</label>
					<input
						id="assignee_name"
						name="assignee_name"
						defaultValue={defaultValues.assignee_name}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre de la persona responsable"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="contact_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nombre de contacto
					</label>
					<input
						id="contact_name"
						name="contact_name"
						value={contactName}
						onChange={(event) => handleContactNameChange(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre de quien recibe"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="contact_phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<input
						id="contact_phone"
						name="contact_phone"
						defaultValue={defaultValues.contact_phone}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Teléfono de contacto"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="address_text"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Dirección
					</label>
					<textarea
						id="address_text"
						name="address_text"
						value={addressText}
						onChange={(event) => setAddressText(event.target.value)}
						required
						rows={3}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Dirección completa"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="latitude"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Latitud
					</label>
					<input
						id="latitude"
						name="latitude"
						type="number"
						step="any"
						value={latitude}
						onChange={(event) => setLatitude(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="20.67"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="longitude"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Longitud
					</label>
					<input
						id="longitude"
						name="longitude"
						type="number"
						step="any"
						value={longitude}
						onChange={(event) => setLongitude(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="-103.34"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<button
						type="button"
						onClick={handleUseMyLocation}
						disabled={isLocating}
						className="w-full rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
					>
						{isLocating ? "Obteniendo ubicación..." : "Usar mi ubicación"}
					</button>
					<p className="text-xs leading-5 text-[var(--muted)]">
						Captura las coordenadas del dispositivo y luego ajusta la dirección
						si hace falta.
					</p>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="client_id"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Cliente vinculado
					</label>
					<select
						id="client_id"
						name="client_id"
						defaultValue={defaultValues.client_id}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						<option value="">Sin cliente asociado</option>
						{clients.map((client) => (
							<option key={client.id} value={client.id}>
								{client.full_name} · {client.rpu}
							</option>
						))}
					</select>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="descripcion"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nota
					</label>
					<textarea
						id="descripcion"
						name="descripcion"
						defaultValue={defaultValues.descripcion}
						rows={4}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Notas útiles para el equipo"
					/>
				</div>
			</div>

			{locationMessage ? (
				<p
					role="status"
					className={
						locationMessage.tone === "error"
							? "rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
							: locationMessage.tone === "success"
								? "rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
								: "rounded-[18px] border border-emerald-100 bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--muted)]"
					}
				>
					{locationMessage.text}
				</p>
			) : null}

			{state.error ? (
				<p className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
					{state.error}
				</p>
			) : null}

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
			>
				{isPending
					? mode === "create"
						? "Guardando..."
						: "Actualizando..."
					: mode === "create"
						? "Crear trabajo en Agenda"
						: "Guardar ajuste de Agenda"}
			</button>
		</form>
	);
}
