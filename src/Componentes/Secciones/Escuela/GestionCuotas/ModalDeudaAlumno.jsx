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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[80vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
            Historial de deudas — {nombreCompleto}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer text-lg font-black"
          >
            ×
          </button>
        </div>

        {cargandoDeuda ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-black/5 rounded animate-pulse" />
            ))}
          </div>
        ) : historialPeriodos.length === 0 ? (
          <p className="text-md font-bold text-[var(--text-muted)] uppercase tracking-widest py-8 text-center">
            Sin cuotas emitidas
          </p>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--fill-secondary)] sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                    Período
                  </th>
                  <th className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                    Total Emitido
                  </th>
                  <th className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                    Saldo Pendiente
                  </th>
                  <th className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/40 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-[11px] font-bold text-[var(--text-primary)] uppercase">
                        {periodo.periodoStr}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-right text-[var(--text-secondary)]">
                        {formatearARS(periodo.totalEmitido)}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-right text-[var(--text-primary)]">
                        {formatearARS(periodo.saldoPendiente)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${badgeClass}`}>
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
          className="w-full py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalDeudaAlumno;
