import { useState } from "react";

export const useOrdenesVenta = () => {
  const [ordenes, setOrdenes] = useState([
    {
      id: 1,
      numeroOrden: "OV-00012",
      fecha: "2025-03-02",
      cliente: "Distribuidora San Martín",
      estado: "confirmada",
      total: 94500,
      facturada: false,
      items: [
        {
          producto: "Mermelada de Frutilla 250g",
          cantidad: 110,
          precioUnitario: 860,
          subtotal: 94600,
        },
      ],
    },
    {
      id: 2,
      numeroOrden: "OV-00013",
      fecha: "2025-03-06",
      cliente: "Kiosco Don Pepe",
      estado: "pendiente",
      total: 27600,
      facturada: false,
      items: [],
    },
    {
      id: 3,
      numeroOrden: "OV-00014",
      fecha: "2025-03-10",
      cliente: "Kiosco Don Pepe",
      estado: "facturada",
      total: 27600,
      facturada: true,
      items: [],
    },
  ]);

  const [estadoOrden, setEstadoOrden] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const ordenesFiltradas = ordenes.filter((o) => {
    const coincideBusqueda =
      o.numeroOrden.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.cliente.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado = estadoOrden === "TODAS" || o.estado === estadoOrden;

    const fechaOrden = new Date(o.fecha);
    const desdeValida = !fechaDesde || fechaOrden >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaOrden <= new Date(fechaHasta);

    return coincideBusqueda && coincideEstado && desdeValida && hastaValida;
  });

  const manejarDetalle = (id) => {
    console.log(id);
  };

  const manejarEditar = (order) => {
    console.log("Editando:", order);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar?")) {
      setFacturas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    ordenes: ordenesFiltradas,
    busqueda,
    setBusqueda,
    estadoOrden,
    setEstadoOrden,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  };
};
