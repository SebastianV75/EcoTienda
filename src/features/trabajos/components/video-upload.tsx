"use client";

import { useState, useRef } from "react";

type VideoUploadProps = {
	name: string;
	defaultValue?: string;
	label?: string;
};

export function VideoUpload({ name, defaultValue = "", label = "🎬 Subir un video" }: VideoUploadProps) {
	const [video, setVideo] = useState(defaultValue);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = reader.result as string;
			setVideo(base64);
		};
		reader.readAsDataURL(file);
	}

	return (
		<div className="space-y-2">
			{video ? (
				<div className="space-y-2">
					<video
						src={video}
						controls
						className="w-full rounded-[18px] border border-[var(--border-soft)]"
					/>
					<button
						type="button"
						onClick={() => {
							setVideo("");
							if (inputRef.current) {
								inputRef.current.value = "";
							}
						}}
						className="rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--brand-deep)] transition duration-200 hover:bg-[rgba(239,246,239,0.96)]"
					>
						Cambiar video
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--muted)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)]"
				>
					{label}
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="video/*"
				onChange={handleFileChange}
				className="hidden"
			/>
			<input type="hidden" name={name} value={video} />
		</div>
	);
}
