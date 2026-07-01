import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { emitirLoteCuotasApi } from "../../../../Backend/Escuela/api/cuotas.api";
import {
  evaluarFormulaCuota,
  formatearReferenciaCuota,
  calcularEstadoCuota,
} from "../../../../utils/cuotaUtils";

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

/**
 * Modal de emisión individual de cuota para un alumno.
 * R18, R19, R20
 */
const ModalEmitirIndividual = ({
  alumno,
  formula,
  mes,
  anio,
  asientos,
  onClose,
  onExito,
}) => {
  const { usuario } = useAuthStore();
  const queryClient = useQueryClient();
  const [emitiendo, setEmitiendo] = useState(false);
  const [error, setError] = useState(null);

  const tipoAlumno = alumno.atributos?.tipo_alumno ?? "";
  const monto = evaluarFormulaCuota(formula, tipoAlumno);
  const [montoEditable, setMontoEditable] = useState(monto);
  const referencia = formatearReferenciaCuota(
    alumno.codigoSecuencial,
    anio,
    mes,
  );
  const periodoDate = new Date(anio, mes - 1, 1);
  const hoy = new Date();
  const estado = calcularEstadoCuota(
    referencia,
    asientos ?? [],
    periodoDate,
    hoy,
  );
  const yaEmitida = estado !== "SIN_EMITIR";
  const sinTutor = !alumno.enteFacturacion || !alumno.enteFacturacion.codigoSecuencial;

  const nombreCompleto =
    alumno.razonSocial ||
    `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();
  const nombreMes = MESES_ES[mes - 1];

  const handleConfirmar = async () => {
    if (yaEmitida) return;
    setEmitiendo(true);
    setError(null);
    try {
      await emitirLoteCuotasApi({
        codigoCtaCte: "110301006",
        mes,
        anio,
        codigoContacto: alumno.codigoSecuencial,
        montoOverride: montoEditable,
      });
      queryClient.invalidateQueries({ queryKey: ["asientos"] });
      queryClient.invalidateQueries({ queryKey: ["alumnos-cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["deuda-alumno"] });
      onExito();
    } catch (err) {
      setError(err?.response?.data?.message || "Error al emitir cuota");
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Emitir cuota individual
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Emití una cuota manual para un alumno específico.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs font-bold text-gray-600">
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Alumno</span>
            <span className="text-gray-900 font-black text-sm uppercase">
              {nombreCompleto}
            </span>
          </p>
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Período</span>
            <span className="text-gray-900 font-black text-sm uppercase">
              {nombreMes} {anio}
            </span>
          </p>
          <div className="flex flex-col gap-1.5 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto cuota</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={montoEditable}
                onChange={(e) => setMontoEditable(Number(e.target.value))}
                disabled={yaEmitida || emitiendo}
                className="w-full bg-white border border-[var(--border-subtle)] rounded-md pl-8 pr-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {yaEmitida && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm font-semibold text-amber-700">
            Ya existe una cuota emitida para este alumno en {mes}/{anio}
          </div>
        )}

        {sinTutor && (
          <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-sm font-semibold text-rose-700">
            Este alumno no tiene tutor registrado. No se puede emitir la cuota.
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-md p-4 text-sm font-semibold text-rose-700">
            {error}
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
            disabled={yaEmitida || emitiendo || sinTutor}
            className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            {emitiendo ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Emitir cuota"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirIndividual;
