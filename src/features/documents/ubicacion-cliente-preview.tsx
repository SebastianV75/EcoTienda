"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ClientRecord } from "@/types/client";

type UbicacionClientePreviewProps = {
	client: ClientRecord;
	mapApiKey?: string | null;
};

type IdentityField = {
	label: string;
	value: string;
};

function formatField(value: string | null | undefined) {
	const trimmed = (value ?? "").trim();
	return trimmed.length > 0 ? trimmed : "Sin dato";
}

function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string" && value.trim().length > 0) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return null;
}

function hasValidCoordinates(client: ClientRecord) {
	const latitude = toFiniteNumber(client.latitude);
	const longitude = toFiniteNumber(client.longitude);

	if (latitude === null || longitude === null) {
		return false;
	}

	if (latitude === 0 && longitude === 0) {
		return false;
	}

	return true;
}

function buildStaticMapUrl(
	latitude: number,
	longitude: number,
	mapApiKey?: string | null,
) {
	const key = mapApiKey?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

	if (!key) {
		return null;
	}

	const params = new URLSearchParams({
		center: `${latitude},${longitude}`,
		zoom: "17",
		size: "800x420",
		scale: "2",
		markers: `color:green|${latitude},${longitude}`,
		key,
	});

	return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function buildGoogleMapsLink(latitude: number, longitude: number) {
	const params = new URLSearchParams({
		api: "1",
		query: `${latitude},${longitude}`,
	});

	return `https://www.google.com/maps/search/?${params.toString()}`;
}

export function UbicacionClientePreview({
	client,
	mapApiKey,
}: UbicacionClientePreviewProps) {
	const [mapFailed, setMapFailed] = useState(false);
	const identityFields: IdentityField[] = [
		{ label: "Nombre completo", value: formatField(client.full_name) },
		{ label: "Dirección", value: formatField(client.address) },
		{ label: "Colonia", value: formatField(client.neighborhood) },
		{ label: "RPU", value: formatField(client.rpu) },
		{ label: "RFC", value: formatField(client.rfc) },
	];

	const latitude = toFiniteNumber(client.latitude);
	const longitude = toFiniteNumber(client.longitude);
	const coordinatesAvailable = hasValidCoordinates(client);
	const staticMapUrl =
		coordinatesAvailable && latitude !== null && longitude !== null
			? buildStaticMapUrl(latitude, longitude, mapApiKey)
			: null;
	const googleMapsLink = useMemo(() => {
		if (!coordinatesAvailable || latitude === null || longitude === null) {
			return null;
		}

		return buildGoogleMapsLink(latitude, longitude);
	}, [coordinatesAvailable, latitude, longitude]);

	const showStaticMap = Boolean(staticMapUrl) && !mapFailed;

	return (
		<article className="space-y-4">
			<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
					Datos del cliente
				</p>
				<dl className="mt-5 grid gap-4 sm:grid-cols-2">
					{identityFields.map((field) => (
						<div key={field.label}>
							<dt className="text-sm font-medium text-[var(--brand-deep)]">
								{field.label}
							</dt>
							<dd className="mt-1 text-sm leading-7 text-[var(--muted)]">
								{field.value}
							</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
					Coordenadas guardadas
				</p>
				<div className="mt-5 grid gap-4 sm:grid-cols-2">
					<div>
						<p className="text-sm font-medium text-[var(--brand-deep)]">
							Latitud
						</p>
						<p className="mt-1 text-sm leading-7 text-[var(--muted)]">
							{latitude !== null ? latitude : "Sin dato"}
						</p>
					</div>
					<div>
						<p className="text-sm font-medium text-[var(--brand-deep)]">
							Longitud
						</p>
						<p className="mt-1 text-sm leading-7 text-[var(--muted)]">
							{longitude !== null ? longitude : "Sin dato"}
						</p>
					</div>
				</div>
			</section>

			<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7">
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
					Mapa
				</p>
				<div className="mt-5 overflow-hidden rounded-[24px] border border-emerald-100 bg-[var(--surface-strong)]">
					{showStaticMap ? (
						<img
							src={staticMapUrl ?? undefined}
							alt={`Mapa centrado en las coordenadas de ${client.full_name}`}
							className="block h-auto w-full"
							loading="lazy"
							onError={() => setMapFailed(true)}
						/>
					) : (
						<div className="flex min-h-[220px] w-full flex-col items-center justify-center gap-4 p-6 text-center text-sm leading-6 text-[var(--muted)]">
							<p>
								{coordinatesAvailable
									? "La vista previa del mapa no está disponible por ahora."
									: "Sin coordenadas guardadas para mostrar el mapa."}
							</p>
							{googleMapsLink ? (
								<Link
									href={googleMapsLink}
									target="_blank"
									rel="noreferrer"
									className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-50"
								>
									Abrir en Google Maps
								</Link>
							) : null}
						</div>
					)}
				</div>
				{googleMapsLink ? (
					<p className="mt-4 text-sm leading-6 text-[var(--muted)]">
						Si el mapa no carga dentro del sistema, puedes abrir la ubicación
						directamente en Google Maps.
					</p>
				) : null}
			</section>
		</article>
	);
}
