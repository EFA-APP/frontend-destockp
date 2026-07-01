import { useMemo } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useDeudaAlumno } from "../../../../Backend/Escuela/hooks/useDeudaAlumno";
import { formatearARS } from "../../../../utils/formatearMoneda";
import { formatDate } from "../../../../utils/formatters";

/**
 * Modal con historial de cuotas emitidas de un alumno (referencia CUOTA-*).
 * R29
 */
const ModalDeudaAlumno = ({ alumno, onClose }) => {
  const { usuario } = useAuthStore();
  const { asientosCuota, cargandoDeuda } = useDeudaAlumno({
    codigoEmpresa: usuario?.codigoEmpresa,
    codigoContacto: alumno.codigoSecuencial,
  });

  const nombreCompleto =
    alumno.razonSocial ||
    `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();

  const historialPeriodos = useMemo(() => {
    const grupos = {};
    for (const asiento of asientosCuota) {
      const ref = asiento.referencia;
      if (!ref) continue;
      if (!grupos[ref]) {
        grupos[ref] = {
          referencia: ref,
          fecha: asiento.fecha,
          detalles: [],
        };
      }
      if (asiento.detalles) {
        grupos[ref].detalles.push(...asiento.detalles);
      }
    }

    const list = [];
    const MESES_ES = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    for (const ref in grupos) {
      let totalDebe = 0;
      let totalHaber = 0;
      for (const d of grupos[ref].detalles) {
        if (
          d.codigoCuentaContable === 507 ||
          d.nombreCuentaContable?.includes("PADRE") ||
          d.nombreCuentaContable?.includes("Padre")
        ) {
          totalDebe += d.debe ?? 0;
          totalHaber += d.haber ?? 0;
        }
      }

      const saldoPendiente = Math.max(0, totalDebe - totalHaber);
      const partes = ref.split("-");
      const anio = Number(partes[partes.length - 2]);
      const mes = Number(partes[partes.length - 1]);

      const vencimiento = new Date(anio, mes - 1, 10);
      const hoy = new Date();
      const hoyNorm = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

      let estado = "EMITIDA";
      if (saldoPendiente <= 0) {
        estado = "ABONADO";
      } else if (saldoPendiente < totalDebe) {
        estado = "PARCIAL";
      } else if (hoyNorm > vencimiento) {
        estado = "VENCIDA";
      }

      list.push({
        referencia: ref,
        periodoStr: `${MESES_ES[mes - 1]} ${anio}`,
        fecha: grupos[ref].fecha,
        totalEmitido: totalDebe,
        saldoPendiente,
        estado,
        anio,
        mes,
      });
    }

    return list.sort((a, b) => b.anio !== a.anio ? b.anio - a.anio : b.mes - a.mes);
  }, [asientosCuota]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-2xl w-full p-7 shadow-2xl flex flex-col gap-6 max-h-[85vh]">
        <div className="flex flex-col gap-1 pr-8 relative">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Historial de deudas
          </h2>
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Alumno: <span className="text-gray-900">{nombreCompleto}</span>
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
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-lg">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50/80 sticky top-0 border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Período
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Total Emitido
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Saldo Pendiente
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                {historialPeriodos.map((periodo) => {
                  let badgeClass = "bg-sky-100 text-sky-700 border-sky-200";
                  if (periodo.estado === "ABONADO") {
                    badgeClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
                  } else if (periodo.estado === "PARCIAL") {
                    badgeClass = "bg-amber-100 text-amber-700 border-amber-200";
                  } else if (periodo.estado === "VENCIDA") {
                    badgeClass = "bg-rose-100 text-rose-700 border-rose-200";
                  }

                  return (
                    <tr
                      key={periodo.referencia}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-bold text-gray-800 uppercase">
                        {periodo.periodoStr}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-right text-gray-500">
                        {formatearARS(periodo.totalEmitido)}
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-right text-gray-800">
                        {formatearARS(periodo.saldoPendiente)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${badgeClass}`}>
                          {periodo.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
        >
          Cerrar panel
        </button>
      </div>
    </div>
  );
};

export default ModalDeudaAlumno;
