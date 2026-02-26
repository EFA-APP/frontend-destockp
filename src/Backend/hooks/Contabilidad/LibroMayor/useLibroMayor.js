import { useEffect, useMemo, useState } from "react";

export const useLibroMayor = () => {
  const [asientos, setAsientos] = useState([]);
  const [fechaDesde, setFechaDesde] = useState("2025-01-01");
  const [fechaHasta, setFechaHasta] = useState("2025-01-31");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setAsientos([
      {
        id: 1,
        fecha: "2025-01-10",
        descripcion: "Factura B 00001-00000123",
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
        movimientos: [
          {
            cuenta: "5.1.01.001",
            nombreCuenta: "Compras",
            debe: 200,
            haber: 0,
          },
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
    ]);
  }, []);

  // ─────────────────────────────────────
  // Asientos filtrados por fecha
  // ─────────────────────────────────────
const asientosFiltrados = useMemo(() => {
  const busq = busqueda.toLowerCase();

  return asientos.filter((a) => {
    // 🔍 Coincidencia por texto
    const coincideBusqueda =
      !busq ||
      a.descripcion.toLowerCase().includes(busq) ||
      a.movimientos.some(
        (m) =>
          m.nombreCuenta.toLowerCase().includes(busq) ||
          m.cuenta.toLowerCase().includes(busq)
      );

    // 📅 Filtro por fecha
    const fechaFactura = new Date(a.fecha);
    const desdeValida = !fechaDesde || fechaFactura >= new Date(fechaDesde);
    const hastaValida = !fechaHasta || fechaFactura <= new Date(fechaHasta);

    return coincideBusqueda && desdeValida && hastaValida;
  });
}, [asientos, fechaDesde, fechaHasta, busqueda]);


  // ─────────────────────────────────────
  // Agrupar por cuenta (LIBRO MAYOR)
  // ─────────────────────────────────────
  const cuentas = useMemo(() => {
    const mapa = {};

    asientosFiltrados.forEach((asiento) => {
      asiento.movimientos.forEach((mov) => {
        if (!mapa[mov.cuenta]) {
          mapa[mov.cuenta] = {
            cuenta: mov.cuenta,
            nombreCuenta: mov.nombreCuenta,
            movimientos: [],
            totalDebe: 0,
            totalHaber: 0,
          };
        }

        mapa[mov.cuenta].movimientos.push({
          fecha: asiento.fecha,
          descripcion: asiento.descripcion,
          debe: mov.debe,
          haber: mov.haber,
        });

        mapa[mov.cuenta].totalDebe += mov.debe;
        mapa[mov.cuenta].totalHaber += mov.haber;
      });
    });

    return Object.values(mapa).map((c) => ({
      ...c,
      saldo: c.totalDebe - c.totalHaber,
    }));
  }, [asientosFiltrados]);

  return {
    cuentas,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    busqueda,
    setBusqueda,
  };
};
