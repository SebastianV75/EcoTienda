"use client";

import { useState } from "react";

type GeoLocationButtonProps = {
	name: string;
	defaultValue?: string;
};

export function GeoLocationButton({ name, defaultValue = "" }: GeoLocationButtonProps) {
	const [location, setLocation] = useState(defaultValue);
	const [isLoading, setIsLoading] = useState(false);
	const [address, setAddress] = useState("");

	function getLocation() {
		if (!navigator.geolocation) {
			alert("Geolocalización no soportada");
			return;
		}

		setIsLoading(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const coords = `${position.coords.latitude},${position.coords.longitude}`;
				setLocation(coords);
				setIsLoading(false);
			},
			() => {
				alert("No se pudo obtener la ubicación");
				setIsLoading(false);
			},
		);
	}

	const finalValue = location || address;

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				<button
					type="button"
					onClick={getLocation}
					disabled={isLoading}
					className="rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--muted)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isLoading ? "Obteniendo..." : "📍 Añadir ubicación"}
				</button>
				<input
					type="text"
					value={address}
					onChange={(event) => {
						setAddress(event.target.value);
						setLocation("");
					}}
					placeholder="O escribe la dirección"
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
				/>
			</div>
			{location && (
				<p className="text-xs text-[var(--muted)]">Coordenadas: {location}</p>
			)}
			<input type="hidden" name={name} value={finalValue} />
		</div>
	);
}
