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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
        <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
          Emitir cuota individual
        </h2>

        <div className="flex flex-col gap-2 text-[12px] font-bold text-[var(--text-secondary)]">
          <p>
            Alumno:{" "}
            <span className="text-[var(--text-primary)] uppercase">
              {nombreCompleto}
            </span>
          </p>
          <p>
            Período:{" "}
            <span className="text-[var(--text-primary)]">
              {nombreMes} {anio}
            </span>
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-bold text-[var(--text-secondary)]">Monto cuota</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={montoEditable}
              onChange={(e) => setMontoEditable(Number(e.target.value))}
              disabled={yaEmitida || emitiendo}
              className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--fill-secondary)] text-[var(--text-primary)] text-[14px] font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
          </div>
        </div>

        {yaEmitida && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-[12px] font-bold text-amber-700">
            Ya existe una cuota emitida para este alumno en {mes}/{anio}
          </div>
        )}

        {sinTutor && (
          <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-[12px] font-bold text-rose-700">
            Este alumno no tiene tutor registrado. No se puede emitir la cuota.
          </div>
        )}

        {error && (
          <p className="text-rose-600 font-bold text-[12px]">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={emitiendo}
            className="flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={yaEmitida || emitiendo || sinTutor}
            className="flex-1 py-3 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {emitiendo ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Confirmar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEmitirIndividual;
