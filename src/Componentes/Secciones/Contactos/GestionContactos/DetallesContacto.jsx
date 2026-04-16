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
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-full max-w-md h-full bg-[#080808] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)]">
              <CuentaIcono size={16} />
            </div>
            <div>
              <h2 className="text-[13px] font-black text-white uppercase tracking-widest">
                Detalles del {contacto.tipoEntidad}
              </h2>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">
                ID: {contacto.codigoSecuencial.toString().padStart(4, "0")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors text-white/20 hover:text-white hover:bg-white/5 border border-white/5"
          >
            <CerrarIcono size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          {/* 1. Perfil Principal */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-black text-white/80">
                {(
                  contacto.nombre?.[0] ||
                  contacto.razonSocial?.[0] ||
                  "?"
                ).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {contacto.razonSocial?.toUpperCase() ||
                  `${contacto.nombre?.toUpperCase()} ${contacto.apellido?.toUpperCase()}`}
              </h3>
              <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mt-1">
                {contacto.tipoEntidad?.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* 2. Información Fiscal */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.15em]">
                  Identidad Fiscal
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-md bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                    Documento
                  </p>
                  <p className="text-[12px] font-bold text-white">
                    {contacto.documento || "No registrado"}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-white/[0.02] border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                    Cond. IVA
                  </p>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[9px] font-black uppercase tracking-tighter">
                    {contacto.condicionIva || "CF"}
                  </span>
                </div>
              </div>
            </section>

            {/* 2.5 Responsable de Facturación */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Responsable de Facturas
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="p-3 rounded-md bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                    Ente Facturador
                  </p>
                  <p className="text-[12px] font-bold text-white">
                    {contacto.enteFacturacion?.razonSocial?.toUpperCase() ||
                      `${contacto.enteFacturacion?.nombre?.toUpperCase() || ""} ${contacto.enteFacturacion?.apellido?.toUpperCase() || ""}`}
                  </p>
                </div>
                <div
                  className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${contacto.enteFacturacion ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-emerald-500/10 text-emerald-500"}`}
                >
                  {contacto.enteFacturacion ? "TERCERO" : "TITULAR"}
                </div>
              </div>
            </section>

            {/* 3. Atributos Dinámicos */}
            {contacto.atributos &&
              Object.keys(contacto.atributos).length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.15em]">
                      Datos Extra
                    </span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(contacto.atributos).map(([key, val]) => (
                      <div
                        key={key}
                        className="p-3 rounded-md bg-white/[0.02] border border-white/5"
                      >
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                          {key}
                        </p>
                        <p className="text-[11px] font-bold text-white/70">
                          {typeof val === "boolean" ? (val ? "SÍ" : "NO") : val}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 4. Vínculos / Relaciones */}
            {contacto.relaciones && contacto.relaciones.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Relaciones
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="space-y-2">
                  {contacto.relaciones.map((rel, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-tighter">
                          {rel.tipo?.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-bold text-white/70">
                          {rel.nombre?.toUpperCase() ||
                            `ID: ${rel.codigoSecuencial}`}{" "}
                          [{rel.entidad?.toUpperCase()}]
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[var(--primary)] transition-all">
                        <CuentaIcono size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
          <button
            onClick={onClose}
            className="w-full py-3 border border-white/10 rounded-md text-[10px] font-black text-white/50 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetallesContacto;
