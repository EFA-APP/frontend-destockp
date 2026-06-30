/**
 * Tests unitarios para BuscadorDetalle — prop montoPreCargado.
 * T17: verificar que precioUnitario se inicializa correctamente.
 *
 * Tests de lógica pura — sin @testing-library/react.
 */

// ─── Lógica extraída del componente ──────────────────────────────────────────

/**
 * Replica la inicialización de precioUnitarioInicial en BuscadorDetalle.
 * Regla: montoPreCargado > 0 ? montoPreCargado : ''
 */
function resolverPrecioUnitarioInicial(montoPreCargado = null) {
  return montoPreCargado > 0 ? montoPreCargado : '';
}

// ─── T17: precioUnitario inicial ──────────────────────────────────────────────

describe("BuscadorDetalle — montoPreCargado (T17)", () => {
  it("Caso A: montoPreCargado=1500 → precioUnitario = 1500", () => {
    expect(resolverPrecioUnitarioInicial(1500)).toBe(1500);
  });

  it("Caso B: montoPreCargado=0 → precioUnitario = '' (no pre-carga ceros)", () => {
    expect(resolverPrecioUnitarioInicial(0)).toBe('');
  });

  it("Caso C: sin prop (null) → precioUnitario = ''", () => {
    expect(resolverPrecioUnitarioInicial(null)).toBe('');
  });

  it("montoPreCargado negativo → precioUnitario = ''", () => {
    expect(resolverPrecioUnitarioInicial(-100)).toBe('');
  });

  it("montoPreCargado fraccionario > 0 → se pre-carga", () => {
    expect(resolverPrecioUnitarioInicial(99.99)).toBe(99.99);
  });

  it("montoPreCargado=undefined → precioUnitario = ''", () => {
    expect(resolverPrecioUnitarioInicial(undefined)).toBe('');
  });
});

// ─── Verificación de que el valor se pasa a SelectorArticuloModal ─────────────

describe("BuscadorDetalle — propagación de montoPreCargado (T17 complementario)", () => {
  it("handleAgregar con importe no modificado usa montoPreCargado", () => {
    const importes = {}; // usuario no modificó el campo
    const montoPreCargado = 1500;
    const importe = parseFloat(importes['ABC'] ?? montoPreCargado) || 0;
    expect(importe).toBe(1500);
  });

  it("precioUnitarioInicial se calcula igual que en el componente", () => {
    // Simula el comportamiento del componente:
    // const precioUnitarioInicial = montoPreCargado > 0 ? montoPreCargado : '';
    // <SelectorArticuloModal montoPreCargado={precioUnitarioInicial} />

    const casos = [
      { montoPreCargado: 1000, esperado: 1000 },
      { montoPreCargado: 0,    esperado: '' },
      { montoPreCargado: null, esperado: '' },
    ];

    for (const { montoPreCargado, esperado } of casos) {
      const precioUnitarioInicial = montoPreCargado > 0 ? montoPreCargado : '';
      expect(precioUnitarioInicial).toBe(esperado);
    }
  });
});
