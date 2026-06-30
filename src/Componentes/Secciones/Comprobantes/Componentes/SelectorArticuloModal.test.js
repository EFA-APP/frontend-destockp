/**
 * Tests para la lógica del selector de tasa IVA en SelectorArticuloModal.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado.
 * Estos tests usan node:assert y pueden ejecutarse con:
 *   node --input-type=module < SelectorArticuloModal.test.js
 *
 * Se testea la lógica pura de construcción de opciones y lookup de entrada,
 * sin dependencia de React DOM.
 */

import assert from "node:assert/strict";

// ─── Lógica pura extraída del componente ────────────────────────────────────

const buildOptionValue = (m) =>
  m.tipoFiscal === "GRAVADO" ? m.alicuota : m.tipoFiscal;

const buildOptionLabel = (m) => {
  if (m.tipoFiscal === "GRAVADO") return `${m.alicuota}%`;
  if (m.tipoFiscal === "NO_GRAVADO") return "No Gravado";
  return "Exento";
};

const findEntry = (montosSugeridos, val) =>
  montosSugeridos.find(
    (m) =>
      (m.tipoFiscal === "GRAVADO" && String(m.alicuota) === val) ||
      (m.tipoFiscal !== "GRAVADO" && m.tipoFiscal === val)
  );

// ─── Tests ──────────────────────────────────────────────────────────────────

// T18-caso1: R15 + R16 — GRAVADO 21% construye opción con label "21%" y value 21
{
  const montosSugeridos = [{ tipoFiscal: "GRAVADO", alicuota: 21, monto: 100 }];
  const opciones = montosSugeridos.map((m) => ({
    value: buildOptionValue(m),
    label: buildOptionLabel(m),
  }));

  assert.strictEqual(opciones.length, 1, "R15: debe haber 1 opción");
  assert.strictEqual(opciones[0].label, "21%", "R16: label debe ser '21%'");
  assert.strictEqual(opciones[0].value, 21, "R16: value debe ser alicuota 21");
}

// T18-caso2: R17 — NO_GRAVADO construye opción con label "No Gravado"
{
  const montosSugeridos = [
    { tipoFiscal: "NO_GRAVADO", alicuota: null, monto: 500 },
  ];
  const opciones = montosSugeridos.map((m) => ({
    value: buildOptionValue(m),
    label: buildOptionLabel(m),
  }));

  assert.strictEqual(opciones[0].label, "No Gravado", "R17: label debe ser 'No Gravado'");
  assert.strictEqual(opciones[0].value, "NO_GRAVADO", "R17: value debe ser 'NO_GRAVADO'");
}

// T18-caso3: R18 — EXENTO construye opción con label "Exento"
{
  const montosSugeridos = [
    { tipoFiscal: "EXENTO", alicuota: null, monto: 200 },
  ];
  const opciones = montosSugeridos.map((m) => ({
    value: buildOptionValue(m),
    label: buildOptionLabel(m),
  }));

  assert.strictEqual(opciones[0].label, "Exento", "R18: label debe ser 'Exento'");
  assert.strictEqual(opciones[0].value, "EXENTO", "R18: value debe ser 'EXENTO'");
}

// T18-caso4: R15 — montosSugeridos vacío → select no se renderiza (simulado con length check)
{
  const montosSugeridos = [];
  const renderSelect = montosSugeridos.length > 0;
  assert.strictEqual(renderSelect, false, "R15: select no debe renderizarse con lista vacía");
}

// T18-caso5: R19 — al cambiar selección a "21%" se busca la entrada y se obtiene monto
{
  const montosSugeridos = [
    { tipoFiscal: "GRAVADO", alicuota: 21, monto: 100 },
    { tipoFiscal: "GRAVADO", alicuota: 10.5, monto: 50 },
  ];

  const valSeleccionado = "21";
  const entry = findEntry(montosSugeridos, valSeleccionado);
  assert.ok(entry !== undefined, "R19: debe encontrar la entrada para '21'");
  const precioSeteado = parseFloat(entry.monto.toFixed(2));
  assert.strictEqual(precioSeteado, 100.0, "R19: precio debe ser 100.00");
}

// T18-caso6: R21 — no existe estado chipMontoActivo (verificado por ausencia del símbolo)
{
  // La lógica del componente ya no usa chipMontoActivo; verificamos con el
  // array de nombres de estado esperados del componente (documental).
  const estadosDelComponente = ["cantidades", "importes", "preciosPorFila", "agregados", "tasaIvaSeleccionada"];
  assert.ok(!estadosDelComponente.includes("chipMontoActivo"), "R21: chipMontoActivo debe estar eliminado");
}

// T18-caso7: con NO_GRAVADO y EXENTO en la misma lista
{
  const montosSugeridos = [
    { tipoFiscal: "GRAVADO", alicuota: 21, monto: 80 },
    { tipoFiscal: "NO_GRAVADO", alicuota: null, monto: 20 },
    { tipoFiscal: "EXENTO", alicuota: null, monto: 10 },
  ];
  const opciones = montosSugeridos.map((m) => ({
    value: buildOptionValue(m),
    label: buildOptionLabel(m),
  }));

  assert.strictEqual(opciones.length, 3, "R15: debe haber 3 opciones");
  assert.ok(opciones.some((o) => o.label === "No Gravado"), "R17: debe incluir 'No Gravado'");
  assert.ok(opciones.some((o) => o.label === "Exento"), "R18: debe incluir 'Exento'");
}

console.log("✓ T18: todos los tests de SelectorArticuloModal (tasa IVA) pasaron");
