"use client";

import { useActionState, useMemo, useState } from "react";

import { ActionButton } from "@/components/ui/action-button";
import { Input, Select, Textarea } from "@/components/ui/field";

import {
	createAgendaItemAction,
	updateAgendaItemAction,
	type AgendaActionState,
} from "@/features/agenda/actions";
import {
	agendaWorkTypeLabels,
	type AgendaItemFormValues,
	type AgendaWorkTypeOption,
} from "@/types/agenda";
import { workerRoleLabels, type WorkerSummary } from "@/types/worker";
import { geocodeAddress } from "@/features/trabajos/components/google-maps-picker";

type AgendaItemFormProps = {
	mode: "create" | "edit";
	agendaItemId?: string;
	workers: WorkerSummary[];
	defaultValues: AgendaItemFormValues;
	googleMapsApiKey?: string | null;
};

const initialState: AgendaActionState = {
	error: null,
};

type LocationMessage = {
	tone: "success" | "error" | "info";
	text: string;
};

function buildFullName(
	firstName: string,
	paternalLastName: string,
	maternalLastName: string,
) {
	return [firstName.trim(), paternalLastName.trim(), maternalLastName.trim()]
		.filter(Boolean)
		.join(" ");
}

function resolveWorkTypeLabel(
	choice: AgendaWorkTypeOption,
	otherValue: string,
) {
	if (choice === "otro") {
		return otherValue.trim() || agendaWorkTypeLabels.otro;
	}

	return agendaWorkTypeLabels[choice];
}

function buildAgendaTitle(workTypeLabel: string, fullName: string) {
	const baseTitle = workTypeLabel.trim() || "Visita técnica";
	const contactLabel = fullName.trim() || "Nuevo trabajo";

	return `${baseTitle} · ${contactLabel}`;
}

