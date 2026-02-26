import { useState, useMemo } from "react";

export const useMisComprobantesAFIP = () => {
  // Simula respuesta AFIP
  const [comprobantesAFIP, setComprobantesAFIP] = useState([
    {
      id: "AFIP-1",
      cuitEmisor: "30712345678",
      razonSocial: "Proveedor SRL",
      tipo: "FA",
      letra: "A",
      puntoVenta: 3,
      numero: 1245,
      fechaEmision: "2025-01-10",
      fechaVencimiento: "2025-02-10",
      moneda: "ARS",
      netoGravado: 28925.62,
      iva21: 6074.38,
      iva10_5: 0,
      otrosTributos: 0,
      total: 35000,
      estado: "PENDIENTE",
      cae: "71345678901234",
      fechaVtoCae: "2025-01-20",
      origen: "AFIP",
      importado: false,
      observaciones: "",
    },
    {
      id: "AFIP-2",
      cuitEmisor: "30798765432",
      razonSocial: "Insumos SA",
      tipo: "FA",
      letra: "A",
      puntoVenta: 1,
      numero: 889,
      fechaEmision: "2025-01-12",
      fechaVencimiento: "2025-01-30",
      moneda: "ARS",
      netoGravado: 9917.36,
      iva21: 2082.64,
      iva10_5: 0,
      otrosTributos: 0,
      total: 12000,
      estado: "IMPORTADO",
      cae: "71345678907890",
      fechaVtoCae: "2025-01-22",
      origen: "AFIP",
      importado: true,
      fechaImportacion: "2025-01-18",
      observaciones: "Importado automáticamente",
    },
    {
      id: "AFIP-3",
      cuitEmisor: "30655555559",
      razonSocial: "Envases SRL",
      tipo: "NC",
      letra: "A",
      puntoVenta: 2,
      numero: 122,
      fechaEmision: "2025-01-15",
      fechaVencimiento: null,
      moneda: "ARS",
      netoGravado: -3719.01,
      iva21: -780.99,
      iva10_5: 0,
      otrosTributos: 0,
      total: -4500,
      estado: "PENDIENTE",
      cae: "71345678909999",
      fechaVtoCae: "2025-01-25",
      origen: "AFIP",
      importado: false,
      comprobanteAsociado: {
        tipo: "FA",
        letra: "A",
        puntoVenta: 2,
        numero: 118,
      },
      observaciones: "Nota de crédito por devolución",
    },
  ]);

  // Simula comprobantes ya cargados en tu sistema
  const [comprobantesSistema, setComprobantesSistema] = useState([
    {
      cuitEmisor: "30712345678",
      tipo: "FA",
      puntoVenta: 3,
      numero: 1245,
    },
  ]);

  // Clave fiscal única
  const generarClave = (c) =>
    `${c.cuitEmisor}-${c.tipo}-${c.puntoVenta}-${c.numero}`;

  // Detecta comprobantes faltantes
  const faltantes = useMemo(() => {
    const clavesSistema = comprobantesSistema.map(generarClave);

    return comprobantesAFIP.filter(
      (c) => !clavesSistema.includes(generarClave(c)),
    );
  }, [comprobantesAFIP, comprobantesSistema]);

  // Detecta comprobantes ya cargados
  const cargados = useMemo(() => {
    const clavesSistema = comprobantesSistema.map(generarClave);

    return comprobantesAFIP.filter((c) =>
      clavesSistema.includes(generarClave(c)),
    );
  }, [comprobantesAFIP, comprobantesSistema]);

  // Simula importar comprobante al sistema
  const importarComprobante = (comprobante) => {
    setComprobantesSistema((prev) => [
      ...prev,
      {
        cuitEmisor: comprobante.cuitEmisor,
        tipo: comprobante.tipo,
        puntoVenta: comprobante.puntoVenta,
        numero: comprobante.numero,
      },
    ]);
  };

  return {
    comprobantesAFIP,
    comprobantesSistema,
    faltantes,
    cargados,
    importarComprobante,
  };
};
