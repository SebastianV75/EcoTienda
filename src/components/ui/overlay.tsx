"use client";

import {
	useEffect,
	useRef,
	useState,
	type PointerEvent,
	type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

let scrollLockCount = 0;
let previousBodyOverflow: string | null = null;

type OverlayProps = {
	open: boolean;
	onCloseAction: () => void;
	children: ReactNode;
	className?: string;
	label?: string;
};

export function Overlay({
	open,
	onCloseAction,
	children,
	className,
	label = "Cerrar",
}: OverlayProps) {
	useEffect(() => {
		if (!open || typeof document === "undefined") return;
		if (scrollLockCount === 0) {
			previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";
		}
		scrollLockCount += 1;
		return () => {
			scrollLockCount -= 1;
			if (scrollLockCount === 0) {
				document.body.style.overflow = previousBodyOverflow ?? "";
				previousBodyOverflow = null;
			}
		};
	}, [open]);

	if (!open) return null;
	return (
		<div className={cn("fixed inset-0 z-50", className)}>
			<button
				type="button"
				aria-label={label}
				onClick={onCloseAction}
				className="absolute inset-0 bg-black/45 backdrop-blur-sm motion-reduce:backdrop-blur-none"
			/>
			{children}
		</div>
	);
}

type DialogProps = OverlayProps & { title: string; titleId?: string };

export function Dialog({
	open,
	onCloseAction,
	title,
	titleId,
	children,
}: DialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const headingId = titleId ?? "dialog-title";
	useEffect(() => {
		if (!open) return;
		triggerRef.current = document.activeElement as HTMLElement;
		const first = panelRef.current?.querySelector<HTMLElement>(
			"button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
		);
		first?.focus();
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onCloseAction();
			if (event.key === "Tab" && panelRef.current) {
				const focusable = Array.from(
					panelRef.current.querySelectorAll<HTMLElement>(
						"button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
					),
				);
				if (
					focusable.length &&
					(event.shiftKey
						? document.activeElement === focusable[0]
						: document.activeElement === focusable.at(-1))
				) {
					event.preventDefault();
					(event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
				}
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			triggerRef.current?.focus();
		};
	}, [open, onCloseAction]);
	return (
		<Overlay
			open={open}
			onCloseAction={onCloseAction}
			className="lg:hidden print:hidden"
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={headingId}
				className="relative z-10 h-full"
			>
				<h2 id={headingId} className="sr-only">
					{title}
				</h2>
				{children}
			</div>
		</Overlay>
	);
}

export function Drawer({
	open,
	onCloseAction,
	title,
	titleId,
	children,
}: DialogProps) {
	const [dragOffset, setDragOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const closeTimerRef = useRef<number | null>(null);
	const dragRef = useRef({
		active: false,
		pointerId: -1,
		startY: 0,
		lastY: 0,
		lastTime: 0,
		velocity: 0,
	});

	useEffect(
		() => () => {
			if (closeTimerRef.current !== null) {
				window.clearTimeout(closeTimerRef.current);
			}
		},
		[],
	);

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerType === "mouse" && event.button !== 0) return;
		if (closeTimerRef.current !== null) {
			window.clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
		event.currentTarget.setPointerCapture(event.pointerId);
		const now = performance.now();
		dragRef.current = {
			active: true,
			pointerId: event.pointerId,
			startY: event.clientY,
			lastY: event.clientY,
			lastTime: now,
			velocity: 0,
		};
		setDragOffset(0);
		setIsDragging(true);
	}

	function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
		const drag = dragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;

		event.preventDefault();
		const now = performance.now();
		const delta = event.clientY - drag.startY;
		const elapsed = Math.max(now - drag.lastTime, 1);
		drag.velocity = ((event.clientY - drag.lastY) / elapsed) * 1000;
		drag.lastY = event.clientY;
		drag.lastTime = now;
		setDragOffset(delta >= 0 ? delta : delta * 0.18);
	}

	function finishDrag(event: PointerEvent<HTMLDivElement>) {
		const drag = dragRef.current;
		if (!drag.active || drag.pointerId !== event.pointerId) return;
		drag.active = false;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		const shouldClose = drag.lastY - drag.startY > 96 || drag.velocity > 720;
		setIsDragging(false);
		if (!shouldClose) {
			setDragOffset(0);
			return;
		}

		setDragOffset(window.innerHeight);
		closeTimerRef.current = window.setTimeout(() => {
			closeTimerRef.current = null;
			setDragOffset(0);
			onCloseAction();
		}, 180);
	}

	return (
		<Dialog
			open={open}
			onCloseAction={onCloseAction}
			title={title}
			titleId={titleId}
		>
			<div
				className={`absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white shadow-[0_-24px_60px_rgba(10,44,21,0.22)] motion-safe:animate-[slide-up_200ms_ease-out] motion-reduce:animate-none ${isDragging ? "transition-none" : "transition-transform duration-200 ease-out motion-reduce:transition-none"}`}
				style={{ transform: `translateY(${dragOffset}px)` }}
			>
				<div
					aria-label="Desliza hacia abajo para cerrar"
					className="flex h-10 touch-none select-none items-center justify-center"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={finishDrag}
					onPointerCancel={finishDrag}
				>
					<div className="h-1.5 w-12 rounded-full bg-[var(--border-soft)]" />
				</div>
				{children}
			</div>
		</Dialog>
	);
}
