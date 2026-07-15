"use client";

import { useState, useRef, useEffect } from "react";

import type { Supplier } from "@/types/quotation";

type SupplierSearchProps = {
	suppliers: Supplier[];
	onSelect: (supplier: Supplier | null) => void;
	onCreateNew: () => void;
};

export function SupplierSearch({
	suppliers,
	onSelect,
	onCreateNew,
}: SupplierSearchProps) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filtered = suppliers.filter(
		(s) =>
			s.name.toLowerCase().includes(query.toLowerCase()) ||
			s.nif?.toLowerCase().includes(query.toLowerCase()) ||
			s.email?.toLowerCase().includes(query.toLowerCase()) ||
			s.reference?.toLowerCase().includes(query.toLowerCase()),
	);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function handleSelect(supplier: Supplier) {
		setQuery(supplier.name);
		setIsOpen(false);
		onSelect(supplier);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, filtered.length));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, -1));
		} else if (e.key === "Enter" && selectedIndex >= 0) {
			e.preventDefault();
			if (selectedIndex < filtered.length) {
				handleSelect(filtered[selectedIndex]);
			}
		} else if (e.key === "Escape") {
			setIsOpen(false);
		}
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<input
				ref={inputRef}
				type="text"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setIsOpen(true);
					setSelectedIndex(-1);
					if (!e.target.value) {
						onSelect(null);
					}
				}}
				onFocus={() => setIsOpen(true)}
				onKeyDown={handleKeyDown}
				placeholder="Nombre, NIF, correo electrónico o referencia"
				className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
			/>
			{isOpen && (
				<div className="absolute z-50 mt-2 w-full rounded-[18px] border border-[var(--border-soft)] bg-white shadow-lg">
					<div className="max-h-60 overflow-y-auto p-2">
						{filtered.length > 0 ? (
							filtered.map((supplier, index) => (
								<button
									key={supplier.id}
									type="button"
									onClick={() => handleSelect(supplier)}
									className={`w-full rounded-[14px] px-4 py-3 text-left transition duration-150 ${
										index === selectedIndex
											? "bg-emerald-50"
											: "hover:bg-emerald-50"
									}`}
								>
									<p className="text-sm font-medium text-[var(--brand-deep)]">
										{supplier.name}
									</p>
									{supplier.nif && (
										<p className="mt-0.5 text-xs text-[var(--muted)]">
											NIF: {supplier.nif}
										</p>
									)}
									{supplier.email && (
										<p className="text-xs text-[var(--muted)]">
											{supplier.email}
										</p>
									)}
								</button>
							))
						) : (
							<p className="px-4 py-3 text-sm text-[var(--muted)]">
								No se encontraron proveedores
							</p>
						)}
					</div>
					<div className="border-t border-[var(--border-soft)] p-2">
						<button
							type="button"
							onClick={() => {
								setIsOpen(false);
								onCreateNew();
							}}
							className="w-full rounded-[14px] bg-[var(--brand)] px-4 py-3 text-sm font-medium text-white transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
						>
							+ Crear nuevo proveedor
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
