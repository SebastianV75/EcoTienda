import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusFeedback } from "@/components/ui/status-feedback";
import { DownloadShortcuts } from "@/features/projects/download-shortcuts";
import { PostSaleStepper } from "@/features/projects/post-sale-stepper";
import { ProjectStageForm } from "@/features/projects/project-stage-form";
import {
	projectStageBadgeClasses,
	projectStageLabels,
	type Project,
} from "@/types/project";

type ProjectCardProps = {
	project: Project;
	followUpReason?: string | null;
};

function getStageActions(project: Project) {
	switch (project.stage) {
		case "agenda":
			return (
				<Link
					href="/agenda"
					className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
				>
					Abrir agenda
				</Link>
			);
		case "visita":
			return (
				<Link
					href="/admin/visits"
					className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
				>
					Ver visitas técnicas
				</Link>
			);
		case "cotizacion":
			return (
				<span className="flex flex-wrap gap-3">
					{project.quotation_id ? (
						<Link
							href={`/admin/quotations/${project.quotation_id}`}
							className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
						>
							Ver cotización
						</Link>
					) : null}
					<Link
						href={`/admin/quotations/new?trabajoId=${encodeURIComponent(project.id)}`}
						className="text-sm font-medium text-[var(--brand-strong)] underline-offset-4 hover:underline"
					>
						Crear cotización
					</Link>
				</span>
			);
		default:
			return null;
	}
}

export function ProjectCard({ project, followUpReason }: ProjectCardProps) {
	const showDownloads =
		project.stage === "venta" ||
		project.stage === "descargables" ||
		project.stage === "post_venta";

	return (
		<Card className="p-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<p className="text-lg font-semibold tracking-[-0.03em] text-[var(--brand-deep)]">
						{"Trabajo sin nombre"}
					</p>
				</div>
				<Badge className={projectStageBadgeClasses[project.stage]}>
					{projectStageLabels[project.stage]}
				</Badge>
			</div>

			{followUpReason ? (
				<StatusFeedback variant="warning" className="mt-3 px-3 py-2 text-xs font-medium">
					Seguimiento: {followUpReason}
				</StatusFeedback>
			) : null}

			<div className="mt-4 space-y-4">
				{getStageActions(project)}

				{showDownloads ? (
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
							Descargables
						</p>
						<DownloadShortcuts trabajoId={project.id} />
					</div>
				) : null}

				{project.stage === "post_venta" ? (
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-strong)]">
							Pasos post-venta
						</p>
						<PostSaleStepper
							projectId={project.id}
							currentStep={project.post_sale_step}
						/>
					</div>
				) : null}

				<ProjectStageForm projectId={project.id} currentStage={project.stage} />
			</div>
		</Card>
	);
}
