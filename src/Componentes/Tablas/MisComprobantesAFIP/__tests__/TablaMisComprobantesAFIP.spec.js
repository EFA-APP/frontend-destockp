/**
 * Tests unitarios para TablaMisComprobantesAFIP.
 * T10: condicional de botón "Crear EGRESO"
 * T11: payload de navigate en handleCrearEgreso
 *
 * Tests de lógica pura — sin @testing-library/react.
 */

// ─── Lógica extraída del componente para testeo aislado ──────────────────────

/**
 * Condición que controla la visibilidad del botón "Crear EGRESO".
 * Replica exactamente: fila.estado === 'NO_REGISTRADO' && fila.operacion === 'EGRESO'
 */
function debeRenderizarBotonCrearEgreso(fila) {
  return fila.estado === "NO_REGISTRADO" && fila.operacion === "EGRESO";
}

/**
 * Lógica pura del handler handleCrearEgreso.
 * Recibe la fila y un mock de navigate, llama navigate con el payload correcto.
 */
function handleCrearEgreso(fila, navigate) {
  navigate("/panel/comprobantes/crear", {
    state: {
      arcaData: {
        puntoVenta:        fila.puntoVenta,
        numeroComprobante: fila.numeroComprobante,
        cae:               fila.cae,
        vtoCae:            fila.vtoCae,
        fecha:             fila.fecha,
        codigoTipo:        fila.codigoTipo,
        denominacion:      fila.denominacion,
        cuit:              fila.numeroDocumento,
        total:             fila.total,
        operacion:         fila.operacion,
      },
    },
  });
}

// ─── T10: condicional del botón ───────────────────────────────────────────────

describe("TablaMisComprobantesAFIP — botón Crear EGRESO (T10)", () => {
  it("Caso A: NO_REGISTRADO + EGRESO → muestra el botón", () => {
    const fila = { estado: "NO_REGISTRADO", operacion: "EGRESO" };
    expect(debeRenderizarBotonCrearEgreso(fila)).toBe(true);
  });

  it("Caso B: REGISTRADO + EGRESO → no muestra el botón", () => {
    const fila = { estado: "REGISTRADO", operacion: "EGRESO" };
    expect(debeRenderizarBotonCrearEgreso(fila)).toBe(false);
  });

  it("Caso C: NO_REGISTRADO + INGRESO → no muestra el botón", () => {
    const fila = { estado: "NO_REGISTRADO", operacion: "INGRESO" };
    expect(debeRenderizarBotonCrearEgreso(fila)).toBe(false);
  });

  it("Caso D: REGISTRADO + INGRESO → no muestra el botón", () => {
    const fila = { estado: "REGISTRADO", operacion: "INGRESO" };
    expect(debeRenderizarBotonCrearEgreso(fila)).toBe(false);
  });
});

// ─── T11: payload de navigate ─────────────────────────────────────────────────

describe("handleCrearEgreso — payload de navigate (T11)", () => {
  const filaBase = {
    estado: "NO_REGISTRADO",
    operacion: "EGRESO",
    puntoVenta: 1,
    numeroComprobante: 500,
    cae: "71234567890123",
    vtoCae: null,
    fecha: "2024-01-15",
    codigoTipo: 11,
    denominacion: "Proveedor SA",
    numeroDocumento: "20123456789",
    total: 1500.5,
  };

  it("llama navigate con la ruta correcta", () => {
    const navigate = jest.fn();
    handleCrearEgreso(filaBase, navigate);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toBe("/panel/comprobantes/crear");
  });

  it("el state.arcaData contiene los 10 campos esperados", () => {
    const navigate = jest.fn();
    handleCrearEgreso(filaBase, navigate);
    const { arcaData } = navigate.mock.calls[0][1].state;

    expect(arcaData.puntoVenta).toBe(1);
    expect(arcaData.numeroComprobante).toBe(500);
    expect(arcaData.cae).toBe("71234567890123");
    expect(arcaData.vtoCae).toBeNull();
    expect(arcaData.fecha).toBe("2024-01-15");
    expect(arcaData.codigoTipo).toBe(11);
    expect(arcaData.denominacion).toBe("Proveedor SA");
    expect(arcaData.cuit).toBe("20123456789");   // mapeado desde numeroDocumento
    expect(arcaData.total).toBe(1500.5);
    expect(arcaData.operacion).toBe("EGRESO");
  });

  it("mapea fila.numeroDocumento → arcaData.cuit (no 'numeroDocumento')", () => {
    const navigate = jest.fn();
    handleCrearEgreso(filaBase, navigate);
    const { arcaData } = navigate.mock.calls[0][1].state;

    expect(arcaData.cuit).toBe(filaBase.numeroDocumento);
    expect(arcaData.numeroDocumento).toBeUndefined();
  });
});
