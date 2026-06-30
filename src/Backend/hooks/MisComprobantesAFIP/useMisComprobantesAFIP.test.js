/**
 * Tests unitarios para la lógica de extracción de otrosTributos en parsearArchivoArca.
 *
 * NOTA DE SETUP: el frontend no tiene runner de tests configurado (no hay jest
 * ni vitest en package.json). Estos tests usan node:assert y pueden ejecutarse
 * directamente con: node --experimental-vm-modules <archivo>
 * O bien agregar vitest al proyecto y ejecutar: npx vitest run <archivo>
 *
 * Lo que se testea aquí es la lógica pura de extracción de la columna
 * "Otros Tributos" y la construcción de mapaFrontend, sin depender de XLSX.
 */

import assert from "node:assert/strict";

// ─── Funciones extraídas de parsearArchivoArca para test unitario puro ───────

const limpiar = (valor) => {
  if (
    valor === undefined ||
    valor === null ||
    valor === "" ||
    (typeof valor === "number" && isNaN(valor))
  ) {
    return null;
  }
  return valor;
};

const makeGet = (headers) => (fila, nombreColumna) => {
  const idx = headers.indexOf(nombreColumna);
  return idx >= 0 ? limpiar(fila[idx]) : null;
};

const makeGetVariantes = (get) => (fila, ...variantes) => {
  for (const nombre of variantes) {
    const val = get(fila, nombre);
    if (val !== null) return val;
  }
  return null;
};

const extraerOtrosTributos = (fila, getVariantes) => {
  const otrosTributosRaw = getVariantes(fila, "Otros Tributos");
  return otrosTributosRaw !== null ? parseFloat(otrosTributosRaw) : null;
};

// ─── Tests ──────────────────────────────────────────────────────────────────

// T16-caso1: columna "Otros Tributos" = 50 → otrosTributos: 50
{
  const headers = ["Tipo", "Otros Tributos", "Imp. Total"];
  const fila = ["1", 50, 1000];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = extraerOtrosTributos(fila, getVariantes);
  assert.strictEqual(resultado, 50, "R12: columna Otros Tributos = 50 debe parsear como 50");
}

// T16-caso2: sin columna "Otros Tributos" → otrosTributos: null
{
  const headers = ["Tipo", "Imp. Total"];
  const fila = ["1", 1000];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = extraerOtrosTributos(fila, getVariantes);
  assert.strictEqual(resultado, null, "R12: sin columna Otros Tributos debe retornar null");
}

// T16-caso3: columna "Otros Tributos" con valor string numérico → parseFloat correcto
{
  const headers = ["Tipo", "Otros Tributos"];
  const fila = ["1", "123.45"];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = extraerOtrosTributos(fila, getVariantes);
  assert.strictEqual(resultado, 123.45, "R12: valor string numérico debe parsear correctamente");
}

// T16-caso4: mapaFrontend incluye otrosTributos en la entrada (R13)
{
  const items = [
    { puntoVenta: 1, numeroComprobante: 100, montosSugeridos: [], otrosTributos: 50 },
    { puntoVenta: 1, numeroComprobante: 101, montosSugeridos: [], otrosTributos: null },
  ];

  const mapaFrontend = new Map(
    items.map((i) => [
      `${i.puntoVenta}-${i.numeroComprobante}`,
      {
        montosSugeridos: i.montosSugeridos ?? [],
        otrosTributos: i.otrosTributos ?? 0,
      },
    ])
  );

  const entrada1 = mapaFrontend.get("1-100");
  assert.ok("otrosTributos" in entrada1, "R13: mapaFrontend debe incluir campo otrosTributos");
  assert.strictEqual(entrada1.otrosTributos, 50, "R13: otrosTributos=50 debe estar en mapa");

  const entrada2 = mapaFrontend.get("1-101");
  assert.strictEqual(entrada2.otrosTributos, 0, "R13: otrosTributos null debe normalizarse a 0");
}

// T16-caso5: resultadosCompletos merge incluye otrosTributos (R13)
{
  const mapaFrontend = new Map([
    ["1-100", { montosSugeridos: [], otrosTributos: 75 }],
  ]);

  const dataBackend = [{ puntoVenta: 1, numeroComprobante: 100, estado: "NO_REGISTRADO" }];

  const resultadosCompletos = dataBackend.map((r) => {
    const extra = mapaFrontend.get(`${r.puntoVenta}-${r.numeroComprobante}`);
    return {
      ...r,
      montosSugeridos: extra?.montosSugeridos ?? [],
      otrosTributos: extra?.otrosTributos ?? 0,
    };
  });

  assert.strictEqual(resultadosCompletos[0].otrosTributos, 75, "R13: resultadosCompletos debe incluir otrosTributos del mapa");
}

console.log("✓ T16: todos los tests de parsearArchivoArca (otrosTributos) pasaron");

// ─── Helpers para tests de montosSugeridos ───────────────────────────────────

