"use client";

import { useState, useRef, useEffect } from "react";

type DatePickerProps = {
	id: string;
	name: string;
	value?: string | null;
	onChange?: (value: string) => void;
	placeholder?: string;
};

const MONTH_NAMES = [
	"Enero",
	"Febrero",
	"Marzo",
	"Abril",
	"Mayo",
	"Junio",
	"Julio",
	"Agosto",
	"Septiembre",
	"Octubre",
	"Noviembre",
	"Diciembre",
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string): string {
	if (!dateString) return "";
	const date = new Date(dateString + "T00:00:00");
	return date.toLocaleDateString("es-MX", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

export function DatePicker({
	id,
	name,
	value,
	onChange,
	placeholder = "Seleccionar fecha",
}: DatePickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<string>(value ?? "");
	const [currentMonth, setCurrentMonth] = useState(() => {
		if (value) {
			const date = new Date(value + "T00:00:00");
			return { year: date.getFullYear(), month: date.getMonth() };
		}
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() };
	});
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		function handleEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen]);

	function handleDateSelect(day: number) {
		const newDate = formatDate(
			new Date(currentMonth.year, currentMonth.month, day),
		);
		setSelectedDate(newDate);
		setIsOpen(false);
		onChange?.(newDate);
	}

	function handlePreviousMonth() {
		setCurrentMonth((prev) => {
			const month = prev.month === 0 ? 11 : prev.month - 1;
			const year = prev.month === 0 ? prev.year - 1 : prev.year;
			return { year, month };
		});
	}

	function handleNextMonth() {
		setCurrentMonth((prev) => {
			const month = prev.month === 11 ? 0 : prev.month + 1;
			const year = prev.month === 11 ? prev.year + 1 : prev.year;
			return { year, month };
		});
	}

	function handleToday() {
		const today = new Date();
		const newDate = formatDate(today);
		setSelectedDate(newDate);
		setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() });
		setIsOpen(false);
		onChange?.(newDate);
	}

	function handleClear() {
		setSelectedDate("");
		setIsOpen(false);
		onChange?.("");
	}

	const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
	const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
	const days = [];

	for (let i = 0; i < firstDay; i++) {
		days.push(<div key={`empty-${i}`} />);
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const dateString = formatDate(
			new Date(currentMonth.year, currentMonth.month, day),
		);
		const isSelected = selectedDate === dateString;
		const isToday = dateString === formatDate(new Date());

		days.push(
			<button
				key={day}
				type="button"
				aria-label={formatDisplayDate(dateString)}
				aria-pressed={isSelected}
				onClick={() => handleDateSelect(day)}
				className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
					isSelected
						? "bg-[var(--brand)] text-white"
						: isToday
							? "bg-emerald-50 text-[var(--brand-deep)] hover:bg-emerald-100"
							: "text-[var(--foreground)] hover:bg-[var(--surface)]"
				}`}
			>
				{day}
			</button>,
		);
	}

	return (
		<div ref={containerRef} className="relative">
			<input id={id} type="hidden" name={name} value={selectedDate} />
			<button
				type="button"
				aria-controls={`${id}-calendar`}
				aria-expanded={isOpen}
				aria-haspopup="dialog"
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full rounded-[18px] border bg-white px-4 py-3 text-left text-[var(--foreground)] outline-none transition duration-200 ease-out focus:border-emerald-300 ${isOpen ? "border-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" : "border-[var(--border-soft)]"}`}
			>
				<div className="flex items-center justify-between">
					<span
						className={
							selectedDate ? "text-[var(--foreground)]" : "text-[var(--muted)]"
						}
					>
						{selectedDate ? formatDisplayDate(selectedDate) : placeholder}
					</span>
					<svg
						className="h-5 w-5 text-[var(--muted)]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			</button>

			{isOpen && (
				<div
					id={`${id}-calendar`}
					role="dialog"
					aria-label="Calendario de vigencia"
					className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-[22px] border border-[var(--border-soft)] bg-white p-3 shadow-[0_18px_45px_rgba(13,79,46,0.16)] sm:p-4"
				>
					<div className="mb-4 flex items-center justify-between">
						<button
							type="button"
							aria-label="Mes anterior"
							onClick={handlePreviousMonth}
							className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-deep)]"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<span className="text-sm font-semibold text-[var(--brand-deep)]">
							{MONTH_NAMES[currentMonth.month]} {currentMonth.year}
						</span>
						<button
							type="button"
							aria-label="Mes siguiente"
							onClick={handleNextMonth}
							className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--brand-deep)]"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>

					<div className="mb-2 grid grid-cols-7 gap-1">
						{DAY_NAMES.map((day) => (
							<div
								key={day}
								className="text-center text-xs font-medium text-[var(--muted)]"
							>
								{day}
							</div>
						))}
					</div>

					<div className="grid grid-cols-7 gap-1">{days}</div>

					<div className="mt-3 grid grid-cols-2 gap-2">
						<button
							type="button"
							onClick={handleToday}
							className="rounded-full bg-[var(--surface)] py-2 text-sm font-medium text-[var(--brand-deep)] transition hover:bg-emerald-100"
						>
							Hoy
						</button>
						<button
							type="button"
							onClick={handleClear}
							disabled={!selectedDate}
							className="rounded-full border border-[var(--border-soft)] py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Limpiar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
