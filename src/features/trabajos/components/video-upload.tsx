"use client";

import { useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET_NAME = "visita-images";

type VideoUploadProps = {
	name: string;
	trabajoId: string;
	fieldName: string;
	defaultValue?: string;
	label?: string;
};

export function VideoUpload({
	name,
	trabajoId,
	fieldName,
	defaultValue = "",
	label = "🎬 Subir un video",
}: VideoUploadProps) {
	const [videoUrl, setVideoUrl] = useState(defaultValue);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		setError(null);
		setUploading(true);

		try {
			const supabase = createSupabaseBrowserClient();
			const ext = file.name.split(".").pop() || "mp4";
			const timestamp = Date.now();
			const path = `${trabajoId}/${fieldName}-${timestamp}.${ext}`;

			const { error: uploadError } = await supabase.storage
				.from(BUCKET_NAME)
				.upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type,
				});

			if (uploadError) {
				throw new Error(`Error al subir: ${uploadError.message}`);
			}

			const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
			setVideoUrl(data.publicUrl);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al subir video");
			setVideoUrl("");
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="space-y-2">
			{videoUrl ? (
				<div className="space-y-2">
					<video
						src={videoUrl}
						controls
						className="w-full rounded-[18px] border border-[var(--border-soft)]"
					/>
					<button
						type="button"
						onClick={() => {
							setVideoUrl("");
							if (inputRef.current) {
								inputRef.current.value = "";
							}
						}}
						disabled={uploading}
						className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--brand-deep)] transition duration-200 hover:bg-[rgba(239,246,239,0.96)] disabled:opacity-50"
					>
						Cambiar video
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
				accept="video/*"
				onChange={handleFileChange}
				className="hidden"
				disabled={uploading}
			/>
			<input type="hidden" name={name} value={videoUrl} />
		</div>
	);
}
