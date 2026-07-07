/**
 * Tests para la validación de `handleGuardar` en Ingresos.jsx / Egresos.jsx
 * (T21, T22). Cubre: R19, R21, R22.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado (sin RTL).
 * `handleGuardar` no se puede invocar directamente sin montar el componente
 * completo (depende de hooks de red). Este archivo:
 *
 *  - Importa la función REAL `requierePago` (misma fuente de verdad usada
 *    por Ingresos.jsx/Egresos.jsx) para verificar la condición de bloqueo
 *    exactamente como la implementa el componente.
 *  - Verifica, leyendo el código fuente real de Ingresos.jsx y Egresos.jsx,
 *    que `handleGuardar` efectivamente usa `requierePago(condicion)` (y ya
 *    no la comparación `condicion === "CONTADO"`), y que pasan la prop
 *    `condicionComprobante` a `<BuscadorDetalle>` (que a su vez la reenvía a
 *    `<DetallePago>` — ver BuscadorDetalle.jsx).
 *
 * Ejecutar con:
 *   node src/Componentes/Secciones/Comprobantes/Tabs/__tests__/handleGuardar.condicion.spec.js
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { requierePago } from "../../utils/condicionMetodoPago.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Replica exacta de la condición de bloqueo implementada en handleGuardar:
//   const condicion = cabecera.condicionComprobante || "CONTADO";
//   if (requierePago(condicion) && pagos.length === 0) { bloquear }
function debeBloquearGuardado(condicionComprobante, pagos) {
  const condicion = condicionComprobante || "CONTADO";
  return requierePago(condicion) && pagos.length === 0;
}

console.log("Ingresos.jsx / Egresos.jsx — handleGuardar (T21, T22, R21, R22)");

test('condicionComprobante="CONTADO" + pagos=[] → bloquea (R21)', () => {
  assert.equal(debeBloquearGuardado("CONTADO", []), true);
});

test('condicionComprobante="CUENTA_CORRIENTE" + pagos=[] → NO bloquea (R22)', () => {
  assert.equal(debeBloquearGuardado("CUENTA_CORRIENTE", []), false);
});

for (const dias of ["CREDITO_30_DIAS", "CREDITO_60_DIAS", "CREDITO_90_DIAS"]) {
  test(`condicionComprobante="${dias}" + pagos=[] → NO bloquea (R22)`, () => {
    assert.equal(debeBloquearGuardado(dias, []), false);
  });
}

test('condicionComprobante="" (falsy) + pagos=[] → bloquea (default CONTADO, R21)', () => {
  assert.equal(debeBloquearGuardado("", []), true);
});

test('condicionComprobante="CONTADO" + pagos con 1 elemento → NO bloquea', () => {
  assert.equal(
    debeBloquearGuardado("CONTADO", [{ id: 1, monto: 100 }]),
    false,
  );
});


console.log(
  "\nVerificación de código fuente: Ingresos.jsx / Egresos.jsx usan requierePago y pasan condicionComprobante",
);

for (const archivo of ["Ingresos.jsx", "Egresos.jsx"]) {
  const fuente = readFileSync(path.join(__dirname, "..", archivo), "utf8");

  test(`${archivo} importa requierePago de utils/condicionMetodoPago.js`, () => {
    assert.match(
      fuente,
      /import\s*\{\s*requierePago\s*\}\s*from\s*["']\.\.\/utils\/condicionMetodoPago\.js["']/,
    );
  });

  test(`${archivo} usa requierePago(condicion) en handleGuardar (no la comparación antigua === "CONTADO")`, () => {
    assert.match(fuente, /requierePago\(condicion\)\s*&&\s*pagos\.length === 0/);
    assert.doesNotMatch(fuente, /condicion === "CONTADO" && pagos\.length === 0/);
  });

  test(`${archivo} pasa condicionComprobante={cabecera.condicionComprobante} a <BuscadorDetalle>`, () => {
    assert.match(
      fuente,
      /condicionComprobante=\{cabecera\.condicionComprobante\}/,
    );
  });
}

console.log(
  `\n${fallos === 0 ? "TODOS LOS TESTS PASARON" : `${fallos} TEST(S) FALLARON`}`,
);
if (fallos > 0) process.exit(1);
