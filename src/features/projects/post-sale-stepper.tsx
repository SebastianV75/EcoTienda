"use client";

import { useActionState } from "react";

import {
	advancePostSaleStepAction,
	type ProjectActionState,
} from "@/features/projects/actions";
import {
	postSaleStepLabels,
	postSaleSteps,
	type PostSaleStep,
} from "@/types/project";

const initialState: ProjectActionState = {
	error: null,
};

type PostSaleStepperProps = {
	projectId: string;
	currentStep: PostSaleStep | null;
};

export function PostSaleStepper({ projectId, currentStep }: PostSaleStepperProps) {
	const [state, formAction, isPending] = useActionState(
		advancePostSaleStepAction,
		initialState,
	);

	const currentIndex = currentStep ? postSaleSteps.indexOf(currentStep) : -1;
	const isComplete = currentIndex === postSaleSteps.length - 1;

	return (
		<div className="space-y-3">
			<ol className="space-y-2">
				{postSaleSteps.map((step, index) => {
					const isDone = index < currentIndex;
					const isCurrent = index === currentIndex;

					return (
						<li key={step} className="flex items-center gap-2.5 text-sm">
							<span
								className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
									isDone || isCurrent
										? "border-emerald-300 bg-emerald-100 text-emerald-800"
										: "border-[var(--border-soft)] bg-white text-[var(--muted)]"
								}`}
							>
								{isDone ? "✓" : index + 1}
							</span>
							<span
								className={
									isCurrent
										? "font-semibold text-[var(--brand-deep)]"
										: isDone
											? "text-emerald-800"
											: "text-[var(--muted)]"
								}
							>
								{postSaleStepLabels[step]}
							</span>
						</li>
					);
				})}
			</ol>

			{isComplete ? (
				<p className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
					Post-venta completo. Se archivará automáticamente al mes.
				</p>
			) : (
				<form action={formAction}>
					<input type="hidden" name="project_id" value={projectId} />
					<button
						type="submit"
						disabled={isPending}
						className="inline-flex min-h-[40px] items-center rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_28px_rgba(47,179,20,0.2)] transition duration-200 ease-out hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isPending ? "Avanzando..." : "Completar paso actual"}
					</button>
				</form>
			)}

			{state.error ? (
				<p className="rounded-[16px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
					{state.error}
				</p>
			) : null}
		</div>
	);
}
