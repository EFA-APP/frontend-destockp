import React from "react";
import { X } from "lucide-react";
import ImportadorPrecios from "../../Secciones/Articulos/Importacion/ImportadorPrecios";

const ModalImportarListaPrecios = ({ open, onClose, onExito }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor del Modal — compacto */}
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--surface)] border border-black/10 rounded-xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header slim */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 bg-[var(--surface-hover)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black text-black uppercase tracking-widest">
              Importador de Precios
            </span>
            <span className="text-[10px] font-black bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded uppercase tracking-widest border border-[var(--primary)]/30">
              PRO
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded-md text-black/40 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ImportadorPrecios onExito={onExito} onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ModalImportarListaPrecios;
