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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
          Generar cuotas — {nombreMes} {anio}
        </h2>

        {!resultado ? (
          <>
            <div className="flex flex-col gap-2 text-[12px] font-bold text-[var(--text-secondary)]">
              <p>
                Alumnos a emitir:{" "}
                <span className="text-[var(--text-primary)] text-[14px]">
                  {pendientes.length}
                </span>
              </p>
              {sinTutor.length > 0 && (
                <p className="text-rose-600 font-bold text-[12px]">
                  Sin tutor (no se emitirán): {sinTutor.length}
                </p>
              )}
              {yaEmitidos.length > 0 && (
                <p className="text-amber-600">
                  Alumnos con cuota ya emitida (serán omitidos):{" "}
                  {yaEmitidos.length}
                </p>
              )}
            </div>

            {sinTutor.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-700 mb-2">
                  Sin tutor
                </p>
                {sinTutor.map((a) => (
                  <p key={a.codigoSecuencial} className="text-[11px] text-rose-700 font-medium">
                    {a.razonSocial || `${a.nombre ?? ""} ${a.apellido ?? ""}`.trim()}
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

            <div className="flex gap-3 mt-2">
              <button
                onClick={onClose}
                disabled={emitiendo}
                className="flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={emitiendo || pendientes.length === 0}
                className="flex-1 py-3 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {emitiendo ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            {resultado.error ? (
              <p className="text-rose-600 font-bold text-[13px]">
                {resultado.error}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-emerald-700 font-black text-[14px]">
                  Generados: {resultado.totalGenerados ?? 0}
                </p>
                {resultado.sinTutor?.length > 0 && (
                  <div>
                    <p className="text-rose-600 font-bold text-[12px] mb-1">
                      Sin tutor (no emitidos): {resultado.sinTutor.length}
                    </p>
                    <ul className="text-[11px] text-rose-700 list-disc list-inside max-h-24 overflow-y-auto">
                      {resultado.sinTutor.map((o, i) => (
                        <li key={i}>{o.nombre || o.referencia}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resultado.omitidos?.length > 0 && (
                  <div>
                    <p className="text-amber-600 font-bold text-[12px] mb-1">
                      Omitidos (ya emitidos): {resultado.omitidos.length}
                    </p>
                    <ul className="text-[11px] text-amber-700 list-disc list-inside max-h-24 overflow-y-auto">
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
              className="w-full py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalEmitirLote;
