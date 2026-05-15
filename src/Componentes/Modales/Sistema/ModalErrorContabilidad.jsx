import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Settings, ShieldAlert } from "lucide-react";
import { TieneAccion } from "../../UI/TieneAccion/TieneAccion";

const ModalErrorContabilidad = ({
  isOpen,
  onClose,
  mensaje,
  modulo = "VENTAS",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-red-100">
        {/* Cabecera de Advertencia */}
        <div className="bg-red-500 p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
            <AlertCircle size={32} className="text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Error de Configuración
            </h2>
            <p className="text-red-100 text-[11px] font-bold uppercase tracking-widest">
              Módulo Contable Activo
            </p>
          </div>
        </div>

        {/* Cuerpo del Mensaje */}
        <div className="p-8 space-y-6 text-center">
          <div className="p-4 bg-red-50 border border-red-100 rounded-md">
            <p className="text-[14px] font-bold text-red-700 leading-relaxed">
              {mensaje}
            </p>
          </div>

          <p className="text-gray-500 text-[13px] font-medium px-4">
            El sistema está configurado para generar asientos automáticos, pero
            falta definir las cuentas contables para esta operación.
            <span className="block mt-2 font-black text-black">
              Debes completar la configuración para poder facturar.
            </span>
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <TieneAccion accion="REDIRIGIR_CONF_ASIENTOS_CONTABLES">
              <Link
                to="/panel/contabilidad/configuracion"
                onClick={onClose}
                className="w-full h-12 bg-black text-white rounded-md font-black uppercase text-[12px] tracking-widest flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 group"
              >
                <Settings
                  size={18}
                  className="group-hover:rotate-90 transition-transform"
                />
                Configurar Asientos Automáticos
                <ArrowRight size={18} />
              </Link>
            </TieneAccion>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-3">
              <ShieldAlert className="text-amber-500 shrink-0" size={20} />
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-tight text-left">
                No tienes permisos para configurar asientos. Por favor, contacta
                con el administrador del sistema.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full h-12 bg-white text-gray-400 hover:text-gray-600 rounded-md font-black uppercase text-[11px] tracking-widest transition-colors"
            >
              Cerrar y Revisar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalErrorContabilidad;
