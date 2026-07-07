import ModalDetalleBase from "../ModalDetalleBase/ModalDetalleBase";
import { BorrarIcono } from "../../../assets/Icons";

const ModalConfirmacion = ({
  open,
  onClose,
  onConfirm,
  titulo = "Confirmar Acción",
  mensaje = "¿Estás seguro de que deseas realizar esta acción?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  isPending = false,
  icono = <BorrarIcono size={32} className="text-red-500" />,
}) => {
  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <div className="w-full max-w-[400px] mx-auto bg-white">
        <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {icono && (
            <div className="mb-6 p-4 rounded-full bg-red-50 text-red-500">
              {icono}
            </div>
          )}

          <h2 className="text-[20px] font-bold text-[var(--color-neutral-text-main)] mb-3 tracking-tight">
            {titulo}
          </h2>

          <p className="text-[15px] text-[var(--color-neutral-text-muted)] font-normal leading-relaxed max-w-[280px]">
            {mensaje}
          </p>
        </div>

        <div className="p-6 bg-[var(--color-neutral-bg)] border-t border-[var(--color-neutral-border)] flex gap-3 rounded-b-[16px]">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-5 py-2.5 rounded-[10px] bg-white hover:bg-gray-50 text-[var(--color-neutral-text-main)] font-semibold text-[14px] border border-[var(--color-neutral-border)] shadow-sm transition-colors disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 px-5 py-2.5 rounded-[10px] bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px] shadow-sm transition-colors disabled:opacity-50`}
          >
            {isPending ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </ModalDetalleBase>
  );
};

export default ModalConfirmacion;
