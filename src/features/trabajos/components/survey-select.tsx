"use client";

import { useState } from "react";

type SurveySelectProps = {
	name: string;
	options: string[];
	defaultValue?: string;
	onChange?: (value: string) => void;
};

export function SurveySelect({ name, options, defaultValue = "", onChange }: SurveySelectProps) {
	const [selected, setSelected] = useState(defaultValue);

	function handleSelect(value: string) {
		setSelected(value);
		onChange?.(value);
	}

	return (
		<div className="space-y-2">
			<div className="space-y-2">
				{options.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => handleSelect(option)}
						className={`w-full rounded-[18px] border px-4 py-3 text-sm font-medium transition duration-200 ${
							selected === option
								? "border-[var(--brand)] bg-[var(--brand)] text-white"
								: "border-[var(--border-soft)] bg-white text-[var(--brand-deep)] hover:border-[var(--brand)] hover:bg-[var(--surface)]"
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
