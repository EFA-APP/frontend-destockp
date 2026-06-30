import { useState } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useListarAsientosQuery } from "../../../../Backend/Contabilidad/queries/useAsientos.query";
import {
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
 * Parsea una fórmula de cuota y devuelve { valorInterno, valorExterno }.
 * Si la fórmula es condicional (tipo_alumno === "INTERNO" ? X : Y),
 * extrae X e Y. Si es un número plano, lo usa en ambos campos.
 */
function parsearFormula(formula) {
  if (!formula) return { valorInterno: "", valorExterno: "" };
  const match = formula.match(/\?\s*([\d.]+)\s*:\s*([\d.]+)/);
  if (match) {
    return { valorInterno: match[1], valorExterno: match[2] };
  }
  const n = parseFloat(formula.trim());
  if (!isNaN(n)) {
    const s = String(n);
    return { valorInterno: s, valorExterno: s };
  }
  return { valorInterno: "", valorExterno: "" };
}

/**
 * Modal para editar el valor de cuota global.
 * R21, R22, R23, R24
 */
const ModalEditarCuota = ({ formula, mes, anio, actualizarCuota, onClose }) => {
  const { usuario } = useAuthStore();

  const parsed = parsearFormula(formula);
  const [valorInterno, setValorInterno] = useState(parsed.valorInterno);
  const [valorExterno, setValorExterno] = useState(parsed.valorExterno);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [mensajeAplicacion, setMensajeAplicacion] = useState("");

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

  // R23: verificar si ya hay cuotas emitidas en el mes actual
  const hayEmitidas = asientos.some((a) => {
    const mesStr = String(mes).padStart(2, "0");
    return (
      a.referencia?.startsWith(`CUOTA-`) &&
      a.referencia?.endsWith(`-${anio}-${mesStr}`)
    );
  });

  const handleGuardar = async () => {
    setErrorValidacion("");

    // R24: validación client-side — ambos inputs deben ser numéricos y > 0
    const numInterno = parseFloat(valorInterno);
    const numExterno = parseFloat(valorExterno);

    if (!valorInterno || isNaN(numInterno) || numInterno <= 0) {
      setErrorValidacion(
        "El valor para alumnos Internos debe ser un número mayor a cero.",
      );
      return;
    }
    if (!valorExterno || isNaN(numExterno) || numExterno <= 0) {
      setErrorValidacion(
        "El valor para alumnos Externos debe ser un número mayor a cero.",
      );
      return;
    }

    const nuevaFormula = `tipo_alumno === "INTERNO" ? ${Math.round(numInterno)} : ${Math.round(numExterno)}`;

    setGuardando(true);
    try {
      await actualizarCuota(nuevaFormula);

      // R23: informar al usuario si aplica ahora o desde el mes siguiente
      if (hayEmitidas) {
        setMensajeAplicacion(
          `El nuevo valor se aplicará desde el mes siguiente (${MESES_ES[mes % 12]} ${mes === 12 ? anio + 1 : anio}), ya que el mes actual ya tiene cuotas emitidas.`,
        );
      } else {
        setMensajeAplicacion(
          `El nuevo valor se aplicará de inmediato para ${MESES_ES[mes - 1]} ${anio}.`,
        );
      }
      setGuardado(true);
    } catch (err) {
      setErrorValidacion(err?.response?.data?.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
        <h2 className="text-lg font-black uppercase tracking-tight text-[var(--text-primary)]">
          Editar valor de cuota
        </h2>

        {!guardado ? (
          <>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Valor Interno (alumnos INTERNO)
                </label>
                <input
                  type="text"
                  value={valorInterno}
                  onChange={(e) => {
                    setValorInterno(e.target.value);
                    setErrorValidacion("");
                  }}
                  placeholder="Ej: 130000"
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--primary)] transition-colors text-[var(--text-primary)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Valor Externo (otros tipos de alumno)
                </label>
                <input
                  type="text"
                  value={valorExterno}
                  onChange={(e) => {
                    setValorExterno(e.target.value);
                    setErrorValidacion("");
                  }}
                  placeholder="Ej: 190000"
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-[13px] font-bold outline-none focus:border-[var(--primary)] transition-colors text-[var(--text-primary)]"
                />
              </div>

              {errorValidacion && (
                <p className="text-rose-600 text-[11px] font-bold">
                  {errorValidacion}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={guardando}
                className="flex-1 py-3 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest hover:bg-[var(--surface-hover)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="flex-1 py-3 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {guardando ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-[12px] font-bold text-emerald-700">
              {mensajeAplicacion}
            </div>
            <button
              onClick={onClose}
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

export default ModalEditarCuota;
