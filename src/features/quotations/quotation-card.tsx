"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useActionState, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { deleteQuotationAction } from "./actions";
import type { QuotationListItem } from "./data";

type QuotationCardProps = {
  quotation: QuotationListItem;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return day + "/" + month + "/" + year;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getStatusConfig(status: string) {
  switch (status) {
    case "draft":
      return {
        label: "Borrador",
        className: "bg-slate-100 text-slate-700",
      };
    case "sent":
      return {
        label: "Enviada",
        className: "bg-blue-100 text-blue-700",
      };
    case "accepted":
      return {
        label: "Aceptada",
        className: "bg-emerald-100 text-emerald-700",
      };
    case "rejected":
      return {
        label: "Rechazada",
        className: "bg-rose-100 text-rose-700",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700",
      };
  }
}

const DotsIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l3.5 3.5m-2-5a2.5 2.5 0 113.5 3.5L6.5 21H3v-3.5L16 3.7z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.9 12A2 2 0 0116 21H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export function QuotationCard({ quotation }: QuotationCardProps) {
  const statusConfig = getStatusConfig(quotation.status);
  const createdDate = formatDate(quotation.created_at);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  const [deleteState, deleteAction, isDeletingAction] = useActionState(
    deleteQuotationAction,
    { error: null, success: false },
  );

  const isDeleted = deleteState.success;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  async function handleDelete() {
    setIsDropdownOpen(false);
    startTransition(() => {
      deleteAction(quotation.id);
    });
  }

  return (
    <AnimatePresence mode="wait">
      {!isDeleted && (
        <motion.article
          key={quotation.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative"
        >
          <article className="relative rounded-[26px] border border-[var(--border-soft)] bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(13,79,46,0.09)] relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
                  Cotizaci\u00f3n
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--brand-deep)]">
                  {quotation.quotation_number ?? "Sin n\u00famero"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-medium " + statusConfig.className}>
                  {statusConfig.label}
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    ref={dropdownButtonRef}
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="rounded-full bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-emerald-100"
                    aria-label="Opciones de cotización"
                    aria-expanded={isDropdownOpen}
                  >
                    <DotsIcon />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-[14px] border border-[var(--border-soft)] bg-white shadow-lg py-1 z-50 animate-fade-in">
                      <Link
                        href={"/admin/quotations/" + quotation.id + "/edit"}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--brand-deep)] hover:bg-emerald-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <EditIcon />
                        Editar
                      </Link>
                      <hr className="border-[var(--border-soft)] my-1" />
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeletingAction}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <DeleteIcon />
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <div>
                <dt className="font-medium text-[var(--brand-deep)]">Cliente</dt>
                <dd>{quotation.project ?? "No especificado"}</dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--brand-deep)]">Total</dt>
                <dd className="text-lg font-semibold text-[var(--brand-deep)]">
                  {formatCurrency(quotation.total)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--brand-deep)]">Fecha</dt>
                <dd>{createdDate}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={"/admin/quotations/" + quotation.id}
                className="inline-flex rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-deep)] transition duration-200 ease-out hover:border-emerald-200"
              >
                Ver detalles
              </Link>
              {quotation.pdf_url && (
                <a
                  href={"/api/quotations/" + quotation.id + "/pdf"}
                  className="inline-flex rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_18px_35px_rgba(47,179,20,0.22)] transition duration-200 ease-out hover:bg-[var(--brand-strong)]"
                >
                  Descargar PDF
                </a>
              )}
            </div>
          </article>
        </motion.article>
      )}
    </AnimatePresence>
  );
}