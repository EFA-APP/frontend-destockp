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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-4xl w-full p-7 shadow-2xl flex flex-col gap-6 max-h-[85vh]">
        <div className="flex flex-col gap-1 pr-8 relative">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Emitir Comprobante de Pago
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Seleccioná las cuotas a cobrar y ajustá los montos o moras si es necesario.
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
        ) : cuotasPendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              El alumno no registra cuotas con saldo deudor
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 border border-[var(--border-subtle)] rounded-lg">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50/80 sticky top-0 border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-12">
                    ✓
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Período
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                    Saldo Pendiente
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-36">
                    Abonar Cuota
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-32">
                    Abonar Mora
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    Vto (Día 10)
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">
                    Días Atraso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] bg-white">
                {cuotasPendientes.map((cuota) => {
                  const periodoStr = `${MESES_ES[cuota.mes - 1]} ${cuota.anio}`;
                  const seleccionado = !!seleccionados[cuota.referencia];

                  return (
                    <tr
                      key={cuota.referencia}
                      onClick={() => toggleSeleccion(cuota.referencia)}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer group ${
                        seleccionado ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => toggleSeleccion(cuota.referencia)}
                          className="w-4 h-4 cursor-pointer accent-[var(--primary)] rounded focus:ring-[var(--primary)]"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-800 uppercase">
                        {periodoStr}
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-right text-rose-600">
                        {formatearARS(cuota.saldoPendiente)}
                      </td>
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full max-w-[120px] mx-auto">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
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
                            className="w-full text-xs font-bold pl-5 pr-2 py-1.5 border border-[var(--border-subtle)] rounded bg-white text-gray-800 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:bg-gray-50 text-right transition-all"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full max-w-[100px] mx-auto">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
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
                            className="w-full text-xs font-bold pl-5 pr-2 py-1.5 border border-[var(--border-subtle)] rounded bg-white text-gray-800 outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50 disabled:bg-gray-50 text-right transition-all"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-center text-gray-500 font-semibold">
                        {formatDate(cuota.vencimiento)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {cuota.diasAtraso > 0 ? (
                          <span className="px-2 py-1 rounded text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                            {cuota.diasAtraso} días
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold">—</span>
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
            className="px-5 py-2.5 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSiguiente}
            disabled={!cuotasPendientes.some(c => seleccionados[c.referencia])}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            <span>Generar Comprobante</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarCobro;
