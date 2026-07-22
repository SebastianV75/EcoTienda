"use client";

import { useState } from "react";

type DateTimePickerProps = {
	name: string;
	defaultDate?: string;
	defaultTime?: string;
};

export function DateTimePicker({ name, defaultDate = "", defaultTime = "" }: DateTimePickerProps) {
	const [date, setDate] = useState(defaultDate);
	const [time, setTime] = useState(defaultTime);

	return (
		<div className="space-y-2">
			<div className="flex gap-2">
				<div className="flex-1">
					<input
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</div>
				<div className="flex-1">
					<input
						type="time"
						value={time}
						onChange={(event) => setTime(event.target.value)}
						className="w-full rounded-[18px] border border-[var(--border-soft)] bg-white px-4 py-3 text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300"
					/>
				</div>
			</div>
			{(date || time) && (
				<p className="text-xs text-[var(--muted)]">
					{date && `📅 ${date}`} {time && `🕐 ${time}`}
				</p>
			)}
			<input type="hidden" name={`${name}_date`} value={date} />
			<input type="hidden" name={`${name}_time`} value={time} />
		</div>
	);
}
