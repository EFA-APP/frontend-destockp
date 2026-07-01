import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import {
  evaluarFormulaCuota,
  formatearReferenciaCuota,
  calcularEstadoCuota,
} from "../../../../utils/cuotaUtils";
import { formatearARS } from "../../../../utils/formatearMoneda";

const OPCIONES_PERIODO = [
  { valor: "proximo_mes", etiqueta: "Aplicar desde el próximo mes" },
  { valor: "este_mes", etiqueta: "Aplicar desde este mes (recalcular cuota actual)" },
];

/**
 * Modal de decisión al cambiar tipo_alumno de un contacto ALUM.
 * R25, R26, R27
 */
const ModalCambioTipoAlumno = ({
  alumno,
  formula,
  tipoOpciones = [],
  mes,
  anio,
  asientos,
  onClose,
  onExito,
}) => {
  const queryClient = useQueryClient();
  const tipoActual = alumno.atributos?.tipo_alumno ?? "";
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [opcionPeriodo, setOpcionPeriodo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const { actualizarContacto } = useContactos();

  const referencia = formatearReferenciaCuota(alumno.codigoSecuencial, anio, mes);
  const periodoDate = new Date(anio, mes - 1, 1);
  const hoy = new Date();
  const estadoCuotaActual = calcularEstadoCuota(referencia, asientos ?? [], periodoDate, hoy);
  const cuotaActualEmitida = estadoCuotaActual !== "SIN_EMITIR";

  const nombreCompleto =
    alumno.razonSocial || `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.trim();

  const montoActual = evaluarFormulaCuota(formula, tipoActual);
  const montoNuevo = nuevoTipo ? evaluarFormulaCuota(formula, nuevoTipo) : null;

  const mismoTipo = nuevoTipo && nuevoTipo === tipoActual;
  const puedeConfirmar = nuevoTipo && opcionPeriodo && !mismoTipo && !procesando && !mensaje;

  const handleConfirmar = async () => {
    if (!puedeConfirmar) return;
    setProcesando(true);
    setMensaje("");

    try {
      await actualizarContacto({
        id: alumno.codigoSecuencial,
        dto: {
          codigoEmpresa: alumno.codigoEmpresa,
          tipoEntidad: alumno.tipoEntidad,
          nombre: alumno.nombre || "",
          apellido: alumno.apellido || "",
          razonSocial: alumno.razonSocial || "",
          documento: alumno.documento || "",
          correoElectronico: alumno.correoElectronico || "",
          tipoDocumento: alumno.tipoDocumento || 99,
          condicionIva: alumno.condicionIva || "CF",
          activo: alumno.activo ?? true,
          atributos: {
            ...(alumno.atributos ?? {}),
            tipo_alumno: nuevoTipo.toLowerCase(),
          },
        },
      });

      queryClient.invalidateQueries({ queryKey: ["alumnos-cuotas"] });
      queryClient.invalidateQueries({ queryKey: ["asientos"] });

      if (opcionPeriodo === "este_mes" && cuotaActualEmitida) {
        setMensaje(
          "El tipo de alumno fue actualizado, pero la cuota de este mes ya fue emitida y no puede modificarse retroactivamente.",
        );
      } else {
        onExito();
      }
    } catch (err) {
      setMensaje(
        err?.response?.data?.message || "Error al actualizar el tipo de alumno.",
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-md w-full p-7 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-gray-800">
            Cambio de tipo de alumno
          </h2>
          <p className="text-xs font-semibold text-gray-500">
            Modificá la categoría del alumno y ajustá su cuota.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs font-bold text-gray-600">
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Alumno</span>
            <span className="text-gray-900 font-black text-sm uppercase">{nombreCompleto}</span>
          </p>
          <p className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span>Tipo actual</span>
            <span className="text-gray-900 font-black text-sm uppercase">
              {tipoActual || "—"}
              {tipoActual && (
                <span className="ml-2 text-gray-400 font-bold text-xs">
                  ({formatearARS(montoActual)}/mes)
                </span>
              )}
            </span>
          </p>
        </div>

        {/* Selector de nuevo tipo */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Nuevo tipo
          </p>
          {tipoOpciones.length > 0 ? (
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[var(--border-subtle)] bg-white text-gray-700 text-sm font-bold focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="">Seleccionar...</option>
              {tipoOpciones
                .filter((t) => t !== tipoActual)
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          ) : (
            <input
              type="text"
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value.toUpperCase())}
              placeholder="Ej: BECADO"
              className="w-full px-3 py-2.5 rounded-md border border-[var(--border-subtle)] bg-white text-gray-700 text-sm font-bold uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
            />
          )}
          {mismoTipo && (
            <p className="text-[11px] text-amber-600 font-bold bg-amber-50 p-2 rounded-md border border-amber-100">
              El nuevo tipo es igual al actual.
            </p>
          )}
          {nuevoTipo && !mismoTipo && montoNuevo !== null && (
            <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-md border border-emerald-100">
              Nuevo monto: {formatearARS(montoNuevo)}/mes
            </p>
          )}
        </div>

        {/* Selector de período */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            ¿Cuándo aplicar el cambio?
          </p>
          {OPCIONES_PERIODO.map((opt) => (
            <label
              key={opt.valor}
              className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                opcionPeriodo === opt.valor
                  ? "border-[var(--primary)] bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]"
                  : "border-[var(--border-subtle)] hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="opcion-periodo"
                value={opt.valor}
                checked={opcionPeriodo === opt.valor}
                onChange={() => setOpcionPeriodo(opt.valor)}
                className="accent-[var(--primary)] w-4 h-4"
              />
              <span className="text-xs font-bold text-gray-700">
                {opt.etiqueta}
              </span>
            </label>
          ))}
        </div>

        {mensaje && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm font-semibold text-amber-700">
            {mensaje}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={procesando}
            className="flex-1 py-3 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-xs font-bold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            {procesando ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioTipoAlumno;
