// components/ui/ModalDetalleBase.jsx
import { useEffect } from "react";

const ModalDetalleBase = ({ open, onClose, children, width = "w-[420px]" }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0  backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10 ${width}
          max-h-[85vh]
          bg-transparent
          rounded-md shadow-xl
         
        `}
      >
        {/* Contenido scrolleable */}
        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleBase;
