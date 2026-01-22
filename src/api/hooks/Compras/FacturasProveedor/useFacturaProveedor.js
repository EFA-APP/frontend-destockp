import { useState } from "react";

export const useFacturasProveedor = () => {
  const [facturas, setFacturas] = useState([
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
      isBlanco: true,
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
      isBlanco: true,
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

  const [tipoFactura, setTipoFactura] = useState("TODAS");
  const [estadoFactura, setEstadoFactura] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isBlanco, setIsBlanco] = useState("TODAS");

  const facturasFiltradas = facturas.filter((f) => {
    const coincideBusqueda =
      f.numero.toString().includes(busqueda) ||
      f.proveedor.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = tipoFactura === "TODAS" || f.tipo === tipoFactura;
    const coincideEstado =
      estadoFactura === "TODAS" || f.estado === estadoFactura;

    const coincideBlanco =
      isBlanco === "TODAS" ||
      (isBlanco === "BLANCO" && f.isBlanco) ||
      (isBlanco === "NEGRO" && !f.isBlanco);

    const fechaFactura = new Date(f.fecha);
    const desdeValida = !fechaDesde || fechaFactura >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaFactura <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEstado &&
      coincideBlanco &&
      desdeValida &&
      hastaValida
    );
  });

  const manejarDetalle = (id) => {
    console.log(id);
  };

  const manejarEditar = (factura) => {
    console.log("Editando:", factura);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar?")) {
      setFacturas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    facturas: facturasFiltradas,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTipoFactura,
    estadoFactura,
    setEstadoFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  };
};
