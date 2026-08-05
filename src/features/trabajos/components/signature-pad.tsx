"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type SignaturePadProps = {
	name: string;
	defaultValue?: string;
};

export function SignaturePad({ name, defaultValue = "" }: SignaturePadProps) {
	const [isVisible, setIsVisible] = useState(!!defaultValue);
	const [signature, setSignature] = useState(defaultValue);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const isDrawingRef = useRef(false);
	const lastPosRef = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		if (!isVisible || !canvasRef.current) return;

		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [isVisible]);

	useEffect(() => {
		if (!isVisible || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		const savedSignature = signature || defaultValue;
		if (savedSignature) {
			const img = new Image();
			img.onload = () => {
				ctx.drawImage(img, 0, 0);
			};
			img.src = savedSignature;
		}
	}, [isVisible, defaultValue, signature]);

	function getPos(event: React.MouseEvent | React.TouchEvent) {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };

		const rect = canvas.getBoundingClientRect();
		const clientX =
			"touches" in event ? event.touches[0].clientX : event.clientX;
		const clientY =
			"touches" in event ? event.touches[0].clientY : event.clientY;

		return {
			x: ((clientX - rect.left) / rect.width) * canvas.width,
			y: ((clientY - rect.top) / rect.height) * canvas.height,
		};
	}

	function startDrawing(event: React.MouseEvent | React.TouchEvent) {
		event.preventDefault();
		isDrawingRef.current = true;
		lastPosRef.current = getPos(event);
	}

	function draw(event: React.MouseEvent | React.TouchEvent) {
		event.preventDefault();
		if (!isDrawingRef.current || !canvasRef.current) return;

		const ctx = canvasRef.current.getContext("2d");
		if (!ctx || !lastPosRef.current) return;

		const pos = getPos(event);
		ctx.beginPath();
		ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
		lastPosRef.current = pos;
	}

	function stopDrawing() {
		if (!isDrawingRef.current) return;
		isDrawingRef.current = false;
		lastPosRef.current = null;

		if (canvasRef.current) {
			const dataUrl = canvasRef.current.toDataURL("image/png");
			setSignature(dataUrl);
		}
	}

	function saveSignature() {
		if (canvasRef.current) {
			setSignature(canvasRef.current.toDataURL("image/png"));
		}
		setIsVisible(false);
	}

	function clearCanvas() {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		setSignature("");
	}

	const signatureOverlay =
		isVisible && typeof document !== "undefined"
			? createPortal(
					<div
						className="fixed inset-0 z-[100] flex items-end bg-black/45 p-3 lg:items-center"
						role="dialog"
						aria-modal="true"
					>
						<div
							ref={panelRef}
							className="relative w-full rounded-[24px] bg-white p-4 shadow-[0_-24px_60px_rgba(10,44,21,0.22)] lg:mx-auto lg:max-w-2xl"
							style={{ touchAction: "none" }}
						>
							<div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--border-soft)]" />
							<p className="mb-2 text-sm font-medium text-[var(--brand-deep)]">
								Dibuja la firma del cliente
							</p>
							<div className="space-y-2">
								<canvas
									ref={canvasRef}
									width={800}
									height={400}
									onMouseDown={startDrawing}
									onMouseMove={draw}
									onMouseUp={stopDrawing}
									onMouseLeave={stopDrawing}
									onTouchStart={startDrawing}
									onTouchMove={draw}
									onTouchEnd={stopDrawing}
									className="aspect-[2/1] w-full rounded-[18px] border border-[var(--border-soft)] bg-white"
									style={{ touchAction: "none" }}
								/>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={clearCanvas}
										className="flex-1 rounded-full bg-[var(--surface)] px-4 py-2 text-sm text-[var(--brand-deep)] transition duration-200 hover:bg-[rgba(239,246,239,0.96)]"
									>
										Limpiar
									</button>
									<button
										type="button"
										onClick={saveSignature}
										className="flex-1 rounded-full bg-[var(--brand)] px-4 py-2 text-sm text-white transition duration-200 hover:bg-[var(--brand-strong)]"
									>
										Guardar firma
									</button>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)
			: null;

	return (
		<div className="space-y-2">
			{!isVisible ? (
				<button
					type="button"
					onClick={() => setIsVisible(true)}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-[var(--muted)] transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)]"
				>
					✍️ Pulsa para firmar
				</button>
			) : null}
			{signatureOverlay}
			<input type="hidden" name={name} value={signature} />
		</div>
	);
}
