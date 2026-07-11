/**
 * Utilidades de dominio para la gestión de cuotas de alumnos (ALUM).
 *
 * R8, R9, R11, R12, R13, R33
 */

const VENCIMIENTO_DIA = 10;

/**
 * Evalúa la fórmula almacenada en ConfiguracionCampoContacto.formula
 * contra el tipo_alumno del contacto.
 *
 * Soporta:
 *  - String numérico plano: "130000"
 *  - Expresión condicional fija: 'tipo_alumno === "INTERNO" ? 130000 : 190000'
 *
 * No usa eval ni Function.
 *
 * @param {string} formula
 * @param {string} tipoAlumno
 * @returns {number}
 */
export function evaluarFormulaCuota(formula, tipoAlumno) {
  if (!formula) return 0;

  const trimmed = formula.trim();

  // Patrón condicional: <id> === "<valor>" ? <n1> : <n2>
  const matchCondicional = trimmed.match(
    /^[\w_]+\s*===\s*"([^"]+)"\s*\?\s*([\d.]+)\s*:\s*([\d.]+)$/
  );
  if (matchCondicional) {
    const valorEsperado = matchCondicional[1];
    const montoSiVerdadero = parseFloat(matchCondicional[2]);
    const montoSiFalso = parseFloat(matchCondicional[3]);
    return (tipoAlumno || "").toLowerCase() === (valorEsperado || "").toLowerCase()
      ? montoSiVerdadero
      : montoSiFalso;
  }

  // Numérico plano
  const comoNumero = parseFloat(trimmed);
  if (!isNaN(comoNumero)) return comoNumero;

  return 0;
}

/**
 * Obtiene el monto de la cuota para un alumno dado sus atributos.
 *
 * @param {string} formula
 * @param {Array} atributos
 * @returns {number}
 */
export function obtenerMontoCuotaAlumno(formula, atributos) {
  if (!atributos || typeof atributos !== "object") {
    return evaluarFormulaCuota(formula, "");
  }

  let cuotaOverride = undefined;
  if (Array.isArray(atributos)) {
    const attrOverride = atributos.find(
      (a) => (a.nombre || "").toLowerCase() === "cuotaoverride"
    );
    cuotaOverride = attrOverride ? attrOverride.valor : undefined;
  } else {
    const keys = Object.keys(atributos);
    const keyOverride = keys.find((k) => k.toLowerCase() === "cuotaoverride");
    cuotaOverride = keyOverride ? atributos[keyOverride] : undefined;
  }

  if (
    cuotaOverride !== undefined &&
    cuotaOverride !== null &&
    cuotaOverride !== "" &&
    !isNaN(Number(cuotaOverride))
  ) {
    return Number(cuotaOverride);
  }
  // Soporta tanto si atributos es un objeto plano { tipo_alumno: 'interno' }
  // o si fuera un array por algún motivo {nombre: 'tipo_alumno', valor: 'interno'}
  let tipoAlumno = "";
  if (Array.isArray(atributos)) {
    const attrTipo = atributos.find(
      (a) => (a.nombre || "").toLowerCase() === "tipo_alumno"
    );
    tipoAlumno = attrTipo ? attrTipo.valor : "";
  } else {
    // Buscar la clave case-insensitive
    const keys = Object.keys(atributos);
    const key = keys.find((k) => k.toLowerCase() === "tipo_alumno");
    tipoAlumno = key ? atributos[key] : "";
  }
  
  return evaluarFormulaCuota(formula, tipoAlumno);
}

/**
 * Construye la referencia canónica de una cuota.
 * Ej: "CUOTA-42-2026-06"
 *
 * @param {number|string} codigoSecuencial
 * @param {number} year
 * @param {number} month  1-based (enero = 1)
 * @returns {string}
 */
export function formatearReferenciaCuota(codigoSecuencial, year, month) {
  const mm = String(month).padStart(2, "0");
  const yyyy = String(year);
  return `CUOTA-${codigoSecuencial}-${yyyy}-${mm}`;
}

/**
 * Determina el estado de una cuota para un alumno en un período dado.
 *
 * @param {string} referencia  - referencia canónica del alumno para ese período
 * @param {Array}  asientosDelPeriodo - asientos devueltos por contabilidad-ms
 * @param {Date}   periodoDate  - primer día del mes del período (ej: new Date(2026, 5, 1))
 * @param {Date}   hoy          - fecha actual (inyectable para tests)
 * @returns {"SIN_EMITIR"|"EMITIDA"|"VENCIDA"}
 */
export function calcularEstadoCuota(referencia, asientosDelPeriodo, periodoDate, hoy) {
  if (!Array.isArray(asientosDelPeriodo)) return "SIN_EMITIR";

  const asientosDeCuota = asientosDelPeriodo.filter((a) => a.referencia === referencia);
  if (asientosDeCuota.length === 0) return "SIN_EMITIR";

  let totalDebe = 0;
  let totalHaber = 0;

  for (const asiento of asientosDeCuota) {
    if (asiento.detalles) {
      for (const d of asiento.detalles) {
        if (d.codigoCuentaContable === 507 || d.nombreCuentaContable?.includes("PADRE") || d.nombreCuentaContable?.includes("Padre")) {
          totalDebe += d.debe ?? 0;
          totalHaber += d.haber ?? 0;
        }
      }
    }
  }

  const saldoPendiente = totalDebe - totalHaber;

  if (saldoPendiente <= 0) return "ABONADO";

  if (saldoPendiente < totalDebe) return "PARCIALMENTE_ABONADO";

  // saldoPendiente === totalDebe (sin pagos)
  const fechaVencimiento = new Date(
    periodoDate.getFullYear(),
    periodoDate.getMonth(),
    VENCIMIENTO_DIA
  );

  // Normalizar hoy a medianoche para comparar solo fechas
  const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return hoyNormalizado <= fechaVencimiento ? "EMITIDA" : "VENCIDA";
}
