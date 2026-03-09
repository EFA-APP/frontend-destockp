// components/ui/ModalDetalleBase.jsx
import { useEffect } from "react";

const ModalDetalleBase = ({ open, onClose, children, width = "max-w-[400px]" }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-2">
      {/* Overlay for clicking outside */}
      <div
        className="absolute inset-0 h-screen cursor-default"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative z-10 w-full ${width}
          max-h-full md:max-h-[90vh]
          bg-[var(--fill)] shadow-2xl
          animate-in zoom-in-95 duration-300
          overflow-hidden
        `}
      >
        {/* Contenido scrolleable */}
        <div className="h-full max-h-screen md:max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleBase;
