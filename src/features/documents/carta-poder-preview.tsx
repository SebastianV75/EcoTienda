import Image from "next/image";

import type { DocumentPreviewSubject } from "./preview-data";

type CartaPoderPreviewProps = {
	client: DocumentPreviewSubject;
	powerAcceptorName: string;
	witnessOneName: string;
	witnessTwoName: string;
};

export const DEFAULT_POWER_ACCEPTOR = "";
export const DEFAULT_WITNESS_ONE = "GUILLERMO ORPINEL AGUIRRE";
export const DEFAULT_WITNESS_TWO = "RICARDO LOPEZ BEALL";

function formatField(value: string | null | undefined) {
	const trimmed = (value ?? "").trim();
	return trimmed.length > 0 ? trimmed : "Sin dato";
}

function InlineField({
	value,
	widthClass = "min-w-[180px]",
}: {
	value: string;
	widthClass?: string;
}) {
	return (
		<span
			className={`inline-flex border-b border-black px-2 pb-0.5 font-medium uppercase tracking-[0.02em] ${widthClass}`}
		>
			{value}
		</span>
	);
}

export function CartaPoderPreview({
	client,
	powerAcceptorName,
	witnessOneName,
	witnessTwoName,
}: CartaPoderPreviewProps) {
	const powerAcceptor = formatField(powerAcceptorName);
	const witnessOne = formatField(witnessOneName);
	const witnessTwo = formatField(witnessTwoName);

	return (
		<article className="mx-auto w-full max-w-[900px] rounded-[18px] border border-neutral-300 bg-white p-6 text-[15px] leading-8 text-black shadow-sm sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
			<div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-6 print:pb-5">
				<div className="space-y-2">
					<p className="text-sm font-semibold uppercase tracking-[0.32em]">
						EcoTienda
					</p>
					<h1 className="text-4xl font-bold tracking-[0.08em]">CARTA PODER</h1>
				</div>
				<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white print:h-16 print:w-16 print:rounded-xl print:border-neutral-200">
					<Image
						src="/ecotienda-logo-temp.png"
						alt="EcoTienda"
						width={80}
						height={80}
						className="h-full w-full object-contain"
						priority
					/>
				</div>
			</div>

			<div className="mt-10 space-y-6">
				<p>
					YO <InlineField value={client.full_name} widthClass="min-w-[340px]" />
				</p>
				<p className="font-semibold uppercase">Presente</p>

				<p>
					POR LA PRESENTE OTORGO AL SR(A){" "}
					<InlineField value={powerAcceptor} widthClass="min-w-[260px]" />{" "}
					PODER AMPLIO, CUMPLIDO Y BASTANTE PARA QUE A MI NOMBRE Y
					REPRESENTACIÓN, BAJO MI AUTORIZACIÓN PLENA Y CONSCIENTE DEL TRÁMITE A
					CAMBIO DE MEDIDOR BIDIRECCIONAL ANTE LA COMISIÓN FEDERAL DE
					ELECTRICIDAD (CFE), DE MI DOMICILIO:{" "}
					<InlineField value={formatField(client.address)} widthClass="min-w-[420px]" />
					COLONIA{" "}
					<InlineField value={formatField(client.neighborhood)} widthClass="min-w-[220px]" />
					, CON EL NÚMERO DE SERVICIO (RPU){" "}
					<InlineField value={formatField(client.rpu)} widthClass="min-w-[220px]" />, SIENDO
					MI RFC <InlineField value={formatField(client.rfc)} widthClass="min-w-[220px]" />
				</p>
			</div>

			<div className="mt-24 grid gap-16 sm:grid-cols-2">
				<div className="text-center">
					<div className="mx-auto h-px w-full max-w-[260px] bg-black" />
					<p className="mt-3 text-lg uppercase tracking-[0.04em]">
						OTORGO EL PODER
					</p>
					<p className="mt-12 text-lg uppercase">{client.full_name}</p>
				</div>
				<div className="text-center">
					<div className="mx-auto h-px w-full max-w-[260px] bg-black" />
					<p className="mt-3 text-lg uppercase tracking-[0.04em]">
						ACEPTO EL PODER
					</p>
					<p className="mt-12 text-lg uppercase">{powerAcceptor}</p>
				</div>
			</div>

			<div className="mt-24 grid gap-16 sm:grid-cols-2">
				<div className="text-center">
					<div className="mx-auto h-px w-full max-w-[260px] bg-black" />
					<p className="mt-3 text-lg uppercase">{witnessOne}</p>
					<p className="text-lg uppercase tracking-[0.04em]">TESTIGO</p>
				</div>
				<div className="text-center">
					<div className="mx-auto h-px w-full max-w-[260px] bg-black" />
					<p className="mt-3 text-lg uppercase">{witnessTwo}</p>
					<p className="text-lg uppercase tracking-[0.04em]">TESTIGO</p>
				</div>
			</div>

			<div className="mt-20 h-24 bg-[linear-gradient(160deg,#b6b6b6_0%,#1d1d1d_68%,#5d5d5d_100%)]" />
		</article>
	);
}
