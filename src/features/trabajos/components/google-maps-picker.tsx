"use client";

import { useState, useEffect, useRef } from "react";

type GoogleMapsPickerProps = {
	name: string;
	defaultValue?: string;
	label?: string;
};

declare global {
	interface Window {
		google?: {
			maps: {
				Map: new (element: HTMLElement, options?: any) => any;
				LatLng: new (lat: number, lng: number) => any;
				Marker: new (options?: any) => any;
				Animation: { DROP: number; BOUNCE: number };
				places?: {
					Autocomplete: new (input: HTMLInputElement, options?: any) => any;
				};
			};
		};
		initGoogleMaps?: () => void;
	}
}

export function GoogleMapsPicker({
	name,
	defaultValue = "",
	label = "📍 Seleccionar ubicación en el mapa",
}: GoogleMapsPickerProps) {
	const [coordinates, setCoordinates] = useState(defaultValue);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const mapRef = useRef<HTMLDivElement>(null);
	const markerRef = useRef<any>(null);
	const mapInstanceRef = useRef<any>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Cargar el script de Google Maps si no está cargado
		if (!window.google?.maps) {
			loadGoogleMapsScript();
		} else {
			setMapLoaded(true);
		}
	}, []);

	useEffect(() => {
		if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
			initializeMap();
		}
	}, [mapLoaded]);

	function loadGoogleMapsScript() {
		const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			setError("Google Maps API key no configurada");
			return;
		}

		setIsLoading(true);

		// Verificar si el script ya se está cargando
		const existingScript = document.querySelector(
			`script[src*="maps.googleapis.com"]`,
		);
		if (existingScript) {
			return;
		}

		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
		script.async = true;
		script.defer = true;

		window.initGoogleMaps = () => {
			setMapLoaded(true);
			setIsLoading(false);
		};

		script.onerror = () => {
			setError("Error al cargar Google Maps");
			setIsLoading(false);
		};

		document.head.appendChild(script);
	}

	async function initializeMap() {
		if (!mapRef.current || !window.google?.maps) return;

		// Coordenadas por defecto (CDMX)
		let defaultLat = 19.4326;
		let defaultLng = -99.1332;

		// Si hay coordenadas por defecto, usarlas
		if (defaultValue && defaultValue.includes(",")) {
			const [lat, lng] = defaultValue.split(",").map(Number);
			if (!isNaN(lat) && !isNaN(lng)) {
				defaultLat = lat;
				defaultLng = lng;
			}
		} else {
			// Intentar obtener ubicación actual
			try {
				const position = await getCurrentPosition();
				defaultLat = position.coords.latitude;
				defaultLng = position.coords.longitude;
			} catch (err) {
				console.log("No se pudo obtener ubicación actual, usando CDMX");
			}
		}

		const center = new window.google.maps.LatLng(defaultLat, defaultLng);

		const map = new window.google.maps.Map(mapRef.current, {
			zoom: 16,
			center: center,
			mapTypeControl: false,
			streetViewControl: false,
			fullscreenControl: false,
		});

		mapInstanceRef.current = map;

		// Crear marker arrastrable
		const marker = new window.google.maps.Marker({
			position: center,
			map: map,
			draggable: true,
			animation: window.google.maps.Animation.DROP,
		});

		markerRef.current = marker;

		// Actualizar coordenadas cuando se arrastra el marker
		marker.addListener("dragend", () => {
			const position = marker.getPosition();
			if (position) {
				const lat = position.lat();
				const lng = position.lng();
				setCoordinates(`${lat},${lng}`);
				map.panTo(position);
			}
		});

		// Actualizar coordenadas cuando se hace click en el mapa
		map.addListener("click", (event: any) => {
			const lat = event.latLng.lat();
			const lng = event.latLng.lng();
			marker.setPosition(event.latLng);
			setCoordinates(`${lat},${lng}`);
		});

		// Configurar autocompletado de búsqueda si existe el input
		if (inputRef.current && window.google.maps.places) {
			const autocomplete = new window.google.maps.places.Autocomplete(
				inputRef.current,
				{ types: ["geocode"] },
			);

			autocomplete.addListener("place_changed", () => {
				const place = autocomplete.getPlace();
				if (place.geometry?.location) {
					const lat = place.geometry.location.lat();
					const lng = place.geometry.location.lng();
					map.panTo(place.geometry.location);
					marker.setPosition(place.geometry.location);
					setCoordinates(`${lat},${lng}`);
				}
			});
		}
	}

	function getCurrentPosition(): Promise<GeolocationPosition> {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject(new Error("Geolocalización no soportada"));
				return;
			}

			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			});
		});
	}

	async function handleUseCurrentLocation() {
		try {
			setIsLoading(true);
			setError(null);

			const position = await getCurrentPosition();
			const lat = position.coords.latitude;
			const lng = position.coords.longitude;

			setCoordinates(`${lat},${lng}`);

			// Centrar mapa en la ubicación actual
			if (mapInstanceRef.current && window.google?.maps) {
				const newCenter = new window.google.maps.LatLng(lat, lng);
				mapInstanceRef.current.panTo(newCenter);
				if (markerRef.current) {
					markerRef.current.setPosition(newCenter);
				}
			}
		} catch (err) {
			setError("No se pudo obtener tu ubicación actual");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<label className="text-sm font-medium text-[var(--brand-deep)]">
					{label}
				</label>

				{/* Buscador de direcciones */}
				<div className="flex gap-2">
					<input
						ref={inputRef}
						type="text"
						placeholder="Buscar dirección..."
						className="flex-1 rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
					<button
						type="button"
						onClick={handleUseCurrentLocation}
						disabled={isLoading}
						className="rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--brand-deep)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isLoading ? "⏳" : "📍"} Mi ubicación
					</button>
				</div>
			</div>

			{/* Mapa */}
			<div
				ref={mapRef}
				className="h-[400px] w-full rounded-[18px] border border-[var(--border-soft)] bg-gray-100"
				style={{ minHeight: "400px" }}
			>
				{!mapLoaded && (
					<div className="flex h-full items-center justify-center">
						<p className="text-sm text-[var(--muted)]">
							{isLoading ? "Cargando mapa..." : "Mapa no disponible"}
						</p>
					</div>
				)}
			</div>

			{/* Coordenadas actuales */}
			{coordinates && (
				<div className="rounded-[12px] bg-emerald-50 px-3 py-2">
					<p className="text-xs text-emerald-700">
						✓ Coordenadas: {coordinates}
					</p>
					<p className="mt-1 text-xs text-emerald-600">
						💡 Arrastra el pin o haz click en el mapa para ajustar
					</p>
				</div>
			)}

			{error && (
				<div className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2">
					<p className="text-xs text-rose-700">⚠ {error}</p>
				</div>
			)}

			<input type="hidden" name={name} value={coordinates} />
		</div>
	);
}
