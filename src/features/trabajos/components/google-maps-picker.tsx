"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type GoogleMapsPickerProps = {
	name: string;
	defaultValue?: string;
	label?: string;
	googleMapsApiKey?: string | null;
};

type GoogleLatLng = {
	lat: () => number;
	lng: () => number;
};

type GoogleMapClickEvent = {
	latLng: GoogleLatLng;
};

type GoogleMapInstance = {
	panTo: (position: GoogleLatLng) => void;
	addListener: (
		eventName: string,
		handler: (event: GoogleMapClickEvent) => void,
	) => { remove: () => void };
};

type GoogleMarkerInstance = {
	getPosition: () => GoogleLatLng | null;
	setPosition: (position: GoogleLatLng) => void;
	addListener: (
		eventName: string,
		handler: () => void,
	) => { remove: () => void };
};

type GoogleAutocompleteInstance = {
	getPlace: () => { geometry?: { location?: GoogleLatLng } };
	addListener: (
		eventName: string,
		handler: () => void,
	) => { remove: () => void };
};

type GoogleGeocoderResult = {
	geometry?: { location?: GoogleLatLng };
};

type GoogleGeocoderInstance = {
	geocode: (
		request: { address: string },
		callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
	) => void;
};

declare global {
	interface Window {
		google?: {
			maps: {
				Map: new (
					element: HTMLElement,
					options?: Record<string, unknown>,
				) => GoogleMapInstance;
				LatLng: new (lat: number, lng: number) => GoogleLatLng;
				Marker: new (options?: Record<string, unknown>) => GoogleMarkerInstance;
				Animation: { DROP: number; BOUNCE: number };
				marker?: {
					AdvancedMarkerElement: new (
						options?: Record<string, unknown>,
					) => unknown;
					PinElement: new (options?: Record<string, unknown>) => unknown;
				};
				places?: {
					Autocomplete: new (
						input: HTMLInputElement,
						options?: Record<string, unknown>,
					) => GoogleAutocompleteInstance;
				};
				Geocoder: new () => GoogleGeocoderInstance;
				event?: {
					addListener: (
						instance: unknown,
						eventName: string,
						handler: (...args: never[]) => void,
					) => unknown;
					removeListener: (listener: unknown) => void;
				};
			};
		};
		initGoogleMaps?: () => void;
		googleMapsLoaderPromise?: Promise<void>;
	}
}

export function loadGoogleMapsScript(apiKey: string) {
	if (window.google?.maps) {
		return Promise.resolve();
	}

	if (window.googleMapsLoaderPromise) {
		return window.googleMapsLoaderPromise;
	}

	window.googleMapsLoaderPromise = new Promise<void>((resolve, reject) => {
		const scriptId = "google-maps-js";
		const existingScript = document.getElementById(
			scriptId,
		) as HTMLScriptElement | null;
		let settled = false;
		const timeoutId = window.setTimeout(() => {
			if (!settled) {
				settled = true;
				reject(new Error("Timeout al cargar Google Maps."));
			}
		}, 12000);

		const finish = () => {
			if (settled) return;
			if (window.google?.maps) {
				settled = true;
				window.clearTimeout(timeoutId);
				resolve();
			}
		};

		const fail = () => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeoutId);
			reject(new Error("Error al cargar Google Maps."));
		};

		if (existingScript) {
			existingScript.addEventListener("load", finish, { once: true });
			existingScript.addEventListener("error", fail, { once: true });
			window.setTimeout(finish, 100);
			return;
		}

		const script = document.createElement("script");
		script.id = scriptId;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places`;
		script.async = true;
		script.defer = true;
		script.onload = finish;
		script.onerror = fail;
		document.head.appendChild(script);
	}).finally(() => {
		window.googleMapsLoaderPromise = undefined;
	});

	return window.googleMapsLoaderPromise ?? Promise.resolve();
}

export async function geocodeAddress(address: string, apiKey: string) {
	await loadGoogleMapsScript(apiKey);

	const maps = window.google?.maps;
	if (!maps?.Geocoder) {
		throw new Error("El geocodificador de Google Maps no está disponible.");
	}

	return new Promise<{ latitude: number; longitude: number }>(
		(resolve, reject) => {
			const geocoder = new maps.Geocoder();
			geocoder.geocode({ address }, (results, status) => {
				const location = results?.[0]?.geometry?.location;
				if (status !== "OK" || !location) {
					reject(new Error("No se encontró una ubicación para esa dirección."));
					return;
				}

				resolve({ latitude: location.lat(), longitude: location.lng() });
			});
		},
	);
}

export function GoogleMapsPicker({
	name,
	defaultValue = "",
	label = "📍 Seleccionar ubicación en el mapa",
	googleMapsApiKey = null,
}: GoogleMapsPickerProps) {
	const [coordinates, setCoordinates] = useState(defaultValue);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const mapRef = useRef<HTMLDivElement>(null);
	const markerRef = useRef<GoogleMarkerInstance | null>(null);
	const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const scriptLoadedRef = useRef(false);

	const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
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
	}, []);

	const initializeMap = useCallback(async () => {
		if (!mapRef.current || !window.google?.maps) return;

		try {
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
				} catch {
					console.log("No se pudo obtener ubicación actual, usando CDMX");
				}
			}

			const center = new window.google.maps.LatLng(defaultLat, defaultLng);

			// Crear mapa sin mapId (más compatible)
			const map = new window.google.maps.Map(mapRef.current, {
				zoom: 16,
				center: center,
				mapTypeControl: false,
				streetViewControl: false,
				fullscreenControl: false,
				zoomControl: true,
			});

			mapInstanceRef.current = map;

			// Crear marker arrastrable usando Marker clásico (más compatible)
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
			map.addListener("click", (event: GoogleMapClickEvent) => {
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

			setError(null);
		} catch (err) {
			console.error("Error inicializando mapa:", err);
			setError(
				"Error al inicializar el mapa. Verifica la consola para más detalles.",
			);
		}
	}, [defaultValue, getCurrentPosition]);

	useEffect(() => {
		let cancelled = false;
		const apiKey =
			googleMapsApiKey?.trim() ||
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
			null;

		if (!apiKey) {
			window.setTimeout(() => {
				setError("Google Maps API key no configurada en .env.local");
			}, 0);
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setIsLoading(true);
			setError(null);

			loadGoogleMapsScript(apiKey)
				.then(() => {
					if (cancelled) return;
					scriptLoadedRef.current = true;
					setMapLoaded(true);
					setError(null);
				})
				.catch((error) => {
					if (cancelled) return;
					console.error("Error cargando Google Maps:", error);
					setError(
						"No se pudo cargar Google Maps. Verifica tu API key o recarga la página.",
					);
				})
				.finally(() => {
					if (!cancelled) setIsLoading(false);
				});
		}, 0);

		return () => {
			cancelled = true;
			window.clearTimeout(timeoutId);
		};
	}, [googleMapsApiKey]);

	useEffect(() => {
		if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
			initializeMap();
		}
	}, [mapLoaded, initializeMap]);

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
		} catch {
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
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								event.stopPropagation();
							}
						}}
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
				{!mapLoaded && !error && (
					<div className="flex h-full items-center justify-center">
						<p className="text-sm text-[var(--muted)]">
							{isLoading ? "Cargando mapa..." : "Preparando mapa..."}
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
