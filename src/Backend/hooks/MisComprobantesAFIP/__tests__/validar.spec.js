/**
 * Tests unitarios para la funcion validar() del hook useMisComprobantesAFIP.
 *
 * Estrategia: el hook se invoca como funcion regular (sin React renderer).
 * Se mockean React.useState, useAuthStore, axiosInitial y xlsx para aislar
 * completamente la logica de validar().
 */

// ── Mocks de modulos externos ────────────────────────────────────────────────

jest.mock("xlsx", () => ({
  read: jest.fn(),
  utils: { sheet_to_json: jest.fn() },
}));

jest.mock("../../../Autenticacion/store/authenticacion.store.js", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../../../Config/index.js", () => ({
  axiosInitial: { post: jest.fn() },
}));

// ── Imports (despues de los mocks) ──────────────────────────────────────────

import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store.js";
import { axiosInitial } from "../../../Config/index.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ITEMS_EMITIDOS = [
  {
    tipo: "11",
    puntoVenta: 1,
    numeroComprobante: 100,
    total: 1000,
    cae: "71111111111111",
    numeroDocumento: "20111111111",
    denominacion: "Empresa SRL",
    operacion: "INGRESO",
  },
];

const ITEMS_RECIBIDOS = [
  {
    tipo: "6",
    puntoVenta: 2,
    numeroComprobante: 200,
    total: 500,
    cae: "72222222222222",
    numeroDocumento: "30222222222",
    denominacion: "Proveedor SA",
    operacion: "EGRESO",
  },
];

const buildFile = (name = "archivo.xlsx") => ({
  name,
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
});

// ── Setup de React.useState ──────────────────────────────────────────────────
//
// El hook llama useState 5 veces en orden:
//   0 → archivoEmitidos  (null)
//   1 → archivoRecibidos (null)
//   2 → resultados        (null)
//   3 → cargando          (false)
//   4 → error             (null)
//
// Para cada test construimos un estado controlado y lo inyectamos via mock.

