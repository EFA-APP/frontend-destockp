// components/ui/ModalDetalleBase.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

const ModalDetalleBase = ({
  open,
  onClose,
  children,
  width = "max-w-[400px]",
}) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
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
          bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          overflow-hidden rounded-t-[24px] md:rounded-[16px]
          border-t md:border border-[var(--color-neutral-border)]
          flex flex-col animate-in fade-in zoom-in-95 duration-200
        `}
      >
        {/* Barra de arrastre superior para Mobile */}
        <div
          className="flex md:hidden justify-center pt-4 pb-2 w-full absolute top-0 left-0 right-0 z-30 bg-white"
          onClick={onClose}
        >
          <div className="w-12 h-1.5 bg-black/10 rounded-full"></div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar flex flex-col pt-6 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ModalDetalleBase;
