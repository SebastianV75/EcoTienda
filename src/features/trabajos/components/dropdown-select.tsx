"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DropdownOption = string | {
	label: string;
	href: string;
	download?: boolean;
};

type DropdownSelectProps = {
	name: string;
	options: DropdownOption[];
	defaultValue?: string;
	placeholder?: string;
	description?: string;
	placement?: "auto" | "top" | "bottom";
};

type DropdownPosition = {
	top?: number;
	bottom?: number;
	left: number;
	width: number;
	maxHeight: number;
};

export function DropdownSelect({
	name,
	options,
	defaultValue = "",
	placeholder = "≡ Pulsa para seleccionar",
	description,
	placement = "auto",
}: DropdownSelectProps) {
	const [selected, setSelected] = useState(defaultValue);
	const [isOpen, setIsOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen || typeof document === "undefined") {
			setDropdownPos(null);
			return;
		}

		function updatePosition() {
			if (!buttonRef.current) return;
			const rect = buttonRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const gap = 8;
			const spaceBelow = Math.max(0, viewportHeight - rect.bottom - gap);
			const spaceAbove = Math.max(0, rect.top - gap);
			const reasonableHeight = Math.min(320, Math.max(0, options.length * 48));
			const opensAbove =
				placement === "top" ||
				(placement === "auto" &&
					spaceBelow < reasonableHeight &&
					spaceAbove > spaceBelow);

			setDropdownPos({
				...(opensAbove
					? { bottom: viewportHeight - rect.top + gap }
					: { top: rect.bottom + gap }),
				left: rect.left,
				width: rect.width,
				maxHeight: Math.max(0, Math.min(320, opensAbove ? spaceAbove : spaceBelow)),
			});
		}

		updatePosition();
		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);
		return () => {
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [isOpen, options.length, placement]);

	useEffect(() => {
		if (!isOpen || typeof document === "undefined") return;

		function handleMouseDown(event: MouseEvent) {
			const target = event.target as Node;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(target)
			) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
				buttonRef.current?.focus();
			}
		}

		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div ref={containerRef} className="space-y-2">
			<div className="relative">
				<button
					ref={buttonRef}
					type="button"
					onClick={() => setIsOpen((open) => !open)}
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-left text-sm transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
				>
					{selected || placeholder}
				</button>
			</div>
			{description && (
				<p className="text-xs text-[var(--muted)]">{description}</p>
			)}
			<input type="hidden" name={name} value={selected} />
			{isOpen &&
				dropdownPos &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={dropdownRef}
						role="listbox"
						style={{
							position: "fixed",
							...(dropdownPos.top !== undefined
								? { top: dropdownPos.top }
								: { bottom: dropdownPos.bottom }),
							left: dropdownPos.left,
							width: dropdownPos.width,
							maxHeight: dropdownPos.maxHeight,
						}}
						className="z-[100] overflow-y-auto rounded-[18px] border border-[var(--border-soft)] bg-white shadow-xl"
					>
						{options.map((option) => {
							const label = typeof option === "string" ? option : option.label;

							return typeof option === "string" ? (
								<button
									key={label}
									type="button"
									role="option"
									aria-selected={label === selected}
									onClick={() => {
										setSelected(label);
										setIsOpen(false);
									}}
									className="w-full px-4 py-3 text-left text-sm transition duration-200 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 first:rounded-t-[18px] last:rounded-b-[18px]"
								>
									{label}
								</button>
							) : (
								<a
									key={option.href}
									role="option"
									aria-selected={label === selected}
									href={option.href}
									download={option.download}
									onClick={() => {
										setSelected(defaultValue);
										setIsOpen(false);
									}}
									className="block w-full px-4 py-3 text-left text-sm transition duration-200 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 first:rounded-t-[18px] last:rounded-b-[18px]"
								>
									{label}
								</a>
							);
						})}
					</div>,
					document.body,
				)}
		</div>
	);
}
