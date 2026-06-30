import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useDeudaAlumno } from "../../../../Backend/Escuela/hooks/useDeudaAlumno";
import { formatearARS } from "../../../../utils/formatearMoneda";
import { formatDate } from "../../../../utils/formatters";
import { FileText, ArrowRight } from "lucide-react";

const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const ModalSeleccionarCobro = ({ alumno, onClose }) => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const { asientosCuota, cargandoDeuda } = useDeudaAlumno({
    codigoEmpresa: usuario?.codigoEmpresa,
    codigoContacto: alumno.codigoSecuencial,
  });

  const [seleccionados, setSeleccionados] = useState({});
  const [montosPago, setMontosPago] = useState({});
  const [morasPago, setMorasPago] = useState({});

  const nombreCompleto =
    alumno.razonSocial ||
    `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();

  const tutorNombre = alumno.tutorNombre || (alumno.enteFacturacion ? `${alumno.enteFacturacion.nombre ?? ""} ${alumno.enteFacturacion.apellido ?? ""}`.trim() : "");

  const cuotasPendientes = useMemo(() => {
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
    for (const ref in grupos) {
      let totalDebe = 0;
      let totalHaber = 0;
      for (const d of grupos[ref].detalles) {
        if (d.codigoCuentaContable === 507 || d.nombreCuentaContable?.includes("PADRE") || d.nombreCuentaContable?.includes("Padre")) {
          totalDebe += d.debe ?? 0;
          totalHaber += d.haber ?? 0;
        }
      }
      const saldoPendiente = totalDebe - totalHaber;
      if (saldoPendiente > 0) {
        const partes = ref.split("-");
        const anio = Number(partes[partes.length - 2]);
        const mes = Number(partes[partes.length - 1]);
        
        const vencimiento = new Date(anio, mes - 1, 10);
        const hoy = new Date();
        const hoyNorm = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const diasAtraso = hoyNorm > vencimiento
          ? Math.floor((hoyNorm - vencimiento) / (1000 * 60 * 60 * 24))
          : 0;

        list.push({
          referencia: ref,
          mes,
          anio,
          saldoPendiente,
          totalEmitido: totalDebe,
          diasAtraso,
          vencimiento,
        });
      }
    }
    return list.sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes);
  }, [asientosCuota]);

  useEffect(() => {
    if (cuotasPendientes.length > 0) {
      const initialMontos = {};
      const initialMoras = {};
      cuotasPendientes.forEach((c) => {
        initialMontos[c.referencia] = c.saldoPendiente;
        initialMoras[c.referencia] = 0;
      });
      setMontosPago((prev) => {
        const next = { ...initialMontos };
        Object.keys(prev).forEach((k) => {
          if (prev[k] !== undefined) next[k] = prev[k];
        });
        return next;
      });
      setMorasPago((prev) => {
        const next = { ...initialMoras };
        Object.keys(prev).forEach((k) => {
          if (prev[k] !== undefined) next[k] = prev[k];
        });
        return next;
      });
    }
  }, [cuotasPendientes]);

  const toggleSeleccion = (ref) => {
    setSeleccionados(prev => ({
      ...prev,
      [ref]: !prev[ref]
    }));
  };

  const handleSiguiente = () => {
    const elegidas = cuotasPendientes.filter(c => seleccionados[c.referencia]);
    if (elegidas.length === 0) return;

    // Generar los ítems para facturar
    const itemsCobro = [];
    const referencias = [];
    const periodos = [];

    for (const c of elegidas) {
      const periodoStr = `${MESES_ES[c.mes - 1]} ${c.anio}`;
      
      const valCuota = montosPago[c.referencia];
      const montoCuota = valCuota === "" || isNaN(valCuota) ? 0 : parseFloat(valCuota);

      const valMora = morasPago[c.referencia];
      const montoMora = valMora === "" || isNaN(valMora) ? 0 : parseFloat(valMora);

      if (montoCuota <= 0 && montoMora <= 0) {
        continue;
      }

      periodos.push(periodoStr);
      referencias.push(c.referencia);

      // Ítem Cuota (Código cuenta contable: 460 / 4106)
      if (montoCuota > 0) {
        itemsCobro.push({
          codigoSecuencial: 460, // codigoSecuencial de la cuenta en contabilidad
          nombre: `Cobro Cuota Período ${periodoStr} - ${nombreCompleto}`,
          precioUnitario: montoCuota,
          cantidad: 1,
        });
      }

      // Ítem Mora (Código cuenta contable: 461 / 4107) si corresponde
      if (montoMora > 0) {
        itemsCobro.push({
          codigoSecuencial: 461, // codigoSecuencial de la cuenta en contabilidad
          nombre: `Recargo por Mora - Período ${periodoStr}`,
          precioUnitario: montoMora,
          cantidad: 1,
        });
      }
    }

    if (itemsCobro.length === 0) return;

    // Prefill observaciones con referencias
    const obs = `Cobro período(s): ${periodos.join(", ")} (Ref: ${referencias.join(", ")})`;

    navigate("/panel/comprobantes/crear", {
      state: {
        origen: "ESCUELA_CUOTAS",
        cliente: alumno,
        itemsCobro,
        observaciones: obs,
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[80vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
            Emitir Comprobante de Pago
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer text-lg font-black"
          >
            ×
          </button>
        </div>

        <div>
          <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
            Alumno: <span className="text-[var(--text-primary)] font-black">{nombreCompleto}</span>
          </p>
          {tutorNombre && (
            <p className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wide mt-1">
              Tutor / Responsable: <span className="text-[var(--text-primary)] font-black">{tutorNombre}</span>
            </p>
          )}
        </div>

        {cargandoDeuda ? (
          <div className="flex flex-col gap-2 py-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-black/5 rounded animate-pulse" />
            ))}
          </div>
        ) : cuotasPendientes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-md font-bold text-[var(--text-muted)] uppercase tracking-widest">
              El alumno no registra cuotas con saldo deudor
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-md">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[var(--fill-secondary)] sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center w-12">
                    Selecc.
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                    Período
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-right">
                    Saldo Pendiente
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center w-36">
                    Abonar Cuota
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center w-32">
                    Abonar Mora
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center">
                    Vto (Día 10)
                  </th>
                  <th className="px-3 py-2.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] text-center">
                    Días Atraso
                  </th>
                </tr>
              </thead>
              <tbody>
                {cuotasPendientes.map((cuota) => {
                  const periodoStr = `${MESES_ES[cuota.mes - 1]} ${cuota.anio}`;
                  const seleccionado = !!seleccionados[cuota.referencia];

                  return (
                    <tr
                      key={cuota.referencia}
                      onClick={() => toggleSeleccion(cuota.referencia)}
                      className={`border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/40 transition-colors cursor-pointer ${
                        seleccionado ? "bg-[var(--fill-secondary)]/60" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => toggleSeleccion(cuota.referencia)}
                          className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
                        />
                      </td>
                      <td className="px-3 py-3 text-[11px] font-bold text-[var(--text-primary)] uppercase">
                        {periodoStr}
                      </td>
                      <td className="px-3 py-3 text-[12px] font-black text-right text-[var(--text-primary)]">
                        {formatearARS(cuota.saldoPendiente)}
                      </td>
                      <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          disabled={!seleccionado}
                          min="0"
                          max={cuota.saldoPendiente}
                          value={montosPago[cuota.referencia] !== undefined ? montosPago[cuota.referencia] : cuota.saldoPendiente}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                            setMontosPago(prev => ({
                              ...prev,
                              [cuota.referencia]: val
                            }));
                          }}
                          className="w-28 text-[11px] font-bold px-2 py-1 border border-[var(--border-subtle)] rounded bg-[var(--surface)] text-[var(--text-primary)] outline-none disabled:opacity-50 text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          disabled={!seleccionado || cuota.diasAtraso <= 0}
                          min="0"
                          value={morasPago[cuota.referencia] !== undefined ? morasPago[cuota.referencia] : 0}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                            setMorasPago(prev => ({
                              ...prev,
                              [cuota.referencia]: val
                            }));
                          }}
                          className="w-24 text-[11px] font-bold px-2 py-1 border border-[var(--border-subtle)] rounded bg-[var(--surface)] text-[var(--text-primary)] outline-none disabled:opacity-50 text-right"
                        />
                      </td>
                      <td className="px-3 py-3 text-[11px] text-center text-[var(--text-secondary)]">
                        {formatDate(cuota.vencimiento)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {cuota.diasAtraso > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                            {cuota.diasAtraso} días
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-md border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-colors cursor-pointer text-[var(--text-secondary)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSiguiente}
            disabled={!cuotasPendientes.some(c => seleccionados[c.referencia])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <span>Generar Comprobante</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarCobro;
