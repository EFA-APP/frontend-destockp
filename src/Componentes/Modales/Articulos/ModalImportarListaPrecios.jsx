import React from "react";
import { createPortal } from "react-dom";
import { X, FileSpreadsheet } from "lucide-react";
import ImportadorPrecios from "../../Secciones/Articulos/Importacion/ImportadorPrecios";

const ModalImportarListaPrecios = ({ open, onClose, onExito }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenedor del Modal — Premium & Fijo */}
      <div className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header slim */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <FileSpreadsheet size={18} />
            </div>
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              Importador de Precios
            </h2>
            <span className="text-[10px] font-black bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded uppercase tracking-widest border border-[var(--primary)]/30">
              PRO
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-all group"
          >
            <X
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <ImportadorPrecios onExito={onExito} onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalImportarListaPrecios;
