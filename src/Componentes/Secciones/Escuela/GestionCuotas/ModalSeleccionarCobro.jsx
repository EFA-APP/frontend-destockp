import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ObtenerDeudasContactoApi } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { formatearARS } from "../../../../utils/formatearMoneda";
import { formatDate } from "../../../../utils/formatters";
import { ArrowRight } from "lucide-react";

/**
 * R105, R106: reescrito para listar las cuotas con `saldoPendiente > 0`
 * obtenidas de comprobantes REALES de `comprobantes-ms` (vía el mismo
 * `obtenerDeudasContacto` genérico que ya usa `Recibos.jsx`), en vez de
 * derivar el saldo de asientos viejos. En lugar de duplicar acá la lógica
 * de selección/mora/pago (que `Recibos.jsx` ya implementa completa, con
 * soporte real de selección múltiple y de un ítem de mora — T62), este
 * modal es un paso previo de confirmación que precarga el contacto en el
 * tab "Recibos" de `/panel/comprobantes/crear` (mismo mecanismo
 * `location.state` ya usado por `Ingresos.jsx` para precargar Notas de
 * Crédito, `origen: "ESCUELA_CUOTAS"`).
 */
const ModalSeleccionarCobro = ({ alumno, onClose }) => {
  const navigate = useNavigate();

  const { data: deudasRaw, isLoading: cargandoDeuda } = useQuery({
    queryKey: ["deudas-cobro-cuota", alumno.codigo],
    queryFn: () => ObtenerDeudasContactoApi(alumno.codigo, undefined),
    enabled: !!alumno?.codigo,
  });
  const deudas = Array.isArray(deudasRaw) ? deudasRaw : [];

  const nombreCompleto =
    alumno.nombreCompleto ||
    alumno.razonSocial ||
    `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();

  const tutorNombre =
    alumno.tutorNombre ||
    (alumno.enteFacturacion
      ? `${alumno.enteFacturacion.nombre ?? ""} ${alumno.enteFacturacion.apellido ?? ""}`.trim()
      : "");

  const handleIrACobrar = () => {
    navigate("/panel/comprobantes/crear", {
      state: {
        origen: "ESCUELA_CUOTAS",
        tipoOperacion: "RECIBOS",
        contacto: {
          ...(alumno.enteFacturacion || alumno),
          codigoUnidadNegocio: alumno.codigoUnidadNegocio
        },
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-2xl w-full p-7 shadow-2xl flex flex-col gap-6 max-h-[85vh]">
        <div className="flex flex-col gap-1 pr-8 relative">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Cobrar cuota
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Se abrirá un Recibo en /panel/comprobantes/crear con este contacto
            precargado, donde vas a poder elegir qué comprobantes cobrar (una o
            varias cuotas) y agregar mora si corresponde.
          </p>
          <button
            onClick={onClose}
            className="absolute -top-2 right-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer text-xl font-black"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-1.5 text-xs font-bold text-gray-600">
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Alumno</span>
            <span className="text-gray-900 font-black text-sm uppercase">{nombreCompleto}</span>
          </p>
          {tutorNombre && (
            <p className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span>Tutor / Responsable</span>
              <span className="text-gray-900 font-black text-sm uppercase">{tutorNombre}</span>
            </p>
          )}
        </div>

        {cargandoDeuda ? (
          <div className="flex flex-col gap-2 py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : deudas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              El alumno no registra comprobantes con saldo deudor
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-lg">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50/80 sticky top-0 border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Comprobante
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    Vto
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Saldo Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                {deudas.map((d) => (
                  <tr key={d.codigo}>
                    <td className="px-4 py-3 text-xs font-bold text-gray-800 uppercase">
                      {d.tipoDescripcionComprobante} {String(d.puntoVenta ?? 0).padStart(5, "0")}-
                      {String(d.numeroComprobante ?? 0).padStart(8, "0")}
                    </td>
                    <td className="px-4 py-3 text-xs text-center text-gray-500 font-semibold">
                      {d.fechaVto ? formatDate(d.fechaVto) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-black text-right text-rose-600">
                      {formatearARS(d.saldoPendiente)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleIrACobrar}
            disabled={deudas.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            <span>Ir a cobrar (Recibo)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarCobro;
