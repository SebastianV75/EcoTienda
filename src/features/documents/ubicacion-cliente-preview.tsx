"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { DocumentPreviewSubject } from "./preview-data";

type UbicacionClientePreviewProps = {
	client: DocumentPreviewSubject;
	companyName: string;
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

function hasValidCoordinates(client: DocumentPreviewSubject) {
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

function SectionCard({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-[28px] border border-[var(--border-soft)] bg-white p-6 shadow-sm sm:p-7 print:break-inside-avoid print:rounded-none print:border print:border-neutral-300 print:p-4 print:shadow-none">
			<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)] print:text-neutral-700">
				{title}
			</p>
			<div className="mt-4 print:mt-3">{children}</div>
		</section>
	);
}

export function UbicacionClientePreview({
	client,
	companyName,
	mapApiKey,
}: UbicacionClientePreviewProps) {
	const [mapFailed, setMapFailed] = useState(false);
	const identityFields: IdentityField[] = [
		{ label: "Nombre del titular", value: formatField(client.full_name) },
		{ label: "Número de servicio", value: formatField(client.rpu) },
		{ label: "RFC", value: formatField(client.rfc) },
		{ label: "Teléfono", value: formatField(client.phone) },
		{ label: "Dirección", value: formatField(client.address) },
		{ label: "Colonia", value: formatField(client.neighborhood) },
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
		<article className="mx-auto w-full max-w-[940px] space-y-4 text-black print:max-w-none print:space-y-3">
			<section className="rounded-[30px] border border-emerald-100 bg-white p-6 shadow-[0_22px_55px_rgba(13,79,46,0.08)] sm:p-8 print:rounded-none print:border print:border-neutral-300 print:p-5 print:shadow-none">
				<div className="flex items-center gap-4 border-b border-neutral-200 pb-5 print:pb-4">
					<div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white print:h-14 print:w-14 print:rounded-xl">
						<Image
							src="/ecotienda-logo-temp.png"
							alt={companyName}
							width={64}
							height={64}
							className="h-full w-full object-contain"
							priority
						/>
					</div>
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand-strong)] print:text-neutral-700">
							{companyName}
						</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)] print:text-[24px] print:text-black">
							Ubicación del cliente
						</h1>
					</div>
				</div>

				<div className="mt-5 space-y-4 print:mt-4 print:space-y-3">
					<SectionCard title="Datos del servicio">
						<dl className="grid gap-3 sm:grid-cols-2 print:gap-x-4 print:gap-y-3">
							{identityFields.map((field) => (
								<div
									key={field.label}
									className={field.label === "Dirección" ? "sm:col-span-2" : ""}
								>
									<dt className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 print:text-neutral-600">
										{field.label}
									</dt>
									<dd className="mt-1 text-sm leading-6 text-[var(--brand-deep)] print:text-black">
										{field.value}
									</dd>
								</div>
							))}
						</dl>
					</SectionCard>

					<SectionCard title="Coordenadas y mapa">
						<div className="grid gap-4 print:gap-3">
							<div className="grid gap-3 sm:grid-cols-2 print:gap-x-4 print:gap-y-3">
								<div>
									<p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 print:text-neutral-600">
										Coordenada X
									</p>
									<p className="mt-1 text-sm leading-6 text-[var(--brand-deep)] print:text-black">
										{latitude !== null ? latitude : "Sin dato"}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 print:text-neutral-600">
										Coordenada Y
									</p>
									<p className="mt-1 text-sm leading-6 text-[var(--brand-deep)] print:text-black">
										{longitude !== null ? longitude : "Sin dato"}
									</p>
								</div>
							</div>

							<div className="overflow-hidden rounded-[24px] border border-emerald-100 bg-[var(--surface-strong)] print:rounded-xl print:border-neutral-300 print:bg-white">
								{showStaticMap ? (
									// eslint-disable-next-line @next/next/no-img-element -- Google Static Maps URL is dynamic and this printable preview intentionally uses the direct image response.
									<img
										src={staticMapUrl ?? undefined}
										alt={`Mapa centrado en las coordenadas de ${client.full_name}`}
										className="block h-[300px] w-full object-cover sm:h-[420px] print:h-[360px]"
										loading="eager"
										onError={() => setMapFailed(true)}
									/>
								) : (
									<div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-4 p-6 text-center text-sm leading-6 text-[var(--muted)] sm:min-h-[420px] print:min-h-[360px] print:gap-2 print:p-4 print:text-black">
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
												className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:bg-emerald-50 print:hidden"
											>
												Abrir en Google Maps
											</Link>
										) : null}
									</div>
								)}
							</div>

							{googleMapsLink ? (
								<p className="text-sm leading-6 text-[var(--muted)] print:hidden">
									Si el mapa no carga dentro del sistema, puedes abrir la
									ubicación directamente en Google Maps.
								</p>
							) : null}
						</div>
					</SectionCard>
				</div>
			</section>
		</article>
	);
}
