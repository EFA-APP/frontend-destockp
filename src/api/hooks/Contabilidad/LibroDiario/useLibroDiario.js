// useLibroDiario.js
import { useState, useMemo } from "react";

export const useLibroDiario = () => {
  const [asientos] = useState([
    {
      id: 1,
      fecha: "2025-01-10",
      descripcion: "Factura B 00001-00000123",
      origen: "VENTA",
      referencia: "FAC-123",
      movimientos: [
        { cuenta: "1.1.01.001", nombreCuenta: "Caja", debe: 121, haber: 0 },
        { cuenta: "4.1.01.001", nombreCuenta: "Ventas", debe: 0, haber: 100 },
        {
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
      movimientos: [
        { cuenta: "5.1.01.001", nombreCuenta: "Compras", debe: 200, haber: 0 },
        {
          cuenta: "1.1.04.001",
          nombreCuenta: "IVA Crédito Fiscal",
          debe: 42,
          haber: 0,
        },
        {
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
      movimientos: [
        {
          cuenta: "6.2.01.001",
          nombreCuenta: "Diferencia de cambio",
          debe: 50,
          haber: 0,
        },
        { cuenta: "1.1.02.001", nombreCuenta: "Banco", debe: 0, haber: 50 },
      ],
    },
    {
      id: 4,
      fecha: "2025-01-22",
      descripcion: "Pago de alquiler mensual",
      origen: "MANUAL",
      referencia: "PAG-001",
      movimientos: [
        {
          cuenta: "5.2.01.001",
          nombreCuenta: "Alquileres",
          debe: 80,
          haber: 0,
        },
        { cuenta: "1.1.02.001", nombreCuenta: "Banco", debe: 0, haber: 80 },
      ],
    },
  ]);

  const [fechaDesde, setFechaDesde] = useState("2025-01-01");
  const [fechaHasta, setFechaHasta] = useState("2025-01-31");
  const [origen, setOrigen] = useState("TODOS");

  // Filtrar asientos
  const asientosFiltrados = useMemo(() => {
    return asientos.filter((a) => {
      const dentroRango = a.fecha >= fechaDesde && a.fecha <= fechaHasta;
      const coincideOrigen = origen === "TODOS" || a.origen === origen;
      return dentroRango && coincideOrigen;
    });
  }, [asientos, fechaDesde, fechaHasta, origen]);

  // Convertir asientos a movimientos planos para la tabla
  const movimientos = useMemo(() => {
    const movs = [];
    asientosFiltrados.forEach((asiento) => {
      asiento.movimientos.forEach((mov) => {
        movs.push({
          id: `${asiento.id}-${mov.cuenta}`,
          fecha: asiento.fecha,
          asientoId: asiento.id,
          descripcion: asiento.descripcion,
          origen: asiento.origen,
          referencia: asiento.referencia,
          cuenta: mov.cuenta,
          nombreCuenta: mov.nombreCuenta,
          debe: mov.debe,
          haber: mov.haber,
        });
      });
    });
    return movs;
  }, [asientosFiltrados]);

  // Calcular totales
  const totales = useMemo(() => {
    return movimientos.reduce(
      (acc, mov) => {
        acc.debe += mov.debe;
        acc.haber += mov.haber;
        return acc;
      },
      { debe: 0, haber: 0 }
    );
  }, [movimientos]);

  const manejarDetalle = (id) => {
    console.log("Exportando a Excel...", id);
    // Aquí implementarías la lógica de exportación
  };

  return {
    movimientos,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
    manejarDetalle,
  };
};
