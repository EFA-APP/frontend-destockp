import { useState, useCallback, useMemo, useEffect } from "react";

export const useVentaPagos = (totalVenta, condicionVenta, setCondicionVenta) => {
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [listaPagos, setListaPagos] = useState([]);
  const [nuevoPago, setNuevoPago] = useState({
    metodo: "efectivo",
    monto: 0,
    pagaCon: 0,
    detalles: "",
    referencia: "",
  });

  const vuelto = useMemo(() => {
    if (nuevoPago.metodo !== "efectivo" || !nuevoPago.pagaCon) return 0;
    const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0);
    const restante = totalVenta - totalPagado;
    return Math.max(0, nuevoPago.pagaCon - restante);
  }, [nuevoPago.pagaCon, nuevoPago.metodo, totalVenta, listaPagos]);

  useEffect(() => {
    const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0);
    const restante = Math.max(0, totalVenta - totalPagado);

    if (totalPagado >= totalVenta - 0.01 && condicionVenta === "cuenta_corriente") {
      setCondicionVenta("contado");
    }

    setNuevoPago((prev) => ({
      ...prev,
      monto: Math.round(restante * 100) / 100,
    }));
  }, [totalVenta, listaPagos, condicionVenta, setCondicionVenta]);

  const agregarPago = useCallback(() => {
    if (nuevoPago.monto <= 0) return;
    setListaPagos((prev) => [...prev, { ...nuevoPago, id: Date.now() }]);
    setNuevoPago({
      metodo: "efectivo",
      monto: 0,
      pagaCon: 0,
      detalles: "",
      referencia: "",
    });
  }, [nuevoPago]);

  const eliminarPago = useCallback((index) => {
    setListaPagos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const agregarPagoConVuelto = useCallback((recibido, montoAImputar, vueltoCalculado) => {
    if (recibido <= 0) return;

    const nuevosPagos = [
      {
        id: `recibido-${Date.now()}`,
        metodo: "efectivo",
        monto: recibido,
        detalles: "DINERO RECIBIDO",
      },
    ];

    if (vueltoCalculado > 0) {
      nuevosPagos.push({
        id: `vuelto-${Date.now() + 1}`,
        metodo: "efectivo",
        monto: -vueltoCalculado,
        detalles: "VUELTO ENTREGADO",
      });
    }

    setListaPagos((prev) => [...prev, ...nuevosPagos]);
    setNuevoPago((prev) => ({ ...prev, monto: 0, pagaCon: 0 }));
  }, []);

  return {
    metodoPago, setMetodoPago,
    listaPagos, setListaPagos,
    nuevoPago, setNuevoPago,
    vuelto,
    agregarPago,
    eliminarPago,
    agregarPagoConVuelto,
  };
};
