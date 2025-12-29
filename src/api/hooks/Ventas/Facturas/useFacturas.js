import { useState } from "react";

export const useFacturas = () => {
  const [facturas, setFacturas] = useState([
    {
      id: 1,
      numero: "0001-00000012",
      fecha: "2025-03-01",
      cliente: "Distribuidora San Martín",
      tipo: "B",
      isBlanco: true,
      estado: "pagada",
      total: 61200,
      items: [
        {
          producto: "Mermelada de Frutilla 250g",
          cantidad: 72,
          precioUnitario: 850,
          subtotal: 61200,
        },
      ],
    },
    {
      id: 2,
      numero: "0001-00000013",
      fecha: "2025-03-05",
      cliente: "Kiosco Don Pepe",
      tipo: "C",
      isBlanco: true,
      estado: "pendiente",
      total: 27600,
      items: [
        {
          producto: "Mermelada de Frambuesa 250g",
          cantidad: 30,
          precioUnitario: 920,
          subtotal: 27600,
        },
      ],
    },
    {
      id: 3,
      numero: "0001-00000020",
      fecha: "2025-03-05",
      cliente: "Kiosco Don Pepe",
      tipo: "C",
      estado: "vencida",
      isBlanco: true,
      total: 27600,
      items: [
        {
          producto: "Mermelada de Frambuesa 250g",
          cantidad: 30,
          precioUnitario: 920,
          subtotal: 27600,
        },
      ],
    },
  ]);
  const [tipoFactura, setTipoFactura] = useState("TODAS");
  const [estadoFactura, setEstadoFactura] = useState("TODAS");

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [busqueda, setBusqueda] = useState("");

  const facturasFiltradas = facturas.filter((f) => {
    const coincideBusqueda =
      f.numero.includes(busqueda) ||
      f.cliente.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = tipoFactura === "TODAS" || f.tipo === tipoFactura;
    const coincideEstado =
      estadoFactura === "TODAS" || f.estado === estadoFactura;

    const fechaFactura = new Date(f.fecha);
    const desdeValida = !fechaDesde || fechaFactura >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaFactura <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEstado &&
      desdeValida &&
      hastaValida
    );
  });

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
  };
};
