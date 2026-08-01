import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, HandCoins, AlertCircle } from "lucide-react";
import { cuentasCorrientesAPI } from "../../../../Backend/CuentasCorrientes/api";
import { ModalAplicarSaldoAFavor } from "../../../Tablas/Ventas/Comprobantes/ModalAplicarSaldoAFavor";

export const ModalSugerirSaldoAFavor = ({ factura, onClose }) => {
  const [comprobantesAFavor, setComprobantesAFavor] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalAplicar, setMostrarModalAplicar] = useState(false);

  useEffect(() => {
    if (factura?.codigoReceptor) {
      setCargando(true);
      cuentasCorrientesAPI
        .listarComprobantesPorContacto(factura.codigoReceptor, {
          estado: "TODOS",
        })
        .then((res) => {
          const aFavor = (res.comprobantes || []).filter(
            (c) => Number(c.montoDisponible) > 0,
          );
          if (aFavor.length > 0) {
            setComprobantesAFavor(aFavor);
            setCargando(false);
          } else {
            // Si no hay saldo a favor, cerramos silenciosamente para que siga el flujo normal
            onClose();
          }
        })
        .catch((e) => {
          console.error("Error obteniendo saldo a favor:", e);
          onClose(); // En caso de error, también seguimos de largo
        });
    }
  }, [factura, onClose]);

  if (!factura || cargando) return null;
  if (mostrarModalAplicar) {
    return (
      <ModalAplicarSaldoAFavor
        open={true}
        onClose={() => setMostrarModalAplicar(false)}
        factura={{
          ...factura,
          saldoPendiente: factura.saldoPendiente ?? factura.total,
        }}
        comprobantesAFavor={comprobantesAFavor}
        onSuccess={() => {
          setMostrarModalAplicar(false);
          onClose(); // Termina el proceso y continúa al modal de éxito
        }}
      />
    );
  }

  const saldoTotal = comprobantesAFavor.reduce((s, c) => s + Number(c.montoDisponible), 0);

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-sm animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-600" />
            <h3 className="text-sm font-bold text-blue-900">Saldo a Favor Detectado</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 text-center flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            El cliente tiene comprobantes con saldo a favor por un total de:
          </p>
          <p className="text-2xl font-black text-blue-600 font-mono">
            ${saldoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">
            ¿Deseas aplicar este saldo para descontar el importe de la nueva factura?
          </p>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700 transition"
          >
            No, gracias
          </button>
          <button
            onClick={() => setMostrarModalAplicar(true)}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Sí, aplicar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalSugerirSaldoAFavor;
