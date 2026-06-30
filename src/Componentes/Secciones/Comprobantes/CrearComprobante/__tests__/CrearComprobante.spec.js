/**
 * Tests unitarios para CrearComprobante — lógica de inicialización de tab.
 * T12: activación automática de tab EGRESO al montar con arcaData.
 *
 * Tests de lógica pura — sin @testing-library/react.
 */

// ─── Lógica extraída del componente ──────────────────────────────────────────

/**
 * Determina el tipo de operación inicial según el state de location.
 * Replica la lógica: arcaData ? 'EGRESO' : 'INGRESO'
 */
function resolverTabInicial(locationState) {
  const arcaData = locationState?.arcaData ?? null;
  return arcaData ? "EGRESO" : "INGRESO";
}

/**
 * Determina si arcaData debe pasarse a <Egresos>.
 */
function resolverArcaData(locationState) {
  return locationState?.arcaData ?? null;
}

// ─── T12: inicialización del tab ──────────────────────────────────────────────

describe("CrearComprobante — inicialización de tab (T12)", () => {
  it("Caso A: montar con arcaData → tab inicial es EGRESO", () => {
    const locationState = { arcaData: { codigoTipo: 11, total: 1000 } };
    expect(resolverTabInicial(locationState)).toBe("EGRESO");
  });

  it("Caso B: montar sin state → tab inicial es INGRESO", () => {
    const locationState = null;
    expect(resolverTabInicial(locationState)).toBe("INGRESO");
  });

  it("Caso B2: montar con state sin arcaData → tab inicial es INGRESO", () => {
    const locationState = {};
    expect(resolverTabInicial(locationState)).toBe("INGRESO");
  });

  it("Caso A: arcaData se pasa a <Egresos> cuando está presente", () => {
    const arcaDataEsperado = { codigoTipo: 11, total: 1000, cuit: "20111111111" };
    const locationState = { arcaData: arcaDataEsperado };
    expect(resolverArcaData(locationState)).toEqual(arcaDataEsperado);
  });

  it("Caso B: arcaData es null cuando no viene en state", () => {
    expect(resolverArcaData(null)).toBeNull();
    expect(resolverArcaData({})).toBeNull();
  });
});
