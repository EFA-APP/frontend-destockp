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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
        <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
          Cambio de tipo de alumno
        </h2>

        <div className="text-[12px] font-bold text-[var(--text-secondary)] flex flex-col gap-1">
          <p>
            Alumno:{" "}
            <span className="text-[var(--text-primary)] uppercase">{nombreCompleto}</span>
          </p>
          <p>
            Tipo actual:{" "}
            <span className="text-[var(--text-primary)] uppercase font-black">
              {tipoActual || "—"}
            </span>
            {tipoActual && (
              <span className="ml-2 text-[var(--text-muted)]">
                ({formatearARS(montoActual)}/mes)
              </span>
            )}
          </p>
        </div>

        {/* Selector de nuevo tipo */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Nuevo tipo
          </p>
          {tipoOpciones.length > 0 ? (
            <select
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--fill-secondary)] text-[var(--text-primary)] text-[12px] font-bold focus:outline-none focus:border-[var(--primary)]"
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
              className="w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--fill-secondary)] text-[var(--text-primary)] text-[12px] font-bold uppercase placeholder:normal-case placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          )}
          {mismoTipo && (
            <p className="text-[11px] text-amber-600 font-bold">
              El nuevo tipo es igual al actual.
            </p>
          )}
          {nuevoTipo && !mismoTipo && montoNuevo !== null && (
            <p className="text-[11px] text-emerald-700 font-bold">
              Nuevo monto: {formatearARS(montoNuevo)}/mes
            </p>
          )}
        </div>

        {/* Selector de período */}
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            ¿Cuándo aplicar el cambio?
          </p>
          {OPCIONES_PERIODO.map((opt) => (
            <label
              key={opt.valor}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                opcionPeriodo === opt.valor
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]"
              }`}
            >
              <input
                type="radio"
                name="opcion-periodo"
                value={opt.valor}
                checked={opcionPeriodo === opt.valor}
                onChange={() => setOpcionPeriodo(opt.valor)}
                className="accent-[var(--primary)]"
              />
              <span className="text-[12px] font-bold text-[var(--text-primary)]">
                {opt.etiqueta}
              </span>
            </label>
          ))}
        </div>

        {mensaje && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-[12px] font-bold text-amber-700">
            {mensaje}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={procesando}
            className="flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!puedeConfirmar}
            className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {procesando ? (
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

export default ModalCambioTipoAlumno;
