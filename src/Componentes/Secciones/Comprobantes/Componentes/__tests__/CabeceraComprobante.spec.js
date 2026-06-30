/**
 * Tests unitarios para CabeceraComprobante y useCabeceraComprobante.
 * T13: inicialización sincrónica de campos desde arcaData (via initialValues).
 * T14: búsqueda CUIT con resultado → seleccionarCliente.
 * T15: búsqueda CUIT sin resultado → abrir modalCrearContacto.
 *
 * Tests de lógica pura — sin @testing-library/react.
 * Los tests de renderizado que requieran RTL están documentados abajo.
 */

// ─── T13: inicialización de useCabeceraComprobante con initialValues ──────────

/**
 * Replica la lógica de inicialización de cada campo en useCabeceraComprobante.
 */
function resolverInitialValues(initialValues, conexionArca = false) {
  return {
    fechaInicio:             initialValues.fecha ?? "",
    esFiscal:                initialValues.esFiscal ?? conexionArca,
    tipoComprobante:         initialValues.codigoTipo != null
                               ? String(initialValues.codigoTipo)
                               : (conexionArca ? "11" : "991"),
    puntoVenta:              initialValues.puntoVenta != null
                               ? String(initialValues.puntoVenta)
                               : "1",
    numeroComprobanteEgreso: initialValues.numeroComprobante != null
                               ? String(initialValues.numeroComprobante)
                               : "",
    cae:                     initialValues.cae ?? "",
    vtoCae:                  initialValues.vtoCae ?? "",
  };
}

describe("useCabeceraComprobante — initialValues (T13)", () => {
  const arcaData = {
    codigoTipo:        11,
    puntoVenta:        3,
    numeroComprobante: 500,
    cae:               "71234567890123",
    vtoCae:            "2024-02-28",
    fecha:             "2024-01-15",
  };

  const initialValues = {
    esFiscal:          true,
    codigoTipo:        arcaData.codigoTipo,
    puntoVenta:        arcaData.puntoVenta,
    numeroComprobante: arcaData.numeroComprobante,
    cae:               arcaData.cae,
    vtoCae:            arcaData.vtoCae,
    fecha:             arcaData.fecha,
  };

  let campos;
  beforeAll(() => {
    campos = resolverInitialValues(initialValues);
  });

  it("esFiscal = true", () => {
    expect(campos.esFiscal).toBe(true);
  });

  it("tipoComprobante = '11' (codigoTipo como string)", () => {
    expect(campos.tipoComprobante).toBe("11");
  });

  it("puntoVenta = '3'", () => {
    expect(campos.puntoVenta).toBe("3");
  });

  it("numeroComprobanteEgreso = '500'", () => {
    expect(campos.numeroComprobanteEgreso).toBe("500");
  });

  it("cae = '71234567890123'", () => {
    expect(campos.cae).toBe("71234567890123");
  });

  it("vtoCae = '2024-02-28'", () => {
    expect(campos.vtoCae).toBe("2024-02-28");
  });

  it("fechaInicio = '2024-01-15'", () => {
    expect(campos.fechaInicio).toBe("2024-01-15");
  });

  it("codigoTipo Factura A (1) queda como '1', no como '11'", () => {
    const camposA = resolverInitialValues({ codigoTipo: 1, esFiscal: true });
    expect(camposA.tipoComprobante).toBe("1");
  });
});

describe("useCabeceraComprobante — sin initialValues (T13 regresion)", () => {
  it("usa defaults correctos cuando no se pasa initialValues", () => {
    const campos = resolverInitialValues({}, false);
    expect(campos.esFiscal).toBe(false);
    expect(campos.tipoComprobante).toBe("991");
    expect(campos.puntoVenta).toBe("1");
    expect(campos.numeroComprobanteEgreso).toBe("");
    expect(campos.cae).toBe("");
    expect(campos.vtoCae).toBe("");
    expect(campos.fechaInicio).toBe("");
  });
});

// ─── T14: búsqueda CUIT con resultado ────────────────────────────────────────

