// components/ui/ModalDetalleBase.jsx
import { useEffect } from "react";

const ModalDetalleBase = ({ open, onClose, children, width = "max-w-[400px]" }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Overlay for clicking outside */}
      <div
        className="absolute inset-0 h-screen cursor-default"
        onClick={onClose}
      />

      {/* Modal Container / Bottom Sheet support */}
      <div
        className={`
          relative z-10 w-full ${width}
          max-h-[85vh] md:max-h-[90vh]
          bg-[var(--fill)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl
          animate-in slide-in-from-bottom md:zoom-in-95 duration-300
          overflow-hidden rounded-t-[32px] md:rounded-3xl
          border-t md:border border-white/10
        `}
      >
        {/* Barra de arrastre superior para Mobile */}
        <div className="flex md:hidden justify-center pt-4 pb-2 w-full absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[var(--fill)] to-transparent" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        {/* Contenido scrolleable */}
        <div className="h-full overflow-y-auto custom-scrollbar flex flex-col pt-6 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleBase;
