import React from 'react';

const ModalError = ({ 
  isOpen, 
  onClose, 
  titulo = "Ocurrió un error", 
  mensaje = "No se pudo procesar la solicitud." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1D1C]/40 backdrop-blur-sm transition-opacity">
      {/* Contenedor del Modal */}
      <div 
        className="bg-white rounded-[16px] p-6 w-[90%] max-w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transform transition-all flex flex-col items-center text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Ícono de Error */}
        <div className="w-14 h-14 rounded-full bg-[#EF5A5A]/10 flex items-center justify-center mb-4">
          <svg 
            className="w-7 h-7 text-[#EF5A5A]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Textos respetando jerarquía y colores */}
        <h2 className="text-[20px] font-semibold text-[#1A1D1C] mb-2 font-sans tracking-tight">
          {titulo}
        </h2>
        <p className="text-[14px] text-[#6B7472] mb-6 font-sans leading-relaxed">
          {mensaje}
        </p>

        {/* Botón de Acción */}
        <button 
          onClick={onClose}
          className="w-full bg-[#1FAE6D] hover:bg-[#178F58] text-white font-medium text-[14px] py-2.5 rounded-[12px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1FAE6D]/50 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default ModalError;
