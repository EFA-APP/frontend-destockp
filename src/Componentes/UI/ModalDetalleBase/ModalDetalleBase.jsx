// components/ui/ModalBase.jsx
const ModalDetalleBase = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[var(--fill)]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenido */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}


export default ModalDetalleBase;