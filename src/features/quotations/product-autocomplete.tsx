"use client";

import { useState, useRef, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { PRODUCT_CATALOG } from "@/features/quotations/product-catalog";

type ProductAutocompleteProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
};

type FilteredCategory = {
	name: string;
	products: string[];
};

type DropdownPosition = {
	top: number;
	left: number;
	width: number;
	maxHeight: number;
};

export function ProductAutocomplete({
	value,
	onChange,
	placeholder = "Nombre del producto",
	className = "",
}: ProductAutocompleteProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const listId = useId();

	function updatePosition() {
		if (!inputRef.current) return;
		const rect = inputRef.current.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - rect.bottom - 8;
		const spaceAbove = rect.top - 8;
		const maxH = Math.min(
			320,
			Math.max(spaceBelow, spaceAbove > spaceBelow ? spaceAbove : spaceBelow),
		);

		setDropdownPos({
			top: rect.bottom + 4,
			left: rect.left,
			width: Math.max(rect.width, 340),
			maxHeight: maxH,
		});
	}

	useEffect(() => {
		if (isOpen) {
			updatePosition();
			const onScroll = () => updatePosition();
			const onResize = () => updatePosition();
			window.addEventListener("scroll", onScroll, true);
			window.addEventListener("resize", onResize);
			return () => {
				window.removeEventListener("scroll", onScroll, true);
				window.removeEventListener("resize", onResize);
			};
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		function handleMouseDown(e: MouseEvent) {
			const target = e.target as Node;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				dropdownRef.current &&
				!dropdownRef.current.contains(target)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, [isOpen]);

	const normalizedQuery = value.trim().toLowerCase();

	const filtered: FilteredCategory[] = PRODUCT_CATALOG.map((cat) => ({
		name: cat.name,
		products: cat.products.filter((p) =>
			p.toLowerCase().includes(normalizedQuery),
		),
	})).filter((cat) => cat.products.length > 0);

	const totalResults = filtered.reduce(
		(sum, cat) => sum + cat.products.length,
		0,
	);

	function handleInputChange(text: string) {
		onChange(text);
		setIsOpen(true);
	}

	function handleSelect(product: string) {
		onChange(product);
		setIsOpen(false);
		inputRef.current?.focus();
	}

	function handleFocus() {
		setIsOpen(true);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Escape") {
			setIsOpen(false);
		}
	}

	const inputClasses = className
		? undefined
		: "w-full rounded-[14px] border border-transparent bg-transparent px-2.5 py-1.5 text-sm outline-none transition duration-200 focus:border-emerald-300 focus:bg-white truncate";

	return (
		<>
			<div ref={containerRef} className="relative">
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					role="combobox"
					aria-expanded={isOpen}
					aria-controls={listId}
					aria-autocomplete="list"
					className={inputClasses}
				/>
			</div>

			{isOpen &&
				totalResults > 0 &&
				dropdownPos &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						id={listId}
						ref={dropdownRef}
						role="listbox"
						style={{
							position: "fixed",
							top: dropdownPos.top,
							left: dropdownPos.left,
							width: dropdownPos.width,
							maxHeight: dropdownPos.maxHeight,
						}}
						className="z-[100] overflow-y-auto rounded-[18px] border border-[var(--border-soft)] bg-white shadow-xl"
					>
						{filtered.map((category) => (
							<div key={category.name}>
								<div className="sticky top-0 z-10 bg-emerald-50/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-strong)] backdrop-blur-sm">
									{category.name}
								</div>
								{category.products.map((product) => (
									<button
										key={product}
										type="button"
										role="option"
										aria-selected={product === value}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => handleSelect(product)}
										className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] transition hover:bg-emerald-50 data-[selected=true]:bg-emerald-50"
										data-selected={product === value}
									>
										{highlightMatch(product, normalizedQuery)}
									</button>
								))}
							</div>
						))}
					</div>,
					document.body,
				)}

			{isOpen &&
				totalResults === 0 &&
				normalizedQuery.length > 0 &&
				dropdownPos &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						style={{
							position: "fixed",
							top: dropdownPos.top,
							left: dropdownPos.left,
							width: dropdownPos.width,
						}}
						className="z-[100] rounded-[18px] border border-[var(--border-soft)] bg-white p-3 shadow-xl"
					>
						<p className="text-xs text-[var(--muted)]">
							Sin resultados. Puedes escribir el nombre manualmente.
						</p>
					</div>,
					document.body,
				)}
		</>
	);
}

function highlightMatch(text: string, query: string): React.ReactNode {
	if (!query) return text;
	const idx = text.toLowerCase().indexOf(query);
	if (idx === -1) return text;

	return (
		<>
			{text.slice(0, idx)}
			<span className="font-semibold text-[var(--brand-deep)] bg-emerald-100/60 rounded-sm px-0.5">
				{text.slice(idx, idx + query.length)}
			</span>
			{text.slice(idx + query.length)}
		</>
	);
}
