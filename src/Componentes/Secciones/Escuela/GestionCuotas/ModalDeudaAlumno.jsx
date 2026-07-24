import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDeudaAlumno } from "../../../../Backend/Escuela/hooks/useDeudaAlumno";
import { formatearARS } from "../../../../utils/formatearMoneda";

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Estado real del comprobante (`PENDIENTE_PAGO`/`PARCIALMENTE_ABONADO`/
 * `ABONADO`/`ANULADO`), con "VENCIDA" derivada en frontend con el MISMO
 * criterio que `TablaCuotas.jsx` (`estadoMostrado`): no se inventa un
 * criterio nuevo acá.
 */
const derivarEstadoMostrado = (comprobante, hoyNormalizado) => {
  const { estado, fechaVto } = comprobante;
  if (
    (estado === "PENDIENTE_PAGO" || estado === "PARCIALMENTE_ABONADO") &&
    fechaVto &&
    new Date(fechaVto) < hoyNormalizado
  ) {
    return "VENCIDA";
  }
  if (estado === "PENDIENTE_PAGO") {
    return "EMITIDA";
  }
  return estado;
};

/**
 * Modal con historial de cuotas emitidas (multi-período) de un alumno,
 * para UN tipo de cuota (`codigoCuentaContable`). R29.
 *
 * Reescrito para armar `historialPeriodos` directamente desde los campos
 * del `Comprobante` (`useDeudaAlumno`, fuente de verdad real) en vez de
 * reconstruir Debe/Haber desde asientos contables — ver
 * progress/impl_cuotas-deudas-y-verificacion-cobrar.md.
 */
const ModalDeudaAlumno = ({ alumno, codigoCuentaContable, onClose }) => {
  const { comprobantesCuota, cargandoDeuda } = useDeudaAlumno({
    codigoContacto: alumno.codigo,
    codigoCuentaContable,
  });
  const navigate = useNavigate();

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

  const nombreCompleto =
    alumno.razonSocial ||
    `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();

  const historialPeriodos = useMemo(() => {
    const hoy = new Date();
    const hoyNormalizado = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );

    return comprobantesCuota
      .map((comprobante) => {
        const fechaVto = comprobante.fechaVto
          ? new Date(comprobante.fechaVto)
          : null;
        const anio = fechaVto ? fechaVto.getFullYear() : null;
        const mes = fechaVto ? fechaVto.getMonth() + 1 : null;

        return {
          codigo: comprobante.codigo,
          periodoStr:
            mes != null && anio != null
              ? `${MESES_ES[mes - 1]} ${anio}`
              : "—",
          totalEmitido: comprobante.total ?? 0,
          saldoPendiente: comprobante.saldoPendiente ?? 0,
          estado: derivarEstadoMostrado(comprobante, hoyNormalizado),
          anio,
          mes,
        };
      })
      .sort((a, b) => {
        if (a.anio !== b.anio) return (b.anio ?? 0) - (a.anio ?? 0);
        return (b.mes ?? 0) - (a.mes ?? 0);
      });
  }, [comprobantesCuota]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-md max-w-2xl w-full p-7 shadow-2xl flex flex-col gap-6 max-h-[85vh]">
        <div className="flex flex-col gap-1 pr-8 relative">
          <h2 className="text-xl font-black tracking-tight text-gray-900">
            Historial de deudas
          </h2>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Alumno: <span className="text-gray-900 font-bold">{nombreCompleto}</span>
          </p>
          <button
            onClick={onClose}
            className="absolute -top-2 right-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer text-xl font-black"
          >
            ×
          </button>
        </div>

        {cargandoDeuda ? (
          <div className="flex flex-col gap-2 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : historialPeriodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Sin cuotas emitidas
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Período
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Total Emitido
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Saldo Pendiente
                  </th>
                  <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {historialPeriodos.map((periodo) => {
                  let badge = (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      {periodo.estado}
                    </span>
                  );
                  if (periodo.estado === "ABONADO") {
                    badge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ABONADA
                      </span>
                    );
                  } else if (periodo.estado === "PARCIALMENTE_ABONADO") {
                    badge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        PARCIAL
                      </span>
                    );
                  } else if (periodo.estado === "VENCIDA") {
                    badge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        VENCIDA
                      </span>
                    );
                  } else if (periodo.estado === "ANULADO") {
                    badge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        ANULADA
                      </span>
                    );
                  } else if (periodo.estado === "EMITIDA") {
                    badge = (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        EMITIDA
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={periodo.codigo}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-5 py-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">
                        {periodo.periodoStr}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-right text-gray-500">
                        {formatearARS(periodo.totalEmitido)}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-right text-gray-900 tracking-tight">
                        {formatearARS(periodo.saldoPendiente)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {badge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
          >
            Cerrar panel
          </button>
          {historialPeriodos.some(p => p.saldoPendiente > 0) && (
            <button
              onClick={handleIrACobrar}
              className="flex-1 py-2.5 rounded-md bg-[#1FAE6D] text-white text-xs font-black uppercase tracking-widest hover:bg-[#178F58] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <span>Ir a cobrar (Recibo)</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalDeudaAlumno;
