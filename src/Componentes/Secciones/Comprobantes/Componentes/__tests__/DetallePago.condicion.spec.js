/**
 * Tests para la restricción de método de pago según condicionComprobante en
 * DetallePago.jsx (T14-T18). Cubre: R14, R15, R16, R17, R18.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado (sin RTL),
 * por lo que no se puede montar el componente. Siguiendo la convención ya
 * usada en este archivo de tests (ver CabeceraComprobante.spec.js, sección
 * "T13/T14/T15": *replica la lógica* de la parte no-visual del componente en
 * funciones puras testeables), este archivo:
 *
 *  - Importa la función REAL `obtenerMetodosPermitidos` (misma fuente de
 *    verdad usada por el componente) para derivar `metodosPermitidos` y
 *    `sinMetodoDisponible` exactamente como lo hace DetallePago.jsx.
 *  - Extrae por regex la lista real de `METODOS` definida en
 *    DetallePago.jsx (para no duplicar manualmente los 6 valores y así
 *    detectar cualquier desalineación futura entre el componente y el test).
 *  - Replica en funciones puras los dos `useEffect` de reset (R16) y vaciado
 *    (R17), con el mismo cuerpo que el implementado en el componente.
 *
 * Ejecutar con:
 *   node src/Componentes/Secciones/Comprobantes/Componentes/__tests__/DetallePago.condicion.spec.js
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { obtenerMetodosPermitidos } from "../../utils/condicionMetodoPago.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaComponente = path.join(__dirname, "..", "DetallePago.jsx");
const fuente = readFileSync(rutaComponente, "utf8");

let fallos = 0;
const test = (nombre, fn) => {
  try {
    fn();
    console.log(`  ok - ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  FAIL - ${nombre}`);
    console.error(err);
  }
};

// ─── Extraer el array METODOS real definido en el componente ───────────────
const bloqueMetodos = fuente.match(/const METODOS = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const METODOS_VALUES = [...bloqueMetodos.matchAll(/value:\s*"([A-Z_]+)"/g)].map(
  (m) => m[1],
);

// ─── Deriva metodosDisponibles/sinMetodoDisponible EXACTAMENTE como el
// componente (design.md §2.4) ───────────────────────────────────────────────
function derivarEstado(condicionComprobante) {
  const metodosPermitidos = obtenerMetodosPermitidos(condicionComprobante);
  const sinMetodoDisponible =
    metodosPermitidos !== null && metodosPermitidos.length === 0;
  const metodosDisponibles =
    metodosPermitidos === null
      ? METODOS_VALUES
      : METODOS_VALUES.filter((v) => metodosPermitidos.includes(v));
  return { metodosPermitidos, sinMetodoDisponible, metodosDisponibles };
}

console.log("DetallePago.jsx — extracción de METODOS del componente real");
test("METODOS tiene 6 valores", () => {
  assert.equal(METODOS_VALUES.length, 6);
});
test("METODOS incluye EFECTIVO, TRANSFERENCIA, TARJETA_DEBITO, TARJETA_CREDITO, CHEQUE_TERCERO, CHEQUE_PROPIO", () => {
  assert.deepEqual(
    METODOS_VALUES.sort(),
    [
      "CHEQUE_PROPIO",
      "CHEQUE_TERCERO",
      "EFECTIVO",
      "TARJETA_CREDITO",
      "TARJETA_DEBITO",
      "TRANSFERENCIA",
    ].sort(),
  );
});

console.log("\nDetallePago.jsx — filtro de métodos (T14, R14)");

test('condicionComprobante="TARJETA_DEBITO" → solo TARJETA_DEBITO', () => {
  const { metodosDisponibles } = derivarEstado("TARJETA_DEBITO");
  assert.deepEqual(metodosDisponibles, ["TARJETA_DEBITO"]);
});

test('condicionComprobante="CHEQUE" → CHEQUE_TERCERO y CHEQUE_PROPIO', () => {
  const { metodosDisponibles } = derivarEstado("CHEQUE");
  assert.deepEqual(metodosDisponibles.sort(), [
    "CHEQUE_PROPIO",
    "CHEQUE_TERCERO",
  ]);
});

console.log("\nDetallePago.jsx — sección deshabilitada (T15, R15)");

test('condicionComprobante="CUENTA_CORRIENTE" → sinMetodoDisponible = true', () => {
  const { sinMetodoDisponible, metodosDisponibles } =
    derivarEstado("CUENTA_CORRIENTE");
  assert.equal(sinMetodoDisponible, true);
  assert.deepEqual(metodosDisponibles, []);
});

for (const dias of ["CREDITO_30_DIAS", "CREDITO_60_DIAS", "CREDITO_90_DIAS"]) {
  test(`condicionComprobante="${dias}" → sinMetodoDisponible = true`, () => {
    const { sinMetodoDisponible } = derivarEstado(dias);
    assert.equal(sinMetodoDisponible, true);
  });
}

console.log("\nDetallePago.jsx — reset de tipoPago (T16, R16)");

// Replica exacta del useEffect de R16:
//   if (metodosPermitidos === null || metodosPermitidos.length === 0) return tipoPagoActual;
//   if (!metodosPermitidos.includes(tipoPago)) return metodosPermitidos[0];
//   return tipoPago;
function resolverTipoPagoTrasCondicion(metodosPermitidos, tipoPagoActual) {
  if (metodosPermitidos === null || metodosPermitidos.length === 0) {
    return tipoPagoActual;
  }
  if (!metodosPermitidos.includes(tipoPagoActual)) {
    return metodosPermitidos[0];
  }
  return tipoPagoActual;
}

test('CHEQUE_TERCERO seleccionado + condición pasa a "TARJETA_DEBITO" → tipoPago = "TARJETA_DEBITO"', () => {
  const { metodosPermitidos } = derivarEstado("TARJETA_DEBITO");
  const nuevoTipoPago = resolverTipoPagoTrasCondicion(
    metodosPermitidos,
    "CHEQUE_TERCERO",
  );
  assert.equal(nuevoTipoPago, "TARJETA_DEBITO");
});

test("si el tipoPago actual sigue permitido, no se reasigna", () => {
  const { metodosPermitidos } = derivarEstado("CHEQUE");
  const nuevoTipoPago = resolverTipoPagoTrasCondicion(
    metodosPermitidos,
    "CHEQUE_PROPIO",
  );
  assert.equal(nuevoTipoPago, "CHEQUE_PROPIO");
});

console.log("\nDetallePago.jsx — vaciar pagos/vueltos (T17, R17)");

// Replica exacta del useEffect de R17
function resolverPagosVueltosTrasCondicion(sinMetodoDisponible, pagos, vueltos) {
  if (!sinMetodoDisponible) return { pagos, vueltos };
  return {
    pagos: pagos.length > 0 ? [] : pagos,
    vueltos: vueltos.length > 0 ? [] : vueltos,
  };
}

test('condición pasa a "CREDITO_30_DIAS" con pagos/vueltos cargados → ambos quedan en []', () => {
  const { sinMetodoDisponible } = derivarEstado("CREDITO_30_DIAS");
  const resultado = resolverPagosVueltosTrasCondicion(
    sinMetodoDisponible,
    [{ id: 1, monto: 100 }],
    [{ id: 2, monto: 10 }],
  );
  assert.deepEqual(resultado.pagos, []);
  assert.deepEqual(resultado.vueltos, []);
});

test('condición con método disponible (ej. "CHEQUE") no vacía pagos/vueltos', () => {
  const { sinMetodoDisponible } = derivarEstado("CHEQUE");
  const pagosOriginales = [{ id: 1, monto: 100 }];
  const resultado = resolverPagosVueltosTrasCondicion(
    sinMetodoDisponible,
    pagosOriginales,
    [],
  );
  assert.deepEqual(resultado.pagos, pagosOriginales);
});

console.log(
  "\nDetallePago.jsx — condicionComprobante no pasado preserva comportamiento actual (T18, R18)",
);

test("sin condicionComprobante (undefined, default null) → metodosDisponibles = los 6 METODOS actuales", () => {
  const { metodosPermitidos, sinMetodoDisponible, metodosDisponibles } =
    derivarEstado(undefined);
  assert.equal(metodosPermitidos, null);
  assert.equal(sinMetodoDisponible, false);
  assert.equal(metodosDisponibles.length, 6);
  assert.deepEqual(metodosDisponibles, METODOS_VALUES);
});

test("condicionComprobante={null} explícito → mismo resultado que no pasarlo (regresión Recibos.jsx/OrdenPago.jsx)", () => {
  const conNull = derivarEstado(null);
  const sinProp = derivarEstado(undefined);
  assert.deepEqual(conNull, sinProp);
});

test("el default de la prop condicionComprobante en la firma del componente es null", () => {
  assert.match(fuente, /condicionComprobante\s*=\s*null,?\s*\n?\s*\}\)\s*=>/);
});

console.log(
  `\n${fallos === 0 ? "TODOS LOS TESTS PASARON" : `${fallos} TEST(S) FALLARON`}`,
);
if (fallos > 0) process.exit(1);
