"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type SettingsSectionsProps = {
	account: ReactNode;
	company?: ReactNode;
};

type SettingsTab = "account" | "company";

export function SettingsSections({ account, company }: SettingsSectionsProps) {
	const hasCompany = Boolean(company);
	const [activeTab, setActiveTab] = useState<SettingsTab>("account");
	const showingCompany = hasCompany && activeTab === "company";

	return (
		<div className="space-y-5">
			<div
				role="tablist"
				aria-label="Secciones de configuración"
				className="grid grid-cols-2 rounded-[22px] border border-[var(--border-soft)] bg-[rgba(244,248,242,0.8)] p-1.5 shadow-sm"
			>
				<button
					type="button"
					role="tab"
					id="settings-account-tab"
					aria-selected={!showingCompany}
					aria-controls="settings-account-panel"
					tabIndex={!showingCompany ? 0 : -1}
					onClick={() => setActiveTab("account")}
					className={`rounded-[16px] px-3 py-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-strong)] ${
						!showingCompany
							? "bg-white text-[var(--brand-deep)] shadow-sm"
							: "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--brand-deep)]"
					}`}
				>
					Mi cuenta
				</button>
				{hasCompany ? (
					<button
						type="button"
						role="tab"
						id="settings-company-tab"
						aria-selected={showingCompany}
						aria-controls="settings-company-panel"
						tabIndex={showingCompany ? 0 : -1}
						onClick={() => setActiveTab("company")}
						className={`rounded-[16px] px-3 py-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-strong)] ${
							showingCompany
								? "bg-white text-[var(--brand-deep)] shadow-sm"
								: "text-[var(--muted)] hover:bg-white/70 hover:text-[var(--brand-deep)]"
						}`}
					>
						Mi empresa
					</button>
				) : null}
			</div>

			<div
				key={showingCompany ? "company" : "account"}
				role="tabpanel"
				id={showingCompany ? "settings-company-panel" : "settings-account-panel"}
				aria-labelledby={showingCompany ? "settings-company-tab" : "settings-account-tab"}
				className="settings-tab-panel"
			>
				{showingCompany ? company : account}
			</div>
		</div>
	);
}
