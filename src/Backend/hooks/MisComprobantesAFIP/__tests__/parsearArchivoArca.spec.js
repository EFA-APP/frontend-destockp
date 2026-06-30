/**
 * Tests unitarios para parsearArchivoArca.
 *
 * SheetJS y File.arrayBuffer se mockean porque este entorno no tiene
 * binarios reales de XLSX disponibles.
 */

import { parsearArchivoArca } from "../useMisComprobantesAFIP.js";

// Mock de SheetJS
jest.mock("xlsx", () => {
  let _filas = [];
  return {
    __setFilas: (filas) => { _filas = filas; },
    read: jest.fn(() => ({ SheetNames: ["Hoja1"], Sheets: { Hoja1: {} } })),
    utils: {
      sheet_to_json: jest.fn(() => _filas),
    },
  };
});

const XLSX = require("xlsx");

// Fila de título, fila de headers y filas de datos
const buildFile = () => ({
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  name: "test.xlsx",
});

const HEADERS = [
  "Tipo",
  "Pto.Venta",
  "Número Desde",
  "Número Hasta",
  "Imp. Total",
  "Cód. Autorización",
  "Nro Doc. Emisor",
];

const makeFilas = (filasDatos) => [
  ["Mis Comprobantes Recibidos - CUIT 20123456789"], // fila 0: título
  HEADERS,                                             // fila 1: headers
  ...filasDatos,                                       // filas 2+: datos
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("parsearArchivoArca — columna Tipo", () => {
  it('R6 — extrae codigo numerico antes del primer " - "', async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].tipo).toBe("11");
  });

  it("R6 — tipo sin separador queda como esta", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11", 1, 500, 500, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].tipo).toBe("11");
  });
});

describe("parsearArchivoArca — CAE como string", () => {
  it("R10 — convierte numero a string", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(typeof items[0].cae).toBe("string");
    expect(items[0].cae).toBe("71234567890123");
  });
});

describe("parsearArchivoArca — celdas vacias o NaN", () => {
  it("R7 — celda null queda como null sin error", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, null, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].cae).toBeNull();
  });

  it("R7 — celda undefined queda como null sin error", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, undefined, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].cae).toBeNull();
  });

  it("R7 — celda string vacio queda como null sin error", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, "", "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].cae).toBeNull();
  });
});

describe("parsearArchivoArca — expansion de rangos", () => {
  it("R8+R9 — Numero Hasta > Numero Desde genera un item por numero", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 2, 100, 103, 500, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items).toHaveLength(4);
    expect(items.map((i) => i.numeroComprobante)).toEqual([100, 101, 102, 103]);
  });

  it("R9 — items expandidos conservan puntoVenta, total, cae y numeroDocumento originales", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 5, 10, 12, 750, 71234567890123, "30999999999"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "EGRESO");

    expect(items).toHaveLength(3);
    items.forEach((item) => {
      expect(item.puntoVenta).toBe(5);
      expect(item.total).toBe(750);
      expect(item.cae).toBe("71234567890123");
      expect(item.numeroDocumento).toBe("30999999999");
    });
  });

  it("R8 — Numero Hasta igual a Numero Desde genera un solo item", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 200, 200, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items).toHaveLength(1);
    expect(items[0].numeroComprobante).toBe(200);
  });
});

describe("parsearArchivoArca — operacion", () => {
  it("R11 — archivo EMITIDOS asigna operacion INGRESO", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "INGRESO");

    expect(items[0].operacion).toBe("INGRESO");
  });

  it("R11 — archivo RECIBIDOS asigna operacion EGRESO", async () => {
    XLSX.__setFilas(
      makeFilas([
        ["11 - Factura C", 1, 500, 500, 1000, 71234567890123, "20111111111"],
      ]),
    );
    const items = await parsearArchivoArca(buildFile(), "EGRESO");

    expect(items[0].operacion).toBe("EGRESO");
  });
});
