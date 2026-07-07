/**
 * Tests unitarios para condicionMetodoPago.js (T12).
 * Cubre: R13, R18, R20.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado (sin
 * jest/vitest instalado). Estos tests importan el módulo REAL (no replican
 * la lógica) y usan node:assert/strict, por lo que pueden ejecutarse
 * directamente con:
 *   node src/Componentes/Secciones/Comprobantes/utils/__tests__/condicionMetodoPago.spec.js
 */

import assert from "node:assert/strict";
import {
  obtenerMetodosPermitidos,
  requierePago,
  METODOS_POR_CONDICION,
} from "../condicionMetodoPago.js";

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

console.log("condicionMetodoPago.js — obtenerMetodosPermitidos (R13, R18)");

test("obtenerMetodosPermitidos(null) => null (sin restricción)", () => {
  assert.equal(obtenerMetodosPermitidos(null), null);
});

test("obtenerMetodosPermitidos(undefined) => null (Recibos.jsx/OrdenPago.jsx, R18)", () => {
  assert.equal(obtenerMetodosPermitidos(undefined), null);
});

test('obtenerMetodosPermitidos("CONTADO") => todos los metodos', () => {
  assert.deepEqual(obtenerMetodosPermitidos("CONTADO"), [
    "EFECTIVO",
    "TRANSFERENCIA",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO",
    "CHEQUE_PROPIO",
    "CHEQUE_TERCERO",
  ]);
});

test('obtenerMetodosPermitidos("CUENTA_CORRIENTE") => todos los metodos', () => {
  assert.deepEqual(obtenerMetodosPermitidos("CUENTA_CORRIENTE"), [
    "EFECTIVO",
    "TRANSFERENCIA",
    "TARJETA_DEBITO",
    "TARJETA_CREDITO",
    "CHEQUE_PROPIO",
    "CHEQUE_TERCERO",
  ]);
});

for (const dias of ["CREDITO_30_DIAS", "CREDITO_60_DIAS", "CREDITO_90_DIAS"]) {
  test(`obtenerMetodosPermitidos("${dias}") => []`, () => {
    assert.deepEqual(obtenerMetodosPermitidos(dias), []);
  });
}


console.log("\ncondicionMetodoPago.js — requierePago (R20)");

test("requierePago(null) => true (sin restricción no bloquea)", () => {
  assert.equal(requierePago(null), true);
});

test('requierePago("CONTADO") => true', () => {
  assert.equal(requierePago("CONTADO"), true);
});

test('requierePago("CUENTA_CORRIENTE") => false', () => {
  assert.equal(requierePago("CUENTA_CORRIENTE"), false);
});

test('requierePago("CREDITO_30_DIAS") => false', () => {
  assert.equal(requierePago("CREDITO_30_DIAS"), false);
});



test("METODOS_POR_CONDICION tiene exactamente 5 claves (los 5 valores del enum)", () => {
  assert.equal(Object.keys(METODOS_POR_CONDICION).length, 5);
});

console.log(`\n${fallos === 0 ? "TODOS LOS TESTS PASARON" : `${fallos} TEST(S) FALLARON`}`);
if (fallos > 0) process.exit(1);
