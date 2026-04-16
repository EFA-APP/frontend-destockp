import React from "react";
import { X } from "lucide-react";
import ImportadorPrecios from "../../Secciones/Articulos/Importacion/ImportadorPrecios";

const ModalImportarListaPrecios = ({ open, onClose, onExito }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-[var(--surface)] border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              Motor de Importación de Precios
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              Actualizá costos y márgenes de forma masiva mediante Excel.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 bg-gradient-to-b from-transparent to-black/20">
          <ImportadorPrecios onExito={onExito} />
        </div>

      </div>
    </div>
  );
};

export default ModalImportarListaPrecios;