const construirMontosSugeridos = (fila, getVariantes) => {
  const neto21Raw        = getVariantes(fila, "Neto Grav. IVA 21%");
  const neto105Raw       = getVariantes(fila, "Neto Grav. IVA 10,5%");
  const neto5Raw         = getVariantes(fila, "Neto Grav. IVA 5%");
  const neto25Raw        = getVariantes(fila, "Neto Grav. IVA 2,5%");
  const neto27Raw        = getVariantes(fila, "Neto Grav. IVA 27%");
  const netoNoGravadoRaw = getVariantes(fila, "Neto No Gravado");
  const opExentasRaw     = getVariantes(fila, "Op. Exentas");
  const netoGravadoTotalRaw = getVariantes(fila, "Neto Gravado Total");

  const neto21        = neto21Raw        !== null ? parseFloat(neto21Raw)        : null;
  const neto105       = neto105Raw       !== null ? parseFloat(neto105Raw)       : null;
  const neto5         = neto5Raw         !== null ? parseFloat(neto5Raw)         : null;
  const neto25        = neto25Raw        !== null ? parseFloat(neto25Raw)        : null;
  const neto27        = neto27Raw        !== null ? parseFloat(neto27Raw)        : null;
  const netoNoGravado = netoNoGravadoRaw !== null ? parseFloat(netoNoGravadoRaw) : null;
  const opExentas     = opExentasRaw     !== null ? parseFloat(opExentasRaw)     : null;
  const netoGravadoTotal = netoGravadoTotalRaw !== null ? parseFloat(netoGravadoTotalRaw) : null;

  const candidatosGravado = [];
  if (neto21   > 0) candidatosGravado.push({ label: "IVA 21%",   neto: neto21,   tipoFiscal: "GRAVADO", alicuota: 21   });
  if (neto105  > 0) candidatosGravado.push({ label: "IVA 10,5%", neto: neto105,  tipoFiscal: "GRAVADO", alicuota: 10.5 });
  if (neto5    > 0) candidatosGravado.push({ label: "IVA 5%",    neto: neto5,    tipoFiscal: "GRAVADO", alicuota: 5    });
  if (neto25   > 0) candidatosGravado.push({ label: "IVA 2,5%",  neto: neto25,   tipoFiscal: "GRAVADO", alicuota: 2.5  });
  if (neto27   > 0) candidatosGravado.push({ label: "IVA 27%",   neto: neto27,   tipoFiscal: "GRAVADO", alicuota: 27   });

  candidatosGravado.sort((a, b) => b.neto - a.neto);

  const montoItem = (netoGravadoTotal !== null && netoGravadoTotal > 0) ? netoGravadoTotal : null;

  const montosSugeridos = [];
  candidatosGravado.forEach(({ label, tipoFiscal, alicuota }) => {
    if (montoItem !== null) {
      montosSugeridos.push({ label, monto: montoItem, tipoFiscal, alicuota });
    }
  });
  if (netoNoGravado > 0) montosSugeridos.push({ label: "No Gravado", monto: netoNoGravado, tipoFiscal: "NO_GRAVADO", alicuota: null });
  if (opExentas     > 0) montosSugeridos.push({ label: "Exento",     monto: opExentas,     tipoFiscal: "EXENTO",     alicuota: null });

  return montosSugeridos;
};

// ─── Tests de montosSugeridos ────────────────────────────────────────────────

// caso single-rate: solo IVA 10,5%
{
  const headers = ["Neto Grav. IVA 10,5%", "Neto Gravado Total"];
  const fila = [500, 500];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = construirMontosSugeridos(fila, getVariantes);
  assert.strictEqual(resultado.length, 1, "single-rate: debe haber 1 entrada");
  assert.strictEqual(resultado[0].alicuota, 10.5, "single-rate: alicuota debe ser 10.5");
  assert.strictEqual(resultado[0].monto, 500, "single-rate: monto debe ser netoGravadoTotal");
}

// caso multi-rate: IVA 21% neto=300 + IVA 10,5% neto=100, netoGravadoTotal=400
{
  const headers = ["Neto Grav. IVA 21%", "Neto Grav. IVA 10,5%", "Neto Gravado Total"];
  const fila = [300, 100, 400];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = construirMontosSugeridos(fila, getVariantes);
  assert.strictEqual(resultado.length, 2, "multi-rate: debe haber 2 entradas");
  assert.strictEqual(resultado[0].alicuota, 21, "multi-rate: [0] debe ser alicuota 21 (mayor neto)");
  assert.strictEqual(resultado[0].monto, 400, "multi-rate: [0].monto debe ser netoGravadoTotal=400");
  assert.strictEqual(resultado[1].alicuota, 10.5, "multi-rate: [1] debe ser alicuota 10.5");
  assert.strictEqual(resultado[1].monto, 400, "multi-rate: [1].monto debe ser netoGravadoTotal=400");
}

