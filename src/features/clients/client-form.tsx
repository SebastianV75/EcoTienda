"use client";

import { useActionState, useState } from "react";

import {
	createClientAction,
	type ClientActionState,
	updateClientAction,
} from "@/features/clients/actions";
import type { ClientFormValues } from "@/types/client";

type ClientFormProps = {
	mode: "create" | "edit";
	clientId?: string;
	defaultValues?: Partial<ClientFormValues>;
	googleMapsApiKey?: string | null;
};

type LocationMessage = {
	tone: "success" | "error" | "info";
	text: string;
};

const initialState: ClientActionState = {
	error: null,
};

async function reverseGeocode(
	latitude: string,
	longitude: string,
	apiKey: string,
): Promise<string | null> {
	try {
		const params = new URLSearchParams({
			latlng: `${latitude},${longitude}`,
			key: apiKey,
		});

		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
		);

		if (!response.ok) return null;

		const payload = (await response.json()) as {
			results?: Array<{ formatted_address?: string }>;
		};

		return payload.results?.[0]?.formatted_address ?? null;
	} catch {
		return null;
	}
}

export function ClientForm({
	mode,
	clientId,
	defaultValues,
	googleMapsApiKey,
}: ClientFormProps) {
	const action = mode === "create" ? createClientAction : updateClientAction;
	const [state, formAction, isPending] = useActionState(action, initialState);

	const [address, setAddress] = useState<string>(defaultValues?.address ?? "");
	const [latitude, setLatitude] = useState<string>(
		defaultValues?.latitude ?? "",
	);
	const [longitude, setLongitude] = useState<string>(
		defaultValues?.longitude ?? "",
	);
	const [isLocating, setIsLocating] = useState<boolean>(false);
	const [locationMessage, setLocationMessage] =
		useState<LocationMessage | null>(null);

	function handleUseMyLocation() {
		setLocationMessage(null);

		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			setLocationMessage({
				tone: "error",
				text: "Tu navegador no permite obtener la ubicación. Puedes ingresar los datos manualmente.",
			});
			return;
		}

		setIsLocating(true);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const nextLatitude = String(position.coords.latitude);
				const nextLongitude = String(position.coords.longitude);

				setLatitude(nextLatitude);
				setLongitude(nextLongitude);

				if (!googleMapsApiKey) {
					setLocationMessage({
						tone: "info",
						text: "Coordenadas capturadas. Ingresa la dirección manualmente.",
					});
					setIsLocating(false);
					return;
				}

				const formattedAddress = await reverseGeocode(
					nextLatitude,
					nextLongitude,
					googleMapsApiKey,
				);

				if (formattedAddress) {
					setAddress(formattedAddress);
					setLocationMessage({
						tone: "success",
						text: "Ubicación y dirección capturadas. Puedes ajustar los datos antes de guardar.",
					});
				} else {
					setLocationMessage({
						tone: "info",
						text: "Coordenadas capturadas, pero no se pudo determinar la dirección automáticamente.",
					});
				}

				setIsLocating(false);
			},
			(error) => {
				if (error.code === error.PERMISSION_DENIED) {
					setLocationMessage({
						tone: "error",
						text: "Permiso de ubicación denegado. Puedes ingresar la dirección manualmente.",
					});
				} else {
					setLocationMessage({
						tone: "error",
						text: "No se pudo obtener tu ubicación. Intenta de nuevo o captura los datos manualmente.",
					});
				}
				setIsLocating(false);
			},
			{ timeout: 5000 },
		);
	}

	return (
		<form action={formAction} className="space-y-5">
			{mode === "edit" ? (
				<input type="hidden" name="id" value={clientId} />
			) : null}

			<div className="grid gap-5 md:grid-cols-2">
				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="full_name"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Nombre del cliente
					</label>
					<input
						id="full_name"
						name="full_name"
						defaultValue={defaultValues?.full_name ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Nombre completo"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="phone"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Teléfono
					</label>
					<input
						id="phone"
						name="phone"
						defaultValue={defaultValues?.phone ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="10 dígitos o teléfono de contacto"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="rpu"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						RPU
					</label>
					<input
						id="rpu"
						name="rpu"
						defaultValue={defaultValues?.rpu ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Registro Permanente de Usuario"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="rfc"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						RFC
					</label>
					<input
						id="rfc"
						name="rfc"
						defaultValue={defaultValues?.rfc ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="RFC del cliente"
					/>
				</div>

				<div className="space-y-2.5">
					<label
						htmlFor="neighborhood"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Colonia
					</label>
					<input
						id="neighborhood"
						name="neighborhood"
						defaultValue={defaultValues?.neighborhood ?? ""}
						required
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Colonia o fraccionamiento"
					/>
				</div>

				<div className="space-y-2.5 md:col-span-2">
					<label
						htmlFor="address"
						className="text-sm font-medium text-[var(--brand-deep)]"
					>
						Dirección
					</label>
					<textarea
						id="address"
						name="address"
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						required
						rows={4}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
						placeholder="Dirección completa del cliente"
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
						placeholder="Ej. 20.6736"
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
						placeholder="Ej. -103.344"
					/>
				</div>
			</div>

			<div className="space-y-2.5">
				<button
					type="button"
					onClick={handleUseMyLocation}
					disabled={isLocating}
					className="w-full rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-[var(--brand-deep)] shadow-sm transition duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
				>
					{isLocating ? "Obteniendo ubicación..." : "Usar mi ubicación"}
				</button>
				<p className="text-xs leading-5 text-[var(--muted)]">
					Toca el botón para capturar coordenadas con el GPS del dispositivo. Si
					el permiso falla o no hay señal, puedes seguir capturando los datos
					manualmente.
				</p>
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
						? "Guardar cliente"
						: "Actualizar cliente"}
			</button>
		</form>
	);
}