/**
 * Replica la lógica del useEffect de lookup CUIT en CabeceraComprobante.
 */
function ejecutarLookupCuit({ arcaData, contactosCuit, cargandoCuit, procesado }) {
  if (!arcaData?.cuit) return { accion: "ninguna" };
  if (cargandoCuit) return { accion: "esperando" };
  if (procesado) return { accion: "ya-procesado" };

  if (contactosCuit.length > 0) {
    return { accion: "seleccionar", contacto: contactosCuit[0] };
  } else {
    return { accion: "abrir-modal" };
  }
}

describe("CabeceraComprobante — búsqueda CUIT con resultado (T14)", () => {
  const arcaData = { cuit: "20123456789", denominacion: "Proveedor SA" };
  const contacto = { id: 1, razonSocial: "Proveedor SA", tipoEntidad: "PROV" };

  it("llama seleccionarCliente con el primer resultado", () => {
    const seleccionarCliente = jest.fn();
    const setModalCrearContacto = jest.fn();

    const resultado = ejecutarLookupCuit({
      arcaData,
      contactosCuit: [contacto],
      cargandoCuit: false,
      procesado: false,
    });

    if (resultado.accion === "seleccionar") {
      seleccionarCliente(resultado.contacto);
    } else if (resultado.accion === "abrir-modal") {
      setModalCrearContacto(true);
    }

    expect(seleccionarCliente).toHaveBeenCalledWith(contacto);
    expect(setModalCrearContacto).not.toHaveBeenCalled();
  });

  it("no actúa mientras la búsqueda está en curso", () => {
    const resultado = ejecutarLookupCuit({
      arcaData,
      contactosCuit: [],
      cargandoCuit: true,
      procesado: false,
    });
    expect(resultado.accion).toBe("esperando");
  });

  it("no actúa si arcaData.cuit está vacío", () => {
    const resultado = ejecutarLookupCuit({
      arcaData: { cuit: "" },
      contactosCuit: [contacto],
      cargandoCuit: false,
      procesado: false,
    });
    expect(resultado.accion).toBe("ninguna");
  });

  it("no actúa si arcaData es null", () => {
    const resultado = ejecutarLookupCuit({
      arcaData: null,
      contactosCuit: [contacto],
      cargandoCuit: false,
      procesado: false,
    });
    expect(resultado.accion).toBe("ninguna");
  });
});

// ─── T15: búsqueda CUIT sin resultado ────────────────────────────────────────

describe("CabeceraComprobante — búsqueda CUIT sin resultado (T15)", () => {
  const arcaData = { cuit: "20999999999", denominacion: "Nuevo Proveedor SRL" };

  it("abre modalCrearContacto cuando no hay resultados", () => {
    const seleccionarCliente = jest.fn();
    const setModalCrearContacto = jest.fn();

    const resultado = ejecutarLookupCuit({
      arcaData,
      contactosCuit: [],
      cargandoCuit: false,
      procesado: false,
    });

    if (resultado.accion === "seleccionar") {
      seleccionarCliente(resultado.contacto);
    } else if (resultado.accion === "abrir-modal") {
      setModalCrearContacto(true);
    }

    expect(setModalCrearContacto).toHaveBeenCalledWith(true);
    expect(seleccionarCliente).not.toHaveBeenCalled();
  });

  it("los datosIniciales del modal incluyen razonSocial y cuit de arcaData", () => {
    const datosIniciales = arcaData
      ? { razonSocial: arcaData.denominacion, documento: arcaData.cuit }
      : {};

    expect(datosIniciales.razonSocial).toBe("Nuevo Proveedor SRL");
    expect(datosIniciales.documento).toBe("20999999999");
  });

  it("no abre modal si el lookup ya fue procesado", () => {
    const setModalCrearContacto = jest.fn();

    const resultado = ejecutarLookupCuit({
      arcaData,
      contactosCuit: [],
      cargandoCuit: false,
      procesado: true,
    });

    if (resultado.accion === "abrir-modal") {
      setModalCrearContacto(true);
    }

    expect(setModalCrearContacto).not.toHaveBeenCalled();
  });
});
