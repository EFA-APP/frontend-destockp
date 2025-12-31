import { useState } from "react";

export const useNotasCredito = () => {
  const [notasCredito, setNotasCredito] = useState([
    {
      id: 1,
      prefijo: "001",
      numero: "00001",
      fecha: "2025-03-15",
      tipo: "C",
      tipoFactura: "FC",
      numeroFacturaOrigen: "00045",
      cliente: "Distribuidora San Martín",
      motivo: "Devolución de mercadería",
      estado: "emitida",
      isBlanco: true,
      total: -94600,
      items: [
        {
          producto: "Mermelada de Frutilla 250g",
          cantidad: 110,
          precioUnitario: 860,
          subtotal: -94600,
        },
      ],
    },
    {
      id: 2,
      prefijo: "001",
      numero: "00002",
      tipo: "A",
      fecha: "2025-03-18",
      tipoFactura: "FA",
      numeroFacturaOrigen: "00048",
      cliente: "Kiosco Don Pepe",
      motivo: "Error en facturación",
      estado: "emitida",
      isBlanco: false,
      total: -27600,
      items: [],
    },
  ]);

  const [tipoNotaCredito, setTipoNotaCredito] = useState("TODAS");
  const [estadoNota, setEstadoNota] = useState("TODAS");
  const [isBlanco, setIsBlanco] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const notasFiltradas = notasCredito.filter((n) => {
    const coincideBusqueda =
      n.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.numeroFacturaOrigen.toLowerCase().includes(busqueda.toLowerCase());
    n.prefijo.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo =
      tipoNotaCredito === "TODAS" || n.tipo === tipoNotaCredito;
    const coincideEstado = estadoNota === "TODAS" || n.estado === estadoNota;
    const coincideBlanco =
      isBlanco === "TODAS" ||
      (isBlanco === "BLANCO" && n.isBlanco === true) ||
      (isBlanco === "NEGRO" && n.isBlanco === false);

    const fechaNota = new Date(n.fecha);
    const desdeValida = !fechaDesde || fechaNota >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaNota <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEstado &&
      desdeValida &&
      hastaValida &&
      coincideBlanco
    );
  });

  const manejarDetalle = (id) => {
    console.log(id);
  };

  const manejarEditar = (nota) => {
    console.log("Editando:", nota);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Eliminar?")) {
      setFacturas((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    notasCredito: notasFiltradas,
    busqueda,
    setBusqueda,
    estadoNota,
    setEstadoNota,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
    tipoNotaCredito,
    setTipoNotaCredito,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  };
};
