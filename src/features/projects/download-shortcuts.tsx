import Link from "next/link";

const documentTemplates = [
	{ slug: "carta-poder", label: "Carta poder" },
	{ slug: "ubicacion-cliente", label: "Ubicación" },
	{ slug: "diagrama-unifilar", label: "Diagrama unifilar" },
] as const;

type DownloadShortcutsProps = {
	clientId: string;
};

export function DownloadShortcuts({ clientId }: DownloadShortcutsProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{documentTemplates.map((template) => (
				<Link
					key={template.slug}
					href={`/admin/documents/${template.slug}/preview?clientId=${encodeURIComponent(clientId)}`}
					className="inline-flex min-h-[36px] items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 transition duration-200 ease-out hover:border-emerald-300 hover:bg-emerald-100"
				>
					{template.label}
				</Link>
			))}
		</div>
	);
}
