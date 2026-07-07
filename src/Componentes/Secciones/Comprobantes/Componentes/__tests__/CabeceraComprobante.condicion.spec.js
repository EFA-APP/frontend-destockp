/**
 * Test para el select #condicion-comprobante de CabeceraComprobante.jsx (T13).
 * Cubre: R12.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado (sin RTL).
 * Este test lee el archivo fuente REAL y verifica, vía regex, que el bloque
 * del <select id="condicion-comprobante"> contiene exactamente las 9
 * opciones esperadas. Ejecutar con:
 *   node src/Componentes/Secciones/Comprobantes/Componentes/__tests__/CabeceraComprobante.condicion.spec.js
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rutaComponente = path.join(__dirname, "..", "CabeceraComprobante.jsx");
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

// Extrae el bloque del <select id="condicion-comprobante"> ... </select>
const matchSelect = fuente.match(
  /<select\s+id="condicion-comprobante"[\s\S]*?<\/select>/,
);

console.log("CabeceraComprobante.jsx — select #condicion-comprobante (R12)");

test("el select #condicion-comprobante existe en el archivo fuente", () => {
  assert.ok(matchSelect, "no se encontró el <select id=\"condicion-comprobante\">");
});

const bloqueSelect = matchSelect ? matchSelect[0] : "";
const valoresEncontrados = [
  ...bloqueSelect.matchAll(/<option value="([A-Z0-9_]+)">/g),
].map((m) => m[1]);

const VALORES_ESPERADOS = [
  "CONTADO",
  "CUENTA_CORRIENTE",
  "CREDITO_30_DIAS",
  "CREDITO_60_DIAS",
  "CREDITO_90_DIAS",
];

test("contiene exactamente las 5 opciones de condición", () => {
  assert.equal(valoresEncontrados.length, 5);
});

test("los 5 value coinciden exactamente con los 5 valores del enum (mismo orden)", () => {
  assert.deepEqual(valoresEncontrados, VALORES_ESPERADOS);
});

console.log(`\n${fallos === 0 ? "TODOS LOS TESTS PASARON" : `${fallos} TEST(S) FALLARON`}`);
if (fallos > 0) process.exit(1);
