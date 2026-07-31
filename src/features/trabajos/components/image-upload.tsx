"use client";

import { useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET_NAME = "visita-images";

type ImageUploadProps = {
	name: string;
	trabajoId: string;
	fieldName: string;
	defaultValue?: string;
};

export function ImageUpload({
	name,
	trabajoId,
	fieldName,
	defaultValue = "",
}: ImageUploadProps) {
	const [imageUrl, setImageUrl] = useState(defaultValue);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const cameraInputRef = useRef<HTMLInputElement>(null);
	const galleryInputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setError(null);
		setUploading(true);

		try {
			const compressedFile = await compressImage(file);

			const supabase = createSupabaseBrowserClient();
			const ext = file.name.split(".").pop() || "jpg";
			const path = `${trabajoId}/${fieldName}-${file.lastModified}-${file.size}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from(BUCKET_NAME)
				.upload(path, compressedFile, {
					cacheControl: "3600",
					upsert: true,
					contentType: compressedFile.type,
				});

			if (uploadError) {
				throw new Error(`Error al subir: ${uploadError.message}`);
			}

			const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
			setImageUrl(data.publicUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al subir imagen");
			setImageUrl("");
		} finally {
			setUploading(false);
			event.target.value = "";
		}
	}

	async function compressImage(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return reject(new Error("El navegador no permite procesar la imagen."));
			const img = new Image();
			const objectUrl = URL.createObjectURL(file);

			img.onload = () => {
				URL.revokeObjectURL(objectUrl);
				const maxSize = 1920;
				let { width, height } = img;
				if (width > maxSize || height > maxSize) {
					if (width > height) { height = (height / width) * maxSize; width = maxSize; }
					else { width = (width / height) * maxSize; height = maxSize; }
				}
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);
				canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo comprimir la imagen.")), "image/jpeg", 0.85);
			};
			img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("La imagen no se pudo decodificar.")); };
			img.src = objectUrl;
		});
	}

	function resetSelection() {
		setImageUrl("");
		if (cameraInputRef.current) {
			cameraInputRef.current.value = "";
		}
		if (galleryInputRef.current) {
			galleryInputRef.current.value = "";
		}
	}

	return (
		<div className="space-y-2">
			{imageUrl ? (
				<div className="space-y-2">
					{/* eslint-disable-next-line @next/next/no-img-element -- preview local/storage image without Next optimization inside form workflow */}
					<img
						src={imageUrl}
						alt="Preview"
						className="aspect-[4/3] w-full rounded-[18px] border border-[var(--border-soft)] object-contain bg-[var(--surface)]"
					/>
					<button
						type="button"
						onClick={resetSelection}
						disabled={uploading}
						className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--brand-deep)] transition duration-200 hover:bg-[rgba(239,246,239,0.96)] disabled:opacity-50"
					>
						Cambiar imagen
					</button>
				</div>
			) : (
				<div className="grid gap-2 sm:grid-cols-2">
					<button
						type="button"
						onClick={() => cameraInputRef.current?.click()}
						disabled={uploading}
						className="rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--brand-deep)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] disabled:opacity-50"
					>
						📷 Cámara
					</button>
					<button
						type="button"
						onClick={() => galleryInputRef.current?.click()}
						disabled={uploading}
						className="rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--brand-deep)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] disabled:opacity-50"
					>
						🖼️ Galería
					</button>
				</div>
			)}

			{error && (
				<p className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{error}
				</p>
			)}

			<input
				ref={cameraInputRef}
				type="file"
				accept="image/*"
				capture="environment"
				onChange={handleFileChange}
				className="hidden"
				disabled={uploading}
			/>
			<input
				ref={galleryInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
				disabled={uploading}
			/>
			<input type="hidden" name={name} value={imageUrl} />
		</div>
	);
}
