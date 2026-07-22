"use client";

import { useState } from "react";

type DropdownSelectProps = {
	name: string;
	options: string[];
	defaultValue?: string;
	placeholder?: string;
	description?: string;
};

export function DropdownSelect({ name, options, defaultValue = "", placeholder = "≡ Pulsa para seleccionar", description }: DropdownSelectProps) {
	const [selected, setSelected] = useState(defaultValue);
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="space-y-2">
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-sm text-left transition duration-200 hover:border-[var(--brand)] hover:bg-[var(--surface)]"
				>
					{selected || placeholder}
				</button>
				{isOpen && (
					<div className="absolute z-10 mt-2 w-full rounded-[18px] border border-[var(--border-soft)] bg-white shadow-lg">
						{options.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => {
									setSelected(option);
									setIsOpen(false);
								}}
								className="w-full px-4 py-3 text-left text-sm transition duration-200 hover:bg-[var(--surface)] first:rounded-t-[18px] last:rounded-b-[18px]"
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
			{description && (
				<p className="text-xs text-[var(--muted)]">{description}</p>
			)}
			<input type="hidden" name={name} value={selected} />
		</div>
	);
}