// caso multi-rate invertido: IVA 10,5% neto=300 + IVA 21% neto=100, netoGravadoTotal=400
{
  const headers = ["Neto Grav. IVA 21%", "Neto Grav. IVA 10,5%", "Neto Gravado Total"];
  const fila = [100, 300, 400];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = construirMontosSugeridos(fila, getVariantes);
  assert.strictEqual(resultado[0].alicuota, 10.5, "multi-rate-inv: [0] debe ser alicuota 10.5 (mayor neto=300)");
  assert.strictEqual(resultado[0].monto, 400, "multi-rate-inv: [0].monto debe ser netoGravadoTotal=400");
}

// caso sin netoGravadoTotal: candidatos gravados no se agregan
{
  const headers = ["Neto Grav. IVA 21%"];
  const fila = [500];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = construirMontosSugeridos(fila, getVariantes);
  assert.strictEqual(resultado.length, 0, "sin netoGravadoTotal: montosSugeridos debe estar vacío para GRAVADO");
}

// caso con No Gravado y Exento: usan su propio neto
{
  const headers = ["Neto No Gravado", "Op. Exentas", "Neto Gravado Total"];
  const fila = [200, 100, 0];
  const get = makeGet(headers);
  const getVariantes = makeGetVariantes(get);
  const resultado = construirMontosSugeridos(fila, getVariantes);
  assert.strictEqual(resultado.length, 2, "no-gravado+exento: debe haber 2 entradas");
  assert.strictEqual(resultado[0].tipoFiscal, "NO_GRAVADO", "primera entrada debe ser NO_GRAVADO");
  assert.strictEqual(resultado[0].monto, 200, "NO_GRAVADO monto debe ser netoNoGravado");
  assert.strictEqual(resultado[1].tipoFiscal, "EXENTO", "segunda entrada debe ser EXENTO");
  assert.strictEqual(resultado[1].monto, 100, "EXENTO monto debe ser opExentas");
}

console.log("✓ montosSugeridos: todos los tests pasaron");

// ─── Helper parsearFecha (duplicado aquí para tests unitarios puros) ─────────

const parsearFecha = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) {
    const yyyy = raw.getFullYear();
    const mm = String(raw.getMonth() + 1).padStart(2, '0');
    const dd = String(raw.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof raw === 'string' && raw.includes('/')) {
    const [d, m, y] = raw.split('/');
    if (y && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
};

// ─── Tests de parsearFecha ────────────────────────────────────────────────────

// fecha-caso1: Date object → "yyyy-mm-dd"
{
  const fecha = parsearFecha(new Date(2026, 1, 27)); // mes 1 = febrero
  assert.strictEqual(fecha, "2026-02-27", "parsearFecha: Date object debe producir 2026-02-27");
}

// fecha-caso2: string "dd/mm/yyyy" → "yyyy-mm-dd"
{
  const fecha = parsearFecha("27/02/2026");
  assert.strictEqual(fecha, "2026-02-27", "parsearFecha: string dd/mm/yyyy debe producir 2026-02-27");
}

// fecha-caso3: null → null
{
  const fecha = parsearFecha(null);
  assert.strictEqual(fecha, null, "parsearFecha: null debe retornar null");
}

// fecha-caso4: undefined → null
{
  const fecha = parsearFecha(undefined);
  assert.strictEqual(fecha, null, "parsearFecha: undefined debe retornar null");
}

// fecha-caso5: resultadosCompletos merge incluye campo fecha
{
  const mapaFrontend = new Map([
    ["1-100", { montosSugeridos: [], otrosTributos: 0, fecha: "2026-02-27" }],
    ["1-101", { montosSugeridos: [], otrosTributos: 0, fecha: null }],
  ]);

  const dataBackend = [
    { puntoVenta: 1, numeroComprobante: 100, estado: "REGISTRADO" },
    { puntoVenta: 1, numeroComprobante: 101, estado: "NO_REGISTRADO" },
  ];

  const resultadosCompletos = dataBackend.map((r) => {
    const extra = mapaFrontend.get(`${r.puntoVenta}-${r.numeroComprobante}`);
    return {
      ...r,
      montosSugeridos: extra?.montosSugeridos ?? [],
      otrosTributos: extra?.otrosTributos ?? 0,
      fecha: extra?.fecha ?? null,
    };
  });

  assert.strictEqual(resultadosCompletos[0].fecha, "2026-02-27", "resultadosCompletos: debe mergear fecha del mapa");
  assert.strictEqual(resultadosCompletos[1].fecha, null, "resultadosCompletos: fecha null debe quedar null");
}

// fecha-caso6: fecha no llega al backend (strip correcto)
{
  const items = [
    { puntoVenta: 1, numeroComprobante: 100, total: 1000, fecha: "2026-02-27", montosSugeridos: [], otrosTributos: 0 },
  ];
  const itemsBackend = items.map(({ montosSugeridos, otrosTributos, fecha, ...rest }) => rest);
  assert.ok(!("fecha" in itemsBackend[0]), "strip: fecha no debe estar en itemsBackend");
  assert.ok("puntoVenta" in itemsBackend[0], "strip: puntoVenta debe permanecer en itemsBackend");
}

console.log("✓ parsearFecha: todos los tests pasaron");
