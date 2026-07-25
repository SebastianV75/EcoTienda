"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET_NAME = "visita-images";

type ImageUploadProps = {
	name: string;
	trabajoId: string;
	fieldName: string;
	defaultValue?: string;
	label?: string;
};

export function ImageUpload({
	name,
	trabajoId,
	fieldName,
	defaultValue = "",
	label = "📷 Pulsa para seleccionar",
}: ImageUploadProps) {
	const [imageUrl, setImageUrl] = useState(defaultValue);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setError(null);
		setUploading(true);

		try {
			// Comprimir imagen antes de subir
			const compressedFile = await compressImage(file);

			const supabase = createSupabaseBrowserClient();
			const ext = file.name.split(".").pop() || "jpg";
			const timestamp = Date.now();
			const path = `${trabajoId}/${fieldName}-${timestamp}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from(BUCKET_NAME)
				.upload(path, compressedFile, {
					cacheControl: "3600",
					upsert: false,
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
		}
	}

	async function compressImage(file: File): Promise<Blob> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const img = new Image();

			img.onload = () => {
				// Redimensionar si es muy grande (max 1920px)
				const maxSize = 1920;
				let { width, height } = img;

				if (width > maxSize || height > maxSize) {
					if (width > height) {
						height = (height / width) * maxSize;
						width = maxSize;
					} else {
						width = (width / height) * maxSize;
						height = maxSize;
					}
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						resolve(blob!);
					},
					"image/jpeg",
					0.85, // Calidad 85%
				);
			};

			img.src = URL.createObjectURL(file);
		});
	}

	return (
		<div className="space-y-2">
			{imageUrl ? (
				<div className="space-y-2">
					<img
						src={imageUrl}
						alt="Preview"
						className="w-full rounded-[18px] border border-[var(--border-soft)]"
					/>
					<button
						type="button"
						onClick={() => {
							setImageUrl("");
							if (inputRef.current) {
								inputRef.current.value = "";
							}
						}}
						disabled={uploading}
						className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--brand-deep)] transition duration-200 hover:bg-[rgba(239,246,239,0.96)] disabled:opacity-50"
					>
						Cambiar imagen
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={uploading}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--muted)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] disabled:opacity-50"
				>
					{uploading ? "Subiendo..." : label}
				</button>
			)}

			{error && (
				<p className="rounded-[12px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{error}
				</p>
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				capture="environment"
				onChange={handleFileChange}
				className="hidden"
				disabled={uploading}
			/>
			<input type="hidden" name={name} value={imageUrl} />
		</div>
	);
}
