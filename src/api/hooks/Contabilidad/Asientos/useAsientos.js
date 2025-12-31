import { useState } from "react";

export const useAsientos = () => {
  const [asientos, setAsientos] = useState([
    {
      id: 1,
      fecha: "2025-01-10",
      descripcion: "Factura B 00001-00000123",
      origen: "VENTA",
      referencia: "FAC-123",
      totalDebe: 121,
      totalHaber: 121,
      movimientos: [
        {
          id: 1,
          cuenta: "1.1.01.001",
          nombreCuenta: "Caja",
          debe: 121,
          haber: 0,
        },
        {
          id: 2,
          cuenta: "4.1.01.001",
          nombreCuenta: "Ventas",
          debe: 0,
          haber: 100,
        },
        {
          id: 3,
          cuenta: "2.1.05.001",
          nombreCuenta: "IVA Débito Fiscal",
          debe: 0,
          haber: 21,
        },
      ],
    },
    {
      id: 2,
      fecha: "2025-01-15",
      descripcion: "Factura A 00002-00000456",
      origen: "COMPRA",
      referencia: "COM-456",
      totalDebe: 242,
      totalHaber: 242,
      movimientos: [
        {
          id: 4,
          cuenta: "5.1.01.001",
          nombreCuenta: "Compras",
          debe: 200,
          haber: 0,
        },
        {
          id: 5,
          cuenta: "1.1.04.001",
          nombreCuenta: "IVA Crédito Fiscal",
          debe: 42,
          haber: 0,
        },
        {
          id: 6,
          cuenta: "2.1.01.001",
          nombreCuenta: "Proveedores",
          debe: 0,
          haber: 242,
        },
      ],
    },
    {
      id: 3,
      fecha: "2025-01-20",
      descripcion: "Ajuste por diferencia de cambio",
      origen: "MANUAL",
      referencia: "AJ-001",
      totalDebe: 50,
      totalHaber: 50,
      movimientos: [
        {
          id: 7,
          cuenta: "6.2.01.001",
          nombreCuenta: "Diferencia de cambio",
          debe: 50,
          haber: 0,
        },
        {
          id: 8,
          cuenta: "1.1.02.001",
          nombreCuenta: "Banco",
          debe: 0,
          haber: 50,
        },
      ],
    },
  ]);

  const [busqueda, setBusqueda] = useState("");
  const [origen, setOrigen] = useState("TODOS");

  const asientosFiltrados = asientos.filter((a) => {
    const coincideBusqueda =
      a.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.referencia?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideOrigen = origen === "TODOS" || a.origen === origen;

    return coincideBusqueda && coincideOrigen;
  });

  const verDetalle = (asiento) => {
    console.log("Ver asiento:", asiento);
    // Aquí podrías abrir un modal o navegar a una página de detalle
  };

  const agregarAsiento = (nuevoAsiento) => {
    const asientoConId = {
      ...nuevoAsiento,
      id: Math.max(...asientos.map((a) => a.id)) + 1,
    };
    setAsientos([...asientos, asientoConId]);
  };

  const editarAsiento = (id, asientoActualizado) => {
    setAsientos(
      asientos.map((a) => (a.id === id ? { ...a, ...asientoActualizado } : a))
    );
  };

  const eliminarAsiento = (id) => {
    setAsientos(asientos.filter((a) => a.id !== id));
  };

  return {
    asientos: asientosFiltrados,
    busqueda,
    setBusqueda,
    origen,
    setOrigen,
    verDetalle,
    agregarAsiento,
    editarAsiento,
    eliminarAsiento,
  };
};
