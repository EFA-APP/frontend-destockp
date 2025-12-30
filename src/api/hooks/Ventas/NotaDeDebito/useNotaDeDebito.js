import { useState } from "react";

export const useNotasDebito = () => {
  const [notasDebito] = useState([
    {
      id: 1,
      prefijo: "001",
      numero: "00001",
      fecha: "2025-03-20",
      tipo: "C",
      tipoFactura: "FC",
      numeroFacturaOrigen: "00045",
      cliente: "Distribuidora San Martín",
      motivo: "Intereses por mora",
      estado: "emitida",
      isBlanco: true,
      total: 12500,
      items: [
        {
          producto: "Interés por mora",
          cantidad: 1,
          precioUnitario: 12500,
          subtotal: 12500,
        },
      ],
    },
    {
      id: 2,
      prefijo: "001",
      numero: "00002",
      fecha: "2025-03-22",
      tipo: "A",
      tipoFactura: "FA",
      numeroFacturaOrigen: "00048",
      cliente: "Kiosco Don Pepe",
      motivo: "Ajuste de precio",
      estado: "emitida",
      isBlanco: false,
      total: 27600,
      items: [],
    },
  ]);

  const [tipoNotaDebito, setTipoNotaDebito] = useState("TODAS");
  const [estadoNota, setEstadoNota] = useState("TODAS");
  const [isBlanco, setIsBlanco] = useState("TODAS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const notasFiltradas = notasDebito.filter((n) => {
    const coincideBusqueda =
      n.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.prefijo.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      n.numeroFacturaOrigen.toLowerCase().includes(busqueda.toLowerCase());

    const coincideTipo =
      tipoNotaDebito === "TODAS" || n.tipo === tipoNotaDebito;

    const coincideEstado = estadoNota === "TODAS" || n.estado === estadoNota;

    const coincideBlanco =
      isBlanco === "TODAS" ||
      (isBlanco === "BLANCO" && n.isBlanco) ||
      (isBlanco === "NEGRO" && !n.isBlanco);

    const fechaNota = new Date(n.fecha);
    const desdeValida = !fechaDesde || fechaNota >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaNota <= new Date(fechaHasta);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideEstado &&
      coincideBlanco &&
      desdeValida &&
      hastaValida
    );
  });

  return {
    notasDebito: notasFiltradas,
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
    tipoNotaDebito,
    setTipoNotaDebito,
  };
};
