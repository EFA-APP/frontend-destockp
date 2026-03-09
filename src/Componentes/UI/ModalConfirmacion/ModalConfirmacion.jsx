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
  icono = <AdvertenciaIcono size={40} className="text-amber-500" />
}) => {
  return (
    <ModalDetalleBase open={open} onClose={onClose} width="w-[380px]">
      <div className="bg-gradient-to-b from-[#2b2e33] to-[#1f2226] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center">
          {icono && (
            <div className="mb-4 p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
              {icono}
            </div>
          )}
          <h2 className="text-xl font-bold text-white mb-2">{titulo}</h2>
          <p className="text-gray-400 text-sm leading-relaxed px-2">
            {mensaje}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-black/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl! bg-white/5! hover:bg-white/10! text-white! font-medium transition cursor-pointer"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl! ${colorConfirmar} hover:brightness-110! text-white! font-medium shadow-lg transition cursor-pointer`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </ModalDetalleBase>
  );
};

export default ModalConfirmacion;
