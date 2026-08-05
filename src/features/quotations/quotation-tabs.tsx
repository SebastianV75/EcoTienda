"use client";

import { Tabs } from "@/components/ui/tabs";

type QuotationTabsProps = {
	activeTab: "products" | "other";
	onTabChange: (tab: "products" | "other") => void;
};

export function QuotationTabs({ activeTab, onTabChange }: QuotationTabsProps) {
	return (
		<Tabs
			label="Secciones de cotización"
			value={activeTab}
			onChange={(tab) => onTabChange(tab as QuotationTabsProps["activeTab"])}
			tabs={[
				{ id: "products", label: "Productos" },
				{ id: "other", label: "Proveedor" },
			]}
		/>
	);
}
