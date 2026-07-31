"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { isVisitaVideoValue } from "../visita-attribute-labels";

type VisitaAttributeImageProps = { src: string; alt: string };

function safeExternalUrl(value: string) {
	if (/^data:(?:image|video)\//i.test(value)) return value;
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:" ? value : null;
	} catch {
		return null;
	}
}

export function VisitaAttributeImage({ src, alt }: VisitaAttributeImageProps) {
	const [hasError, setHasError] = useState(false);
	const safeSrc = safeExternalUrl(src);

	if (hasError || !safeSrc) {
		return (
			<div className="rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--muted)]">
				Archivo no disponible
			</div>
		);
	}

	const video = isVisitaVideoValue(safeSrc);
	return (
		<div className="space-y-2">
			{video ? (
				<video
					src={safeSrc}
					controls
					className="block max-h-80 w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] object-contain"
					onError={() => setHasError(true)}
					aria-label={alt}
				/>
			) : (
				<img
					src={safeSrc}
					alt={alt}
					className="block max-h-80 w-full rounded-[18px] border border-[var(--border-soft)] bg-[var(--surface)] object-contain"
					onError={() => setHasError(true)}
				/>
			)}
		</div>
	);
}
