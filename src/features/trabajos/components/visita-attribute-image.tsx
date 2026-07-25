"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type VisitaAttributeImageProps = {
	src: string;
	alt: string;
};

export function VisitaAttributeImage({ src, alt }: VisitaAttributeImageProps) {
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return (
			<div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
				Imagen no disponible
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<img
				src={src}
				alt={alt}
				className="w-full rounded-[18px] border border-[var(--border-soft)]"
				onError={() => setHasError(true)}
			/>
			<a
				href={src}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex items-center gap-1.5 text-sm text-[var(--brand)] hover:underline"
			>
				Ver imagen
			</a>
		</div>
	);
}
