"use client";

type QuotationTabsProps = {
	activeTab: "products" | "other";
	onTabChange: (tab: "products" | "other") => void;
};

export function QuotationTabs({ activeTab, onTabChange }: QuotationTabsProps) {
	return (
		<div className="border-b border-[var(--border-soft)]">
			<div className="flex gap-6">
				<button
					type="button"
					onClick={() => onTabChange("products")}
					className={`relative px-4 py-4 text-sm font-medium transition duration-200 ${
						activeTab === "products"
							? "text-[var(--brand-deep)]"
							: "text-[var(--muted)] hover:text-[var(--brand-deep)]"
					}`}
				>
					Productos
					{activeTab === "products" && (
						<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)]" />
					)}
				</button>
				<button
					type="button"
					onClick={() => onTabChange("other")}
					className={`relative px-4 py-4 text-sm font-medium transition duration-200 ${
						activeTab === "other"
							? "text-[var(--brand-deep)]"
							: "text-[var(--muted)] hover:text-[var(--brand-deep)]"
					}`}
				>
					Otra información
					{activeTab === "other" && (
						<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand)]" />
					)}
				</button>
			</div>
		</div>
	);
}
