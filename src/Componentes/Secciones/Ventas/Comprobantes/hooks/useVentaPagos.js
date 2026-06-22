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
    codigoBancoDestino: "",
    // Campos para Cheque
    tipoCheque: "TERCERO", // PROPIO or TERCERO
    tipoChequePropio: "CORRIENTE", // CORRIENTE or DIFERIDO
    bancoCheque: "",
    numeroCheque: "",
    vencimientoCheque: "", // This is fechaPago
    fechaEmisionCheque: new Date().toISOString().split("T")[0],
    cuentaCheque: "",
    cuitEmisorCheque: "",
    titularCheque: "",
    sucursalCheque: "",
    // Campos para Crédito / Débito
    cuotas: 1,
    recargo: 0,
    cupon: "",
    lote: "",
    autorizacion: "ACEPTADA",
  });

  const totalPagadoReal = useMemo(() => {
    return listaPagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  }, [listaPagos]);

  const vuelto = useMemo(() => {
    if (nuevoPago.tipo !== "EFECTIVO") {
      const pagoEfectivoRegistrado = listaPagos.find(
        (p) => p.tipo === "EFECTIVO" && p.pagaCon > p.monto
      );
      if (pagoEfectivoRegistrado) {
        return parseFloat(pagoEfectivoRegistrado.pagaCon) - parseFloat(pagoEfectivoRegistrado.monto);
      }
      return 0;
    }
    const restante = Math.max(0, totalVenta - totalPagadoReal);
    const montoNum = parseFloat(nuevoPago.monto) || 0;
    if (montoNum > restante) {
      return montoNum - restante;
    }
    const pagoEfectivoRegistrado = listaPagos.find(
      (p) => p.tipo === "EFECTIVO" && p.pagaCon > p.monto
    );
    if (pagoEfectivoRegistrado) {
      return parseFloat(pagoEfectivoRegistrado.pagaCon) - parseFloat(pagoEfectivoRegistrado.monto);
    }
    return 0;
  }, [nuevoPago.monto, nuevoPago.tipo, totalVenta, totalPagadoReal, listaPagos]);

  useEffect(() => {
    const restante = Math.max(0, totalVenta - totalPagadoReal);

    if (totalPagadoReal >= totalVenta - 0.01 && condicionVenta === "cuenta_corriente") {
      setCondicionVenta("contado");
    } else if (totalPagadoReal > 0 && totalPagadoReal < totalVenta - 0.01 && condicionVenta !== "cuenta_corriente") {
      setCondicionVenta("cuenta_corriente");
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
    
    let montoNum = parseFloat(nuevoPago.monto);
    if (isNaN(montoNum) || montoNum <= 0) return;
    
    let detallesFinales = nuevoPago.detalles;
    let pagaConVal = 0;
    
    // Si es cheque, armamos un detalle descriptivo
    if (nuevoPago.tipo === "CHEQUE") {
      if (nuevoPago.tipoCheque === "PROPIO") {
        detallesFinales = `CHEQUE PROPIO | TIPO: ${nuevoPago.tipoChequePropio} | BNCO: ${nuevoPago.bancoCheque || 'S/D'} | NRO: ${nuevoPago.numeroCheque || 'S/D'} | CTA: ${nuevoPago.cuentaCheque || 'S/D'}`;
      } else {
        detallesFinales = `CHEQUE TERCERO | BNCO: ${nuevoPago.bancoCheque || 'S/D'} | NRO: ${nuevoPago.numeroCheque || 'S/D'} | EMISOR: ${nuevoPago.cuitEmisorCheque || 'S/D'} | TITULAR: ${nuevoPago.titularCheque || 'S/D'}`;
      }
    }

    // Si es tarjeta o transferencia, registramos banco e info
    if (nuevoPago.tipo === "CREDITO" || nuevoPago.tipo === "DEBITO") {
      const recargoPct = parseFloat(nuevoPago.recargo) || 0;
      const cuotasVal = parseInt(nuevoPago.cuotas) || 1;
      const montoBase = parseFloat(nuevoPago.monto) || 0;
      const montoFinal = recargoPct > 0 ? montoBase * (1 + recargoPct / 100) : montoBase;
      const cuotaValor = montoFinal / cuotasVal;
      
      const recargoTexto = recargoPct > 0 ? ` (+${recargoPct}% Recargo)` : "";
      const formatP = (val) => '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
      detallesFinales = `${nuevoPago.tipo} | ${nuevoPago.entidadId || "TARJETA"} | LOTE: ${nuevoPago.lote || 'S/D'} | CUPÓN: ${nuevoPago.cupon || 'S/D'} | Total Tarjeta: ${formatP(montoFinal)} (${cuotasVal}x ${formatP(cuotaValor)}) | RECARGO:${(montoFinal - montoBase).toFixed(2)}`;
    }

    if (nuevoPago.tipo === "TRANSFERENCIA") {
      detallesFinales = `TRANSFERENCIA | ${nuevoPago.entidadId || "BANCO"}`;
    }

    if (nuevoPago.tipo === "EFECTIVO") {
      const restante = Math.max(0, totalVenta - totalPagadoReal);
      if (montoNum > restante) {
        const vueltoCalculado = montoNum - restante;
        detallesFinales = `EFECTIVO | RECIBIDO: ${montoNum.toFixed(2)} | VUELTO: ${vueltoCalculado.toFixed(2)}`;
        pagaConVal = montoNum;
        montoNum = restante;
      } else {
        detallesFinales = `EFECTIVO`;
        pagaConVal = montoNum;
      }
    }

    setListaPagos((prev) => [...prev, { 
      ...nuevoPago, 
      detalles: detallesFinales,
      monto: montoNum,
      pagaCon: pagaConVal || undefined,
      id: Date.now() 
    }]);
    
    setNuevoPago({
      tipo: "EFECTIVO",
      entidadId: "",
      monto: 0,
      pagaCon: 0,
      detalles: "",
      referencia: "",
      codigoBancoDestino: "",
      tipoCheque: "TERCERO",
      tipoChequePropio: "CORRIENTE",
      bancoCheque: "",
      numeroCheque: "",
      vencimientoCheque: "",
      fechaEmisionCheque: new Date().toISOString().split("T")[0],
      cuentaCheque: "",
      cuitEmisorCheque: "",
      titularCheque: "",
      sucursalCheque: "",
      cuotas: 1,
      recargo: 0,
      cupon: "",
      lote: "",
      autorizacion: "ACEPTADA",
    });
  }, [nuevoPago, totalVenta, totalPagadoReal, agregarAlerta]);

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
