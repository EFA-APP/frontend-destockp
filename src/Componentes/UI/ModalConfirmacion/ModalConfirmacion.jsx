import ModalDetalleBase from "../ModalDetalleBase/ModalDetalleBase";
import { AdvertenciaIcono, BorrarIcono } from "../../../assets/Icons";

const ModalConfirmacion = ({
  open,
  onClose,
  onConfirm,
  titulo = "Confirmar Acción",
  mensaje = "¿Estás seguro de que deseas realizar esta acción?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  colorConfirmar = "bg-red-600!",
  isPending = false,
  icono = <BorrarIcono size={32} className="text-amber-700" />,
}) => {
  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <div className="w-full max-w-[400px] mx-auto overflow-hidden rounded-3xl border border-black/10 bg-[var(--fill)]/90 backdrop-blur-xl shadow-2xl    ">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--primary)]/10 blur-[60px] pointer-events-none" />

        <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {icono && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-black/10 shadow-inner text-[var(--text-theme)]!">
              {icono}
            </div>
          )}

          <h2 className="text-2xl font-black text-black mb-3 tracking-tight">
            {titulo}
          </h2>

          <p className="text-[16px] text-gray-400 font-medium leading-relaxed max-w-[280px]">
            {mensaje}
          </p>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-black/5 flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-5 py-3 rounded-md! bg-black/5 hover:bg-black/10 text-black font-bold text-sm border border-black/70 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 px-5 py-3 rounded-md! bg-red-500/20!  hover:brightness-110 text-red-500 font-bold text-sm shadow-lg shadow-red-900/20 border border-red-500/70 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </ModalDetalleBase>
  );
};

export default ModalConfirmacion;
