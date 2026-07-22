"use client";

import { useState } from "react";

type ToggleGroupProps = {
	name: string;
	options: string[];
	defaultValue?: string;
};

export function ToggleGroup({ name, options, defaultValue = "" }: ToggleGroupProps) {
	const [selected, setSelected] = useState(defaultValue);

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2">
				{options.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => setSelected(option)}
						className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
							selected === option
								? "bg-[var(--brand)] text-white"
								: "bg-[var(--surface)] text-[var(--brand-deep)] hover:bg-[rgba(239,246,239,0.96)]"
						}`}
					>
						{option}
					</button>
				))}
			</div>
			<input type="hidden" name={name} value={selected} />
		</div>
	);
}
