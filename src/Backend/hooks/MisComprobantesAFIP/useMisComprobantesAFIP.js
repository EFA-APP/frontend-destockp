import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { axiosInitial } from "../../Config/index.js";
import { useAuthStore } from "../../Autenticacion/store/authenticacion.store.js";

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

export const parsearArchivoArca = async (file, operacion) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null });

  // fila 0: título ("Mis Comprobantes Recibidos - CUIT..."), se ignora
  // fila 1: headers reales
  const headers = filas[1] ?? [];
  const datosFilas = filas.slice(2);

  // Log para diagnosticar nombres exactos de columnas del Excel de ARCA
  console.log("[parsearArchivoArca] headers detectados:", headers);

  const get = (fila, nombreColumna) => {
    const idx = headers.indexOf(nombreColumna);
    return idx >= 0 ? limpiar(fila[idx]) : null;
  };

  // Busca el primer valor no-null entre varias variantes de nombre de columna
  const getVariantes = (fila, ...variantes) => {
    for (const nombre of variantes) {
      const val = get(fila, nombre);
      if (val !== null) return val;
    }
    return null;
  };

  const items = [];

  for (const fila of datosFilas) {
    if (!Array.isArray(fila) || fila.every((c) => c === null)) {
      continue;
    }

    const tipoRaw = getVariantes(fila, "Tipo");
    const tipo =
      tipoRaw !== null ? String(tipoRaw).split(" - ")[0].trim() : null;

    // Punto de venta — "Punto de Venta" es el nombre real del Excel de ARCA;
    // las variantes abreviadas quedan como fallback.
    const puntoVentaRaw = getVariantes(
      fila,
      "Punto de Venta",
      "Pto. Venta",
      "Pto.Venta",
      "Pto. Vta.",
      "Pto.Vta.",
      "PtoVenta",
    );
    const puntoVenta =
      puntoVentaRaw !== null ? parseInt(puntoVentaRaw, 10) : null;

    // Número desde / hasta — convertir a entero para aritmética de rangos
    const numeroDesdeRaw = getVariantes(
      fila,
      "Número Desde",
      "Nro.Desde",
      "Nro. Desde",
      "NroDesde",
      "Número Desde",
    );
    const numeroDesde =
      numeroDesdeRaw !== null ? parseInt(numeroDesdeRaw, 10) : null;

    const numeroHastaRaw = getVariantes(
      fila,
      "Número Hasta",
      "Nro.Hasta",
      "Nro. Hasta",
      "NroHasta",
      "Número Hasta",
    );
    const numeroHasta =
      numeroHastaRaw !== null ? parseInt(numeroHastaRaw, 10) : null;

    // Total — parseFloat para manejar tanto string como number de SheetJS
    const totalRaw = getVariantes(fila, "Imp. Total", "Importe Total", "Total");
    const total = totalRaw !== null ? parseFloat(totalRaw) : null;

    // Columnas de IVA / neto desglosado
    const neto21Raw        = getVariantes(fila, "Neto Grav. IVA 21%");
    const neto105Raw       = getVariantes(fila, "Neto Grav. IVA 10,5%");
    const neto5Raw         = getVariantes(fila, "Neto Grav. IVA 5%");
    const neto25Raw        = getVariantes(fila, "Neto Grav. IVA 2,5%");
    const neto27Raw        = getVariantes(fila, "Neto Grav. IVA 27%");
    const netoNoGravadoRaw = getVariantes(fila, "Neto No Gravado");
    const opExentasRaw     = getVariantes(fila, "Op. Exentas");
    const netoGravadoTotalRaw = getVariantes(fila, "Neto Gravado Total");
    const netoGravadoTotal = netoGravadoTotalRaw !== null ? parseFloat(netoGravadoTotalRaw) : null;

    const neto21        = neto21Raw        !== null ? parseFloat(neto21Raw)        : null;
    const neto105       = neto105Raw       !== null ? parseFloat(neto105Raw)       : null;
    const neto5         = neto5Raw         !== null ? parseFloat(neto5Raw)         : null;
    const neto25        = neto25Raw        !== null ? parseFloat(neto25Raw)        : null;
    const neto27        = neto27Raw        !== null ? parseFloat(neto27Raw)        : null;
    const netoNoGravado = netoNoGravadoRaw !== null ? parseFloat(netoNoGravadoRaw) : null;
    const opExentas     = opExentasRaw     !== null ? parseFloat(opExentasRaw)     : null;

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

    // Otros Tributos
    const otrosTributosRaw = getVariantes(fila, "Otros Tributos");
    const otrosTributos = otrosTributosRaw !== null ? parseFloat(otrosTributosRaw) : null;

    // CAE — siempre string (puede llegar como número grande de SheetJS)
    const caeRaw = getVariantes(fila, "Cód. Autorización", "Cod. Autorización", "CAE");
    const cae = caeRaw !== null ? String(caeRaw) : null;

    // Número de documento — los CUITs llegan como number en Excel, forzar string.
    // "Nro. Doc. Emisor" (con punto) es el nombre real en el Excel de ARCA.
    const numeroDocumentoRaw = getVariantes(
      fila,
      "Nro. Doc. Emisor",
      "Nro Doc. Emisor",
      "Nro. Doc. Receptor",
      "Nro Doc. Receptor",
      "CUIT",
    );
    const numeroDocumento =
      numeroDocumentoRaw !== null ? String(numeroDocumentoRaw) : null;

    const denominacion = getVariantes(
      fila,
      "Denominación Emisor",
      "Denominacion Emisor",
      "Denominación Receptor",
      "Denominacion Receptor",
      "Razón Social",
      "Razon Social",
    );

    const fechaRaw = getVariantes(fila, "Fecha");
    const fecha = parsearFecha(fechaRaw);

    const desde = numeroDesde ?? 0;
    const hasta = numeroHasta ?? desde;

    if (hasta > desde) {
      for (let n = desde; n <= hasta; n++) {
        items.push({
          tipo,
          puntoVenta,
          numeroComprobante: n,
          total,
          cae,
          numeroDocumento,
          denominacion,
          operacion,
          fecha,
          montosSugeridos,
          otrosTributos,
        });
      }
    } else {
      items.push({
        tipo,
        puntoVenta,
        numeroComprobante: desde,
        total,
        cae,
        numeroDocumento,
        denominacion,
        operacion,
        fecha,
        montosSugeridos,
        otrosTributos,
      });
    }
  }

  return items;
};

