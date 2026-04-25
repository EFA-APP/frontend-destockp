import React from "react";
import {
  CerrarIcono,
  CuentaIcono,
  EmailIcono,
  TelefonoIcono,
} from "../../../../assets/Icons";

const DetallesContacto = ({ contacto, onClose }) => {
  if (!contacto) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-end bg-black/50 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-hover)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] shadow-sm">
              <CuentaIcono size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                Detalles del Contacto
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em]">
                EXPEDIENTE:{" "}
                {contacto.codigoSecuencial.toString().padStart(4, "0")} •{" "}
                {contacto.tipoEntidad}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
          {/* 1. Perfil Principal */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-[var(--fill-secondary)] border border-[var(--border-subtle)] flex items-center justify-center shadow-xl relative group">
              <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-3xl group-hover:bg-[var(--primary)]/10 transition-all" />
              <span className="text-4xl font-black text-[var(--primary-emphasis)] relative z-10">
                {(
                  contacto.nombre?.[0] ||
                  contacto.razonSocial?.[0] ||
                  "?"
                ).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight">
                {contacto.razonSocial?.toUpperCase() ||
                  `${contacto.nombre?.toUpperCase()} ${contacto.apellido?.toUpperCase()}`}
              </h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--primary)]/10">
                {contacto.tipoEntidad?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* 2. Información Fiscal */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Información Fiscal
                </span>
                <div className="h-px w-full bg-[var(--border-subtle)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] shadow-sm">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    DOCUMENTO / CUIT
                  </p>
                  <p className="text-[14px] font-bold text-[var(--text-primary)]">
                    {contacto.documento || "NO REGISTRADO"}
                  </p>
                </div>
                <div className="p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] shadow-sm">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    CONDICIÓN IVA
                  </p>
                  <span className="text-[13px] font-black text-[var(--primary-emphasis)] uppercase">
                    {contacto.condicionIva === "RI"
                      ? "Responsable Inscripto"
                      : contacto.condicionIva === "MO"
                        ? "Monotributista"
                        : contacto.condicionIva === "EX"
                          ? "Exento"
                          : "Consumidor Final"}
                  </span>
                </div>
              </div>
            </section>

            {/* 2.5 Responsable de Facturación */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Responsable Administrativo
                </span>
                <div className="h-px w-full bg-[var(--border-subtle)]" />
              </div>
              <div className="p-4 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                    ENTE QUE FACTURA
                  </p>
                  <p className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                    {contacto.enteFacturacion?.razonSocial?.toUpperCase() ||
                      `${contacto.enteFacturacion?.nombre?.toUpperCase() || ""} ${contacto.enteFacturacion?.apellido?.toUpperCase() || ""}` ||
                      "TITULAR DIRECTO"}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${contacto.enteFacturacion ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}
                >
                  {contacto.enteFacturacion ? "TERCERO" : "TITULAR"}
                </div>
              </div>
            </section>

            {/* 3. Atributos Dinámicos */}
            {contacto.atributos &&
              Object.keys(contacto.atributos).length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                      Atributos Adicionales
                    </span>
                    <div className="h-px w-full bg-[var(--border-subtle)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(contacto.atributos).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-4 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] shadow-sm"
                      >
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="text-[13px] font-bold text-[var(--text-primary)]">
                          {typeof val === "boolean"
                            ? val
                              ? "SÍ"
                              : "NO"
                            : typeof val === "number"
                              ? new Intl.NumberFormat("es-AR").format(val)
                              : val || "---"}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 4. Vínculos / Relaciones */}
            {contacto.relaciones && contacto.relaciones.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">
                    Vínculos y Relaciones
                  </span>
                  <div className="h-px w-full bg-[var(--border-subtle)]" />
                </div>
                <div className="space-y-3">
                  {contacto.relaciones.map((rel, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] group hover:border-[var(--primary)]/30 transition-all shadow-sm"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.15em] mb-1">
                          {rel.tipo?.toUpperCase()}
                        </span>
                        <span className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-wide">
                          {rel.nombre?.toUpperCase() ||
                            `ID: ${rel.codigoSecuencial}`}{" "}
                          <span className="text-[10px] text-[var(--text-muted)] ml-1">
                            [{rel.entidad?.toUpperCase()}]
                          </span>
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-md bg-[var(--fill-secondary)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:bg-[var(--primary-subtle)] transition-all shadow-inner">
                        <CuentaIcono size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[var(--border-subtle)] bg-[var(--surface-hover)]">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md text-[12px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetallesContacto;
