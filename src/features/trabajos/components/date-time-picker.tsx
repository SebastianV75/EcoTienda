"use client";

import { useState } from "react";

type DateTimePickerProps = {
	name: string;
	defaultDate?: string;
};

export function DateTimePicker({
	name,
	defaultDate = "",
}: DateTimePickerProps) {
	const [date, setDate] = useState(defaultDate);

	return (
		<div className="space-y-2">
			<input
				type="date"
				value={date}
				onChange={(event) => setDate(event.target.value)}
				required
				className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
			/>
			{date ? <p className="text-xs text-[var(--muted)]">📅 {date}</p> : null}
			<input type="hidden" name={`${name}_date`} value={date} />
		</div>
	);
}