export const useMisComprobantesAFIP = () => {
  const { usuario, unidadActiva } = useAuthStore();

  const storageKey = `arca-items-${usuario?.codigoEmpresa ?? ''}-${unidadActiva?.codigo ?? ''}`;

  const [archivoRecibidos, setArchivoRecibidos] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const _ejecutarValidacion = async (items) => {
    const mapaFrontend = new Map(
      items.map((i) => [
        `${i.puntoVenta}-${i.numeroComprobante}`,
        {
          montosSugeridos: i.montosSugeridos ?? [],
          otrosTributos: i.otrosTributos ?? 0,
          fecha: i.fecha ?? null,
        },
      ])
    );

    const itemsBackend = items.map(({ montosSugeridos, otrosTributos, fecha, ...rest }) => rest);
    const { data } = await axiosInitial.post(
      "/arca/comprobantes/validar",
      { items: itemsBackend },
    );

    const resultadosCompletos = data.map((r) => {
      const extra = mapaFrontend.get(`${r.puntoVenta}-${r.numeroComprobante}`);
      return {
        ...r,
        montosSugeridos: extra?.montosSugeridos ?? [],
        otrosTributos: extra?.otrosTributos ?? 0,
        fecha: extra?.fecha ?? null,
      };
    });

    setResultados(resultadosCompletos);
  };

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    let items;
    try {
      items = JSON.parse(stored);
    } catch (_) {
      return;
    }

    if (!Array.isArray(items) || items.length === 0) return;

    setCargando(true);
    setError(null);
    _ejecutarValidacion(items)
      .catch((err) => {
        setError(err?.response?.data?.message ?? err.message ?? "Error al revalidar");
      })
      .finally(() => setCargando(false));
  }, [storageKey]);

  const validar = async () => {
    if (!archivoRecibidos) return;

    setCargando(true);
    setError(null);

    try {
      const codigoEmpresa = String(usuario?.codigoEmpresa ?? "");
      const codigoUnidadNegocio = String(unidadActiva?.codigo ?? "");

      const itemsParseados = await parsearArchivoArca(archivoRecibidos, "EGRESO");

      const items = itemsParseados.map((item) => ({
        ...item,
        codigoEmpresa,
        codigoUnidadNegocio,
      }));

      // Persistir para re-validar cuando el usuario vuelva
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (_) {}

      await _ejecutarValidacion(items);
    } catch (err) {
      setError(err?.response?.data?.message ?? err.message ?? "Error al validar");
    } finally {
      setCargando(false);
    }
  };

  const limpiarCache = () => {
    try { localStorage.removeItem(storageKey); } catch (_) {}
    setResultados(null);
    setArchivoRecibidos(null);
    setError(null);
  };

  return {
    archivoRecibidos,
    setArchivoRecibidos,
    resultados,
    cargando,
    error,
    validar,
    limpiarCache,
  };
};
