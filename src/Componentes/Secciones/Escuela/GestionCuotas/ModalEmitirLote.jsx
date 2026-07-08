import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import {
  formatearReferenciaCuota,
  calcularEstadoCuota,
} from "../../../../utils/cuotaUtils";
import { useListarAsientosQuery } from "../../../../Backend/Contabilidad/queries/useAsientos.query";

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ModalEmitirLote = ({ alumnos, formula, mes, anio, onClose, onExito }) => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);

  const periodoDate = new Date(anio, mes - 1, 1);
  const hoy = new Date();

  const fechaDesde = `${anio}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const fechaHasta = `${anio}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

  const { data: asientos = [] } = useListarAsientosQuery(
    usuario?.codigoEmpresa
      ? {
          codigoEmpresa: usuario.codigoEmpresa,
          origenModulo: "ESCUELA",
          fechaDesde,
          fechaHasta,
        }
      : {},
  );

  const { pendientes, yaEmitidos, sinTutor } = alumnos.reduce(
    (acc, alumno) => {
      if (!alumno.enteFacturacion || !alumno.enteFacturacion.codigoSecuencial) {
        acc.sinTutor.push(alumno);
        return acc;
      }
      const referencia = formatearReferenciaCuota(
        alumno.codigoSecuencial,
        anio,
        mes,
      );
      const estado = calcularEstadoCuota(
        referencia,
        asientos,
        periodoDate,
        hoy,
      );
      if (estado === "SIN_EMITIR") {
        acc.pendientes.push(alumno);
      } else {
        acc.yaEmitidos.push(alumno);
      }
      return acc;
    },
    { pendientes: [], yaEmitidos: [], sinTutor: [] },
  );

  const handleConfirmar = async () => {
    if (pendientes.length === 0) return;
    setEmitiendo(true);
    try {
      const codigoEmpresa = usuario?.codigoEmpresa;
      const respuesta = await emitirLoteCuotasApi({
        codigoEmpresa,
        codigoCtaCte: "110301006",
        mes,
        anio,
      });

      setResultado(respuesta);
      queryClient.invalidateQueries({ queryKey: ["asientos"] });
      queryClient.invalidateQueries({ queryKey: ["alumnos-cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["deuda-alumno"] });
    } catch (err) {
      setResultado({
        error: err?.response?.data?.message || "Error al emitir cuotas",
      });
    } finally {
      setEmitiendo(false);
    }
  };

  const nombreMes = MESES_ES[mes - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-md max-w-lg w-full p-7 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Generar cuotas — {nombreMes} {anio}
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Verificá el estado de los alumnos antes de emitir masivamente.
          </p>
        </div>

        {!resultado ? (
          <>
            <div className="flex flex-col gap-2 text-xs font-bold text-gray-600">
              <p className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span>Alumnos a emitir</span>
                <span className="text-gray-900 font-black text-sm">
                  {pendientes.length}
                </span>
              </p>
              {sinTutor.length > 0 && (
                <p className="text-rose-600 font-bold flex items-center justify-between border-b border-rose-50 pb-2">
                  <span>Sin tutor (no se emitirán)</span>
                  <span>{sinTutor.length}</span>
                </p>
              )}
              {yaEmitidos.length > 0 && (
                <p className="text-amber-600 font-bold flex items-center justify-between pb-1">
                  <span>Con cuota ya emitida (omitidos)</span>
                  <span>{yaEmitidos.length}</span>
                </p>
              )}
            </div>

            {sinTutor.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-2">
                  Sin tutor
                </p>
                {sinTutor.map((a) => (
                  <p
                    key={a.codigoSecuencial}
                    className="text-[11px] text-rose-700 font-medium"
                  >
                    {a.razonSocial ||
                      `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim()}
                  </p>
                ))}
              </div>
            )}

            {yaEmitidos.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
                  Ya emitidas
                </p>
                {yaEmitidos.map((a) => (
                  <p
                    key={a.codigoSecuencial}
                    className="text-[11px] text-amber-700 font-medium"
                  >
                    {a.razonSocial ||
                      `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim()}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={emitiendo}
                className="flex-1 py-3 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={emitiendo || pendientes.length === 0}
                className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
              >
                {emitiendo ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar emisión"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {resultado.error ? (
              <p className="text-rose-600 font-bold text-sm bg-rose-50 p-4 rounded-md border border-rose-100">
                {resultado.error}
              </p>
            ) : (
              <div className="flex flex-col gap-3 bg-emerald-50/50 p-4 rounded-md border border-emerald-100">
                <p className="text-emerald-700 font-black text-sm">
                  Generados: {resultado.totalGenerados ?? 0}
                </p>
                {resultado.sinTutor?.length > 0 && (
                  <div>
                    <p className="text-rose-600 font-bold text-xs mb-1">
                      Sin tutor (no emitidos): {resultado.sinTutor.length}
                    </p>
                    <ul className="text-[11px] text-rose-700 list-disc list-inside max-h-24 overflow-y-auto pl-1">
                      {resultado.sinTutor.map((o, i) => (
                        <li key={i}>{o.nombre || o.referencia}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resultado.omitidos?.length > 0 && (
                  <div>
                    <p className="text-amber-600 font-bold text-xs mb-1">
                      Omitidos (ya emitidos): {resultado.omitidos.length}
                    </p>
                    <ul className="text-[11px] text-amber-700 list-disc list-inside max-h-24 overflow-y-auto pl-1">
                      {resultado.omitidos.map((o, i) => (
                        <li key={i}>{o.referencia ?? o.codigoContacto}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onExito}
              className="w-full py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20 mt-2"
            >
              Entendido
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalEmitirLote;
