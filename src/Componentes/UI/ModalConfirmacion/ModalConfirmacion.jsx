import ModalDetalleBase from "../ModalDetalleBase/ModalDetalleBase";
import { AdvertenciaIcono } from "../../../assets/Icons";

const ModalConfirmacion = ({
  open,
  onClose,
  onConfirm,
  titulo = "Confirmar Acción",
  mensaje = "¿Estás seguro de que deseas realizar esta acción?",
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  colorConfirmar = "bg-red-600!",
  icono = <AdvertenciaIcono size={32} className="text-amber-500" />
}) => {
  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <div className="w-full max-w-[400px] mx-auto overflow-hidden rounded-3xl border border-white/10 bg-[#1a1c1e]/90 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--primary)]/10 blur-[60px] pointer-events-none" />

        <div className="relative px-8 pt-10 pb-8 flex flex-col items-center text-center">
          {icono && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-inner text-[var(--text-theme)]!">
              {icono}
            </div>
          )}

          <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
            {titulo}
          </h2>

          <p className="text-[14px] text-gray-400 font-medium leading-relaxed max-w-[280px]">
            {mensaje}
          </p>
        </div>

        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-2xl! bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer border border-white/5"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-3 rounded-2xl! ${colorConfirmar} hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-red-900/20 transition-all active:scale-95 cursor-pointer`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </ModalDetalleBase>
  );
};

export default ModalConfirmacion;
