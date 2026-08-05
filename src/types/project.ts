export const projectStages = [
	"agenda",
	"visita",
	"cotizacion",
	"venta",
	"descargables",
	"post_venta",
] as const;

export type ProjectStage = (typeof projectStages)[number];

export const postSaleSteps = [
	"sistema_220v",
	"solicitud_contratos",
	"contratos",
	"activacion",
] as const;

export type PostSaleStep = (typeof postSaleSteps)[number];

export type Project = {
	id: string;
	stage: ProjectStage;
	post_sale_step: PostSaleStep | null;
	quotation_id: string | null;
	sold_at: string | null;
	activated_at: string | null;
	stage_entered_at: string;
	created_at: string;
	updated_at: string;
};

export const projectStageLabels: Record<ProjectStage, string> = {
	agenda: "Agenda",
	visita: "Visita",
	cotizacion: "Cotización",
	venta: "Venta",
	descargables: "Descargables",
	post_venta: "Post-venta",
};

export const projectStageBadgeClasses: Record<ProjectStage, string> = {
	agenda: "border-slate-200 bg-slate-50 text-slate-700",
	visita: "border-sky-200 bg-sky-50 text-sky-800",
	cotizacion: "border-violet-200 bg-violet-50 text-violet-800",
	venta: "border-emerald-200 bg-emerald-50 text-emerald-800",
	descargables: "border-amber-200 bg-amber-50 text-amber-800",
	post_venta: "border-teal-200 bg-teal-50 text-teal-800",
};

export const postSaleStepLabels: Record<PostSaleStep, string> = {
	sistema_220v: "Sistema 220V",
	solicitud_contratos: "Solicitud contratos",
	contratos: "Contratos",
	activacion: "Activación",
};
