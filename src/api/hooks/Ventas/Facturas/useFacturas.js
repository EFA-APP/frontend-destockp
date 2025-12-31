import { useState } from "react";

export const useFacturas = () => {
  const [facturas, setFacturas] = useState([
    {
      id: 1,
      prefijo: "0001",
      numero: "00000012",
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
      prefijo: "0001",
      numero: "00000013",
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
      prefijo: "0001",
      numero: "00000020",
      fecha: "2025-03-05",
      cliente: "Kiosco Don Pepe",
      tipo: "C",
      estado: "vencida",
      isBlanco: false,
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
  const [isBlanco, setIsBlanco] = useState("TODAS");

  const facturasFiltradas = facturas.filter((f) => {
    const coincideBusqueda =
      f.numero.includes(busqueda) ||
      f.cliente.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo = tipoFactura === "TODAS" || f.tipo === tipoFactura;
    const coincideEstado =
      estadoFactura === "TODAS" || f.estado === estadoFactura;
    const coincideBlanco =
      isBlanco === "TODAS" ||
      (isBlanco === "BLANCO" && f.isBlanco === true) ||
      (isBlanco === "NEGRO" && f.isBlanco === false);

    const fechaFactura = new Date(f.fecha);
    const desdeValida = !fechaDesde || fechaFactura >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaFactura <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideBlanco &&
      coincideEstado &&
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
