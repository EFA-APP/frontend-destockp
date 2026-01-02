import { useMemo, useState } from "react";

export const useLibroMayor = () => {
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

  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [fechaDesde, setFechaDesde] = useState("2025-01-01");
  const [fechaHasta, setFechaHasta] = useState("2025-01-31");

  // 1️⃣ Pasamos todo a movimientos planos
  const movimientos = useMemo(() => {
    const movs = [];
    asientos.forEach((asiento) => {
      asiento.movimientos.forEach((mov) => {
        movs.push({
          fecha: asiento.fecha,
          descripcion: asiento.descripcion,
          cuenta: mov.cuenta,
          nombreCuenta: mov.nombreCuenta,
          debe: mov.debe,
          haber: mov.haber,
        });
      });
    });
    return movs;
  }, [asientos]);

  // 2️⃣ Filtrar por fecha y cuenta
  const movimientosFiltrados = useMemo(() => {
    console.log(cuentaSeleccionada);
    return movimientos.filter((m) => {
      const dentroFecha = m.fecha >= fechaDesde && m.fecha <= fechaHasta;
      const coincideCuenta =
        !cuentaSeleccionada || m.cuenta === cuentaSeleccionada;
      return dentroFecha && coincideCuenta;
    });
  }, [movimientos, fechaDesde, fechaHasta, cuentaSeleccionada]);

  // 3️⃣ Calcular saldo acumulado
  const mayor = useMemo(() => {
    let saldo = 0;
    return movimientosFiltrados.map((m) => {
      saldo += m.debe - m.haber;
      return {
        ...m,
        saldo,
      };
    });
  }, [movimientosFiltrados]);

  // 4️⃣ Totales
  const totales = useMemo(() => {
    return mayor.reduce(
      (acc, m) => {
        acc.debe += m.debe;
        acc.haber += m.haber;
        acc.saldo = m.saldo;
        return acc;
      },
      { debe: 0, haber: 0, saldo: 0 }
    );
  }, [mayor]);

  return {
    mayor,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    cuentaSeleccionada,
    setCuentaSeleccionada,
    totales,
  };
};
