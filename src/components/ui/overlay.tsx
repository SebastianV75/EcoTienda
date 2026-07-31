"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
	return (
		<Dialog
			open={open}
			onCloseAction={onCloseAction}
			title={title}
			titleId={titleId}
		>
			<div className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-[28px] bg-white shadow-[0_-24px_60px_rgba(10,44,21,0.22)] motion-safe:animate-[slide-up_200ms_ease-out] motion-reduce:animate-none">
				<div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[var(--border-soft)]" />
				{children}
			</div>
		</Dialog>
	);
}