const buildUseStateMock = ({
  archivoEmitidos = null,
  archivoRecibidos = null,
} = {}) => {
  const setResultados = jest.fn();
  const setCargando = jest.fn();
  const setError = jest.fn();

  const states = [
    [archivoEmitidos, jest.fn()],
    [archivoRecibidos, jest.fn()],
    [null, setResultados],
    [false, setCargando],
    [null, setError],
  ];

  let call = 0;
  const useStateMock = jest.fn(() => states[call++]);

  return { useStateMock, setResultados, setCargando, setError };
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("validar() — R12", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.mockReturnValue({
      usuario: { codigoEmpresa: 1 },
      unidadActiva: { codigo: 2 },
    });
  });

  it("llama parsearArchivoArca con INGRESO para el archivo EMITIDOS y con EGRESO para RECIBIDOS, luego concatena y llama axiosInitial.post", async () => {
    const archivoEmitidos = buildFile("emitidos.xlsx");
    const archivoRecibidos = buildFile("recibidos.xlsx");

    const { useStateMock, setResultados, setCargando, setError } =
      buildUseStateMock({ archivoEmitidos, archivoRecibidos });

    // Mockear xlsx para que parsearArchivoArca devuelva items controlados segun
    // el nombre del archivo (INGRESO vs EGRESO se controla por el parametro operacion)
    const XLSX = require("xlsx");
    let xlsxCallCount = 0;
    XLSX.read.mockImplementation(() => ({
      SheetNames: ["Hoja1"],
      Sheets: { Hoja1: {} },
    }));
    XLSX.utils.sheet_to_json.mockImplementation(() => {
      xlsxCallCount += 1;
      // Primera llamada → emitidos (fila de titulo + headers + 1 fila de datos)
      if (xlsxCallCount === 1) {
        return [
          ["Mis Comprobantes - CUIT 1"],
          ["Tipo", "Pto.Venta", "Número Desde", "Número Hasta", "Imp. Total", "Cód. Autorización", "Nro Doc. Emisor", "Denominación Emisor"],
          ["11 - Factura C", 1, 100, 100, 1000, 71111111111111, "20111111111", "Empresa SRL"],
        ];
      }
      // Segunda llamada → recibidos
      return [
        ["Mis Comprobantes - CUIT 1"],
        ["Tipo", "Pto.Venta", "Número Desde", "Número Hasta", "Imp. Total", "Cód. Autorización", "Nro Doc. Receptor", "Denominación Receptor"],
        ["6 - Factura B", 2, 200, 200, 500, 72222222222222, "30222222222", "Proveedor SA"],
      ];
    });

    axiosInitial.post.mockResolvedValue({ data: [] });

    // Inyectar useState mock en React
    const React = require("react");
    const originalUseState = React.useState;
    React.useState = useStateMock;

    try {
      const { useMisComprobantesAFIP } = require("../useMisComprobantesAFIP.js");
      const hookResult = useMisComprobantesAFIP();
      await hookResult.validar();
    } finally {
      React.useState = originalUseState;
    }

    // axiosInitial.post debe haber sido invocado
    expect(axiosInitial.post).toHaveBeenCalledTimes(1);

    const [url, body] = axiosInitial.post.mock.calls[0];
    expect(url).toBe("/arca/comprobantes/validar");
    expect(body).toHaveProperty("items");
    expect(Array.isArray(body.items)).toBe(true);

    // El array combinado debe contener items de EMITIDOS con INGRESO y RECIBIDOS con EGRESO
    const items = body.items;
    const ingreso = items.filter((i) => i.operacion === "INGRESO");
    const egreso = items.filter((i) => i.operacion === "EGRESO");
    expect(ingreso.length).toBeGreaterThanOrEqual(1);
    expect(egreso.length).toBeGreaterThanOrEqual(1);

    // codigoEmpresa y codigoUnidadNegocio deben estar en cada item
    items.forEach((item) => {
      expect(item.codigoEmpresa).toBe("1");
      expect(item.codigoUnidadNegocio).toBe("2");
    });
  });

  it("no llama axiosInitial.post cuando ambos archivos son null", async () => {
    const { useStateMock } = buildUseStateMock({
      archivoEmitidos: null,
      archivoRecibidos: null,
    });

    const React = require("react");
    const originalUseState = React.useState;
    React.useState = useStateMock;

    try {
      const { useMisComprobantesAFIP } = require("../useMisComprobantesAFIP.js");
      const hookResult = useMisComprobantesAFIP();
      await hookResult.validar();
    } finally {
      React.useState = originalUseState;
    }

    expect(axiosInitial.post).not.toHaveBeenCalled();
  });

  it("almacena resultado en setResultados cuando la llamada HTTP tiene exito", async () => {
    const archivoEmitidos = buildFile("emitidos.xlsx");
    const respuestaApi = [{ estado: "REGISTRADO" }];

    const { useStateMock, setResultados } = buildUseStateMock({
      archivoEmitidos,
    });

    const XLSX = require("xlsx");
    XLSX.read.mockReturnValue({ SheetNames: ["H"], Sheets: { H: {} } });
    XLSX.utils.sheet_to_json.mockReturnValue([
      ["Mis Comprobantes - CUIT 1"],
      ["Tipo", "Pto.Venta", "Número Desde", "Número Hasta", "Imp. Total", "Cód. Autorización", "Nro Doc. Emisor"],
      ["11 - Factura C", 1, 100, 100, 1000, 71111111111111, "20111111111"],
    ]);

    axiosInitial.post.mockResolvedValue({ data: respuestaApi });

    const React = require("react");
    const originalUseState = React.useState;
    React.useState = useStateMock;

    try {
      const { useMisComprobantesAFIP } = require("../useMisComprobantesAFIP.js");
      const hookResult = useMisComprobantesAFIP();
      await hookResult.validar();
    } finally {
      React.useState = originalUseState;
    }

    expect(setResultados).toHaveBeenCalledWith(respuestaApi);
  });
});
