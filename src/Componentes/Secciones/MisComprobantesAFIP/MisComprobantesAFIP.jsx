import React from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Upload,
  FileCheck,
  Search,
} from "lucide-react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { ArcaIcono } from "../../../assets/Icons";
import TablaMisComprobantesAFIP from "../../Tablas/MisComprobantesAFIP/TablaMisComprobantesAFIP";

const MisComprobantesAFIP = () => {
  return (
    <div className="w-full py-6 px-6 space-y-5">
      {/* Barra de búsqueda visual (decorativa, sin lógica) */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30"
        />
        <input
          type="text"
          placeholder="Buscar comprobante..."
          disabled
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md text-sm text-black/50 placeholder:text-black/30 cursor-default focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* Panel Superior: Herramientas y Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card bienvenida */}
          <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex flex-col justify-center shadow-sm hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md">
                <ArcaIcono size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Herramienta
                </p>
                <p className="text-sm font-bold text-gray-800">
                  Validación ARCA
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Cargá el reporte ARCA (.xlsx) para verificar qué comprobantes
              están correctamente registrados.
            </p>
          </div>

          {/* Card Pasos */}
          <div className="md:col-span-2 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-md p-5 shadow-sm">
            <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-4">
              ¿Cómo validar tus comprobantes?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Upload,
                  text: "Arrastrá o seleccioná el archivo RECIBIDOS",
                },
                {
                  icon: FileCheck,
                  text: "El sistema lo procesa automáticamente",
                },
                { icon: CheckCircle2, text: "Revisá las inconsistencias" },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/60 p-3 rounded-md border border-[var(--primary)]/10"
                >
                  <div className="min-w-[24px] h-[24px] rounded-md bg-[var(--primary)] text-white text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm shadow-[var(--primary)]/20">
                    {i + 1}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 leading-snug">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dropzone — activa el input oculto dentro de TablaMisComprobantesAFIP */}
        <label
          htmlFor="input-recibidos"
          className="w-full relative group cursor-pointer"
        >
          <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-md transform scale-[0.98] group-hover:scale-100 transition-transform duration-200 ease-out" />
          <div className="relative border-2 border-dashed border-[var(--primary)]/30 group-hover:border-[var(--primary)]/60 bg-white/50 backdrop-blur-sm rounded-md p-8 flex flex-col items-center justify-center gap-4 transition-colors duration-200">
            <div className="p-4 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full group-hover:scale-110 transition-transform duration-200">
              <Upload size={32} strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-gray-800">
                Arrastrá tu archivo{" "}
                <span className="text-[var(--primary)]">RECIBIDOS</span> o{" "}
                <span className="text-[var(--primary)] hover:underline">
                  hacé clic para explorar
                </span>
              </p>
              <p className="text-xs font-semibold text-gray-500">
                Solo archivos RECIBIDOS · Formatos: .xlsx, .xls
              </p>
            </div>
          </div>
        </label>

        {/* Panel principal: Tabla */}
        <div className="bg-white border border-[var(--border-subtle)] rounded-md shadow-sm overflow-hidden flex-1">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] bg-gray-50/50">
            <div className="flex-1">
              <EncabezadoSeccion
                ruta={"Mis Comprobantes AFIP"}
                icono={<ArcaIcono size={20} />}
              />
            </div>
          </div>
          <div className="p-5">
            <TablaMisComprobantesAFIP />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisComprobantesAFIP;
