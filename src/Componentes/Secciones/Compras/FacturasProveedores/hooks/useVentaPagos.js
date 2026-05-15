import { useState, useCallback, useMemo, useEffect } from "react";

export const useVentaPagos = (totalVenta, condicionVenta, setCondicionVenta, agregarAlerta) => {
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [listaPagos, setListaPagos] = useState([]);
  const [nuevoPago, setNuevoPago] = useState({
    tipo: "EFECTIVO", // Default a EFECTIVO
    entidadId: "",
    monto: 0,
    pagaCon: 0,
    detalles: "",
    referencia: "",
  });

  const totalPagadoReal = useMemo(() => {
    return listaPagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  }, [listaPagos]);

  const vuelto = useMemo(() => {
    // Usamos 'tipo' que es el campo real del estado
    if (nuevoPago.tipo?.toLowerCase() !== "efectivo" || !nuevoPago.pagaCon) return 0;
    const restante = totalVenta - totalPagadoReal;
    return Math.max(0, parseFloat(nuevoPago.pagaCon) - restante);
  }, [nuevoPago.pagaCon, nuevoPago.tipo, totalVenta, totalPagadoReal]);

  useEffect(() => {
    const restante = Math.max(0, totalVenta - totalPagadoReal);

    if (totalPagadoReal >= totalVenta - 0.01 && condicionVenta === "cuenta_corriente") {
      setCondicionVenta("contado");
    }

    setNuevoPago((prev) => ({
      ...prev,
      monto: Math.round(restante * 100) / 100,
    }));
  }, [totalVenta, totalPagadoReal, condicionVenta, setCondicionVenta]);

  const agregarPago = useCallback(() => {
    if (!nuevoPago.tipo) {
      if (agregarAlerta) {
        agregarAlerta({
          title: "Tipo de Pago Requerido",
          message: "Debe seleccionar la forma de pago (Efectivo, Débito, etc.)",
          type: "warning",
        });
      }
      return;
    }
    
    const montoNum = parseFloat(nuevoPago.monto);
    if (isNaN(montoNum) || montoNum <= 0) return;
    
    setListaPagos((prev) => [...prev, { 
      ...nuevoPago, 
      monto: montoNum, // Aseguramos que sea número
      id: Date.now() 
    }]);
    
    setNuevoPago({
      tipo: "EFECTIVO",
      entidadId: "",
      monto: 0,
      pagaCon: 0,
      detalles: "",
      referencia: "",
    });
  }, [nuevoPago, agregarAlerta]);

  const eliminarPago = useCallback((index) => {
    setListaPagos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const agregarPagoConVuelto = useCallback((recibido, montoAImputar, vueltoCalculado) => {
    if (recibido <= 0) return;

    const nuevosPagos = [
      {
        id: `recibido-${Date.now()}`,
        tipo: "EFECTIVO",
        monto: parseFloat(recibido),
        detalles: "DINERO RECIBIDO",
      },
    ];

    if (vueltoCalculado > 0) {
      nuevosPagos.push({
        id: `vuelto-${Date.now() + 1}`,
        tipo: "EFECTIVO",
        monto: -parseFloat(vueltoCalculado),
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