export function AgendaItemForm({
	mode,
	agendaItemId,
	workers,
	defaultValues,
	googleMapsApiKey = null,
}: AgendaItemFormProps) {
	const action =
		mode === "create" ? createAgendaItemAction : updateAgendaItemAction;
	const [state, formAction] = useActionState(action, initialState);
	const initialWorkerId = useMemo(() => {
		if (defaultValues.assignee_worker_id.trim()) {
			return defaultValues.assignee_worker_id;
		}

		return (
			workers.find((worker) => worker.full_name === defaultValues.assignee_name)
				?.id ?? ""
		);
	}, [defaultValues.assignee_name, defaultValues.assignee_worker_id, workers]);
	const [selectedWorkerId, setSelectedWorkerId] = useState(initialWorkerId);
	const [title, setTitle] = useState(defaultValues.title);
	const [workTypeChoice, setWorkTypeChoice] = useState<AgendaWorkTypeOption>(
		defaultValues.work_type_choice,
	);
	const [workTypeOther, setWorkTypeOther] = useState(
		defaultValues.work_type_other,
	);
	const [firstName, setFirstName] = useState(defaultValues.first_name);
	const [paternalLastName, setPaternalLastName] = useState(
		defaultValues.paternal_last_name,
	);
	const [maternalLastName, setMaternalLastName] = useState(
		defaultValues.maternal_last_name,
	);
	const [addressText, setAddressText] = useState(defaultValues.address_text);
	const [latitude, setLatitude] = useState(defaultValues.latitude);
	const [longitude, setLongitude] = useState(defaultValues.longitude);
	const [email, setEmail] = useState(defaultValues.email || "");
	const [isLocating, setIsLocating] = useState(false);
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [locationMessage, setLocationMessage] =
		useState<LocationMessage | null>(null);
	const workTypeLabel = useMemo(
		() => resolveWorkTypeLabel(workTypeChoice, workTypeOther),
		[workTypeChoice, workTypeOther],
	);
	const contactName = useMemo(
		() => buildFullName(firstName, paternalLastName, maternalLastName),
		[firstName, maternalLastName, paternalLastName],
	);
	const generatedTitle = useMemo(
		() => buildAgendaTitle(workTypeLabel, contactName),
		[workTypeLabel, contactName],
	);
	const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(
		defaultValues.title.trim() !==
			buildAgendaTitle(defaultValues.work_type, defaultValues.contact_name),
	);
	const selectedWorker = useMemo(
		() => workers.find((worker) => worker.id === selectedWorkerId) ?? null,
		[workers, selectedWorkerId],
	);
	const assigneeSnapshot =
		selectedWorker?.full_name ?? defaultValues.assignee_name;

	function syncGeneratedTitle(
		nextWorkTypeLabel: string,
		nextContactName: string,
	) {
		if (isTitleManuallyEdited) {
			return;
		}

		setTitle(buildAgendaTitle(nextWorkTypeLabel, nextContactName));
	}

	function syncGeneratedTitleWithInputs(
		nextChoice: AgendaWorkTypeOption,
		nextOther: string,
		nextFirstName: string,
		nextPaternalLastName: string,
		nextMaternalLastName: string,
	) {
		syncGeneratedTitle(
			resolveWorkTypeLabel(nextChoice, nextOther),
			buildFullName(nextFirstName, nextPaternalLastName, nextMaternalLastName),
		);
	}

	function handleTitleChange(nextTitle: string) {
		setTitle(nextTitle);
		setIsTitleManuallyEdited(nextTitle.trim() !== generatedTitle);
	}

	function handleWorkTypeChoiceChange(nextChoice: AgendaWorkTypeOption) {
		setWorkTypeChoice(nextChoice);
		syncGeneratedTitleWithInputs(
			nextChoice,
			workTypeOther,
			firstName,
			paternalLastName,
			maternalLastName,
		);
	}

	function handleWorkTypeOtherChange(nextOther: string) {
		setWorkTypeOther(nextOther);
		syncGeneratedTitleWithInputs(
			workTypeChoice,
			nextOther,
			firstName,
			paternalLastName,
			maternalLastName,
		);
	}

	function handleFirstNameChange(nextFirstName: string) {
		setFirstName(nextFirstName);
		syncGeneratedTitleWithInputs(
			workTypeChoice,
			workTypeOther,
			nextFirstName,
			paternalLastName,
			maternalLastName,
		);
	}

	function handlePaternalLastNameChange(nextLastName: string) {
		setPaternalLastName(nextLastName);
		syncGeneratedTitleWithInputs(
			workTypeChoice,
			workTypeOther,
			firstName,
			nextLastName,
			maternalLastName,
		);
	}

	function handleMaternalLastNameChange(nextLastName: string) {
		setMaternalLastName(nextLastName);
		syncGeneratedTitleWithInputs(
			workTypeChoice,
			workTypeOther,
			firstName,
			paternalLastName,
			nextLastName,
		);
	}

	function handleAddressChange(nextAddress: string) {
		setAddressText(nextAddress);
		if (latitude.trim() || longitude.trim()) {
			setLocationMessage({
				tone: "info",
				text: "La dirección cambió. Actualiza las coordenadas desde el domicilio antes de guardar.",
			});
		}
	}

	async function handleGeocodeAddress() {
		const address = addressText.trim();
		const apiKey =
			googleMapsApiKey?.trim() ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
			null;

		if (!address) {
			setLocationMessage({
				tone: "error",
				text: "Captura primero el domicilio completo para obtener sus coordenadas.",
			});
			return;
		}

		if (!apiKey) {
			setLocationMessage({
				tone: "error",
				text: "No hay una clave de Google Maps configurada para convertir el domicilio en coordenadas.",
			});
			return;
		}

		setIsGeocoding(true);
		setLocationMessage(null);
		try {
			const result = await geocodeAddress(address, apiKey);
			setLatitude(String(result.latitude));
			setLongitude(String(result.longitude));
			setLocationMessage({
				tone: "success",
				text: "Coordenadas obtenidas desde el domicilio. Revísalas antes de guardar.",
			});
		} catch (error) {
			setLocationMessage({
				tone: "error",
				text:
					error instanceof Error
						? error.message
						: "No se pudo convertir el domicilio en coordenadas.",
			});
		} finally {
			setIsGeocoding(false);
		}
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
				<Input type="hidden" name="id" value={agendaItemId} />
			) : null}
			<Input type="hidden" name="tipo" value={defaultValues.tipo} />
			<Input type="hidden" name="estado" value={defaultValues.estado} />
			<Input type="hidden" name="assignee_name" value={assigneeSnapshot} />
			<Input type="hidden" name="work_type" value={workTypeLabel} />
			<Input type="hidden" name="contact_name" value={contactName} />
			<Input type="hidden" name="email" value={email} />

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
					<Input
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
					<Input
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
					<Input
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
						htmlFor="work_type_choice"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Tipo de trabajo
					</label>
					<Select
						id="work_type_choice"
						name="work_type_choice"
						value={workTypeChoice}
						onChange={(event) =>
							handleWorkTypeChoiceChange(
								event.target.value as AgendaWorkTypeOption,
							)
						}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						{Object.entries(agendaWorkTypeLabels).map(([value, label]) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</Select>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="assignee_worker_id"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Trabajador asignado
					</label>
					<Select
						id="assignee_worker_id"
						name="assignee_worker_id"
						value={selectedWorkerId}
						onChange={(event) => setSelectedWorkerId(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					>
						<option value="">Selecciona un trabajador activo</option>
						{workers.map((worker) => (
							<option key={worker.id} value={worker.id}>
								{worker.full_name} · {workerRoleLabels[worker.role]}
							</option>
						))}
					</Select>
					<p className="text-xs leading-6 text-[var(--muted)]">
						Se guarda el nombre del trabajador como snapshot legible.
					</p>
				</div>

				{workTypeChoice === "otro" ? (
					<div className="space-y-2.5 md:col-span-2">
						<label
							htmlFor="work_type_other"
							className="text-sm font-medium text-[var(--brand-deep)]"
						>
							Otro tipo de trabajo
						</label>
						<Input
							id="work_type_other"
							name="work_type_other"
							value={workTypeOther}
							onChange={(event) =>
								handleWorkTypeOtherChange(event.target.value)
							}
							className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
							placeholder="Describe el tipo de trabajo si hace falta"
						/>
					</div>
				) : null}

				<div className="space-y-2.5">
					<label
						htmlFor="first_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nombre
					</label>
					<Input
						id="first_name"
						name="first_name"
						value={firstName}
						onChange={(event) => handleFirstNameChange(event.target.value)}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="paternal_last_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Apellido paterno
					</label>
					<Input
						id="paternal_last_name"
						name="paternal_last_name"
						value={paternalLastName}
						onChange={(event) =>
							handlePaternalLastNameChange(event.target.value)
						}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Apellido paterno"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="maternal_last_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Apellido materno
					</label>
					<Input
						id="maternal_last_name"
						name="maternal_last_name"
						value={maternalLastName}
						onChange={(event) =>
							handleMaternalLastNameChange(event.target.value)
						}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Apellido materno (opcional)"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="contact_phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<Input
						id="contact_phone"
						name="contact_phone"
						defaultValue={defaultValues.contact_phone}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Teléfono de contacto"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="email"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Email
					</label>
					<Input
						id="email"
						name="email"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="email@ejemplo.com"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="address_text"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Dirección
					</label>
					<Textarea
						id="address_text"
						name="address_text"
						value={addressText}
						onChange={(event) => handleAddressChange(event.target.value)}
						required
						rows={3}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Dirección completa"
					/>
					<div className="flex flex-wrap items-center gap-2">
						<button
							type="button"
							onClick={handleGeocodeAddress}
							disabled={isGeocoding || isLocating}
							className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isGeocoding
								? "Buscando domicilio..."
								: "Obtener coordenadas desde domicilio"}
						</button>
						<p className="text-xs leading-5 text-[var(--muted)]">
							También puedes usar el botón de ubicación del dispositivo o
							capturarlas manualmente.
						</p>
					</div>
					{/* Mini mapa de Google Maps */}
					{(addressText || latitude || longitude) && (
						<div className="mt-3 rounded-xl overflow-hidden border border-[var(--border-soft)]">
							<iframe
								width="100%"
								height={200}
								frameBorder="0"
								style={{ border: 0 }}
								src={`https://maps.google.com/maps?q=${encodeURIComponent(addressText || `${latitude},${longitude}`)}&hl=es&z=15&output=embed`}
								allowFullScreen
								title="Ubicación en Google Maps"
							/>
						</div>
					)}
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="latitude"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Latitud
					</label>
					<Input
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
					<Input
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
						disabled={isLocating || isGeocoding}
						className="w-full rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
					>
						{isLocating ? "Obteniendo ubicación..." : "Usar mi ubicación"}
					</button>
					<p className="text-xs leading-5 text-[var(--muted)]">
						La dirección, el dispositivo y la captura manual son opciones
						independientes.
					</p>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="descripcion"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nota
					</label>
					<Textarea
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

			<ActionButton
				type="submit"
				pendingLabel={mode === "create" ? "Guardando..." : "Actualizando..."}
				className="w-full rounded-full bg-[var(--brand)] px-5 py-3.5 font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
			>
				{mode === "create"
					? "Crear trabajo en Agenda"
					: "Guardar ajuste de Agenda"}
			</ActionButton>
		</form>
	);
}
