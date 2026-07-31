"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: ReactNode };
export function Tabs({
	tabs,
	value,
	onChange,
	label = "Pestañas",
}: {
	tabs: Tab[];
	value: string;
	onChange: (id: string) => void;
	label?: string;
}) {
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const moveFocus = (index: number) => {
		const nextIndex = (index + tabs.length) % tabs.length;
		const nextTab = tabs[nextIndex];
		if (!nextTab) return;
		onChange(nextTab.id);
		tabRefs.current[nextIndex]?.focus();
	};
	const handleKeyDown = (
		event: KeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		if (event.key === "ArrowRight" || event.key === "ArrowDown") {
			event.preventDefault();
			moveFocus(index + 1);
		} else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
			event.preventDefault();
			moveFocus(index - 1);
		} else if (event.key === "Home") {
			event.preventDefault();
			moveFocus(0);
		} else if (event.key === "End") {
			event.preventDefault();
			moveFocus(tabs.length - 1);
		}
	};

	return (
		<div className="border-b border-[var(--border-soft)]">
			<div
				role="tablist"
				aria-label={label}
				className="flex gap-2 overflow-x-auto"
			>
				{tabs.map((tab, index) => (
					<button
						key={tab.id}
						ref={(element) => {
							tabRefs.current[index] = element;
						}}
						type="button"
						role="tab"
						id={`tab-${tab.id}`}
						aria-controls={`tabpanel-${tab.id}`}
						aria-selected={value === tab.id}
						tabIndex={value === tab.id ? 0 : -1}
						onClick={() => onChange(tab.id)}
						onKeyDown={(event) => handleKeyDown(event, index)}
						className={cn(
							"relative min-h-11 shrink-0 px-4 text-sm font-medium text-[var(--muted)] transition-colors motion-reduce:transition-none",
							value === tab.id && "text-[var(--brand-deep)]",
						)}
					>
						{tab.label}
						{value === tab.id && (
							<span
								aria-hidden="true"
								className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--brand)]"
							/>
						)}
					</button>
				))}
			</div>
		</div>
	);
}

export function SegmentedControl({
	options,
	value,
	onChange,
	label,
}: {
	options: Tab[];
	value: string;
	onChange: (id: string) => void;
	label: string;
}) {
	return (
		<div
			role="group"
			aria-label={label}
			className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface)] p-1"
		>
			{options.map((option) => (
				<button
					key={option.id}
					type="button"
					aria-pressed={value === option.id}
					onClick={() => onChange(option.id)}
					className={cn(
						"min-h-9 rounded-full px-3 text-sm font-medium text-[var(--muted)]",
						value === option.id &&
							"bg-white text-[var(--brand-deep)] shadow-sm",
					)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
