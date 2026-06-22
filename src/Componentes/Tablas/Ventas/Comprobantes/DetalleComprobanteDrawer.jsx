import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Printer,
  Eye,
  FileText,
  User,
  CreditCard,
  Calendar,
  Tag,
  Receipt,
  CheckCircle2,
  Info,
  DollarSign,
  ArrowRightLeft,
  Clock,
  Banknote,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "./ComprobantePDF";
import { ComprobanteIcono } from "../../../../assets/Icons";

const DetalleComprobanteDrawer = ({ open, onClose, data, usuario }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [open]);

  const recargoTotal = useMemo(() => {
    let sum = 0;
    if (data && Array.isArray(data.pagos)) {
      data.pagos.forEach((p) => {
        if (p.detalles && p.detalles.includes("RECARGO:")) {
          const match = p.detalles.match(/RECARGO:([\d.]+)/);
          if (match && match[1]) {
            sum += parseFloat(match[1]);
          }
        }
      });
    }
    return sum;
  }, [data?.pagos]);

  const itemsTotal = useMemo(() => {
    if (!data || !Array.isArray(data.detalles)) return 0;
    return data.detalles.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  }, [data?.detalles]);

  if (!open && !isVisible) return null;

  // --- FUNCIONES DE UTILIDAD ---
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(monto) || 0);
  };

  const formatearFechaAfip = (fechaStr) => {
    if (!fechaStr || fechaStr.length !== 8) return fechaStr;
    const dia = fechaStr.substring(6, 8);
    const mes = fechaStr.substring(4, 6);
    const anio = fechaStr.substring(0, 4);
    return `${dia}/${mes}/${anio}`;
  };

  // --- MANEJADORES DE PDF ---
  const handleDescargarPDF = async () => {
    try {
      const blob = await pdf(<ComprobantePDF comprobante={data} usuario={usuario} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.cae || "COMP"}-${data.puntoVenta}-${data.numeroComprobante}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImprimirPDF = async () => {
    try {
      const blob = await pdf(<ComprobantePDF comprobante={data} usuario={usuario} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank")?.print();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerPDF = async () => {
    try {
      const blob = await pdf(<ComprobantePDF comprobante={data} usuario={usuario} />).toBlob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  const getDocConfig = (tipo) => {
    const t = Number(tipo);
    if ([3, 8, 13, 53, 203, 208, 213, 993].includes(t)) {
      return {
        label: "NC",
        color: "text-rose-600",
        bg: "bg-rose-50/50",
        border: "border-rose-100",
        iconBg: "bg-rose-500",
        icon: <ArrowRightLeft size={16} />,
        signo: "-",
      };
    }
    if ([2, 7, 12, 52, 202, 207, 212].includes(t)) {
      return {
        label: "ND",
        color: "text-amber-600",
        bg: "bg-amber-50/50",
        border: "border-amber-100",
        iconBg: "bg-amber-500",
        icon: <ArrowRightLeft size={16} />,
        signo: "+",
      };
    }
    if ([1, 6, 11, 51, 201, 206, 211].includes(t)) {
      return {
        label: "Factura",
        color: "text-blue-600",
        bg: "bg-blue-50/50",
        border: "border-blue-100",
        iconBg: "bg-blue-500",
        icon: <FileText size={16} />,
        signo: "",
      };
    }
    if ([0, 4, 9, 15, 48, 54, 55, 99, 100, 991, 992].includes(t)) {
      return {
        label: "Pago",
        color: "text-emerald-600",
        bg: "bg-emerald-50/50",
        border: "border-emerald-100",
        iconBg: "bg-emerald-500",
        icon: <Receipt size={16} />,
        signo: "-",
      };
    }
    return {
      label: "Doc",
      color: "text-slate-600",
      bg: "bg-slate-50/50",
      border: "border-slate-100",
      iconBg: "bg-slate-500",
      icon: <FileText size={16} />,
      signo: "",
    };
  };

  const getMetodoConfig = (metodo) => {
    const m = String(metodo || "").toUpperCase();
    if (m.includes("EFECTIVO")) {
      return {
        icon: <Banknote size={16} />,
        color: "bg-emerald-500",
        lightBg: "bg-emerald-50/30",
        border: "border-emerald-100/50",
        text: "text-emerald-700",
      };
    }
    if (m.includes("TRANSFERENCIA")) {
      return {
        icon: <ArrowRightLeft size={16} />,
        color: "bg-blue-500",
        lightBg: "bg-blue-50/30",
        border: "border-blue-100/50",
        text: "text-blue-700",
      };
    }
    if (m.includes("TARJETA") || m.includes("CREDITO") || m.includes("DEBITO")) {
      return {
        icon: <CreditCard size={16} />,
        color: "bg-indigo-500",
        lightBg: "bg-indigo-50/30",
        border: "border-indigo-100/50",
        text: "text-indigo-700",
      };
    }
    if (m.includes("CHEQUE")) {
      return {
        icon: <Landmark size={16} />,
        color: "bg-amber-500",
        lightBg: "bg-amber-50/30",
        border: "border-amber-100/50",
        text: "text-amber-700",
      };
    }
    return {
      icon: <CreditCard size={16} />,
      color: "bg-slate-500",
      lightBg: "bg-slate-50/30",
      border: "border-slate-100/50",
      text: "text-slate-700",
    };
  };

  const getDocumentTypeTitle = (tipo, letra) => {
    const t = Number(tipo);
    let base = "COMPROBANTE";
    if ([1, 6, 11, 51, 201, 206, 211, 991].includes(t)) base = "FACTURA";
    if ([2, 7, 12, 52, 202, 207, 212, 994].includes(t)) base = "NOTA DE DÉBITO";
    if ([3, 8, 13, 53, 203, 208, 213, 993].includes(t)) base = "NOTA DE CRÉDITO";
    if ([4, 9, 15, 54, 992].includes(t)) base = "RECIBO";

    const isInterno = [991, 992, 993, 994].includes(t);
    return `${base} ${letra || "C"}${isInterno ? " (INTERNO)" : ""}`;
  };

  const renderDetallesPago = (detalles) => {
    if (!detalles) return null;
    const parts = detalles.split(" | ").filter((p) => !p.startsWith("RECARGO:"));
    if (parts.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
        {parts.map((part, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded bg-gray-50 border border-gray-200/60 text-[9px] font-bold text-gray-500 uppercase tracking-tight"
          >
            {part}
          </span>
        ))}
      </div>
    );
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm" onClick={onClose} />
      
      <div
        className={`relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20 shadow-sm">
              <ComprobanteIcono size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                Detalle de Comprobante
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 px-2 py-0.5 rounded uppercase">
                  {getDocumentTypeTitle(data.tipoDocumento, data.letraComprobante)}
                </span>
                <span className="text-[11px] font-black text-rose-500 tracking-wider">
                  {String(data.puntoVenta).padStart(5, "0")}-{String(data.numeroComprobante).padStart(8, "0")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Acciones de PDF en la cabecera */}
            <div className="flex items-center gap-1 bg-white border border-gray-200/60 p-1 rounded-md shadow-xs">
              <button
                onClick={handleVerPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all shadow-xs"
              >
                <Eye size={13} />
                <span className="hidden sm:inline">Ver PDF</span>
              </button>
              <button
                onClick={handleDescargarPDF}
                className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                title="Descargar PDF"
              >
                <Download size={15} />
              </button>
              <button
                onClick={handleImprimirPDF}
                className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
                title="Imprimir"
              >
                <Printer size={15} />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-all group"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Body (scrollable two columns grid) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-55/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: CLIENTE Y DETALLE DE ITEMS (7 de 12) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Cliente */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                  <User size={13} className="text-[var(--primary)]" />
                  <span>Cliente</span>
                </div>
                <div className="p-4 rounded-md bg-white border border-gray-200/60 flex items-center gap-3.5 shadow-sm shadow-gray-100/30">
                  <div className="w-10 h-10 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-base font-black border border-[var(--primary)]/10 shadow-inner shrink-0">
                    {(data.receptor?.razonSocial || "C")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-gray-900 uppercase leading-snug truncate">
                      {data.receptor?.razonSocial || `${data.receptor?.nombre} ${data.receptor?.apellido}`}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                      {data.receptor?.DocTipo === 80 ? "CUIT" : "DNI"}:{" "}
                      <span className="font-extrabold text-gray-700">{data.receptor?.DocNro || "0"}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Detalles de Items */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                  <Tag size={13} className="text-[var(--primary)]" />
                  <span>Detalle de Items</span>
                </div>
                <div className="bg-white rounded-md border border-gray-200/60 overflow-hidden shadow-sm shadow-gray-100/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[9px] text-gray-550 font-black uppercase border-b border-gray-200/60 tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Descripción</th>
                        <th className="px-4 py-3 text-center shrink-0 w-16">Cant.</th>
                        <th className="px-5 py-3 text-right w-28">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.detalles?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3.5 min-w-0">
                            <p className="font-extrabold text-gray-800 uppercase mb-0.5 leading-snug">
                              {item.nombre}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                              P. Unit: ${formatearMonto(item.precioUnitario)}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 text-center font-black text-gray-500">
                            {item.cantidad}
                          </td>
                          <td className="px-5 py-3.5 text-right font-black text-gray-900 tabular-nums">
                            ${formatearMonto(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Comprobantes Vinculados / Ajustes */}
              {Array.isArray(data.ajustes) && data.ajustes.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                    <Receipt size={13} className="text-[var(--primary)]" />
                    <span>Ajustes Aplicados</span>
                  </div>
                  <div className="space-y-2.5">
                    {data.ajustes.map((ajuste, idx) => {
                      const config = getDocConfig(ajuste.tipo);
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-md ${config.bg} border ${config.border} flex items-center justify-between shadow-xs transition-all hover:scale-[1.01]`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md ${config.iconBg} text-white flex items-center justify-center shadow-xs shrink-0`}>
                              {config.icon}
                            </div>
                            <div>
                              <p className={`text-[8px] font-black ${config.color} opacity-75 uppercase leading-none mb-1`}>
                                {config.label} Aplicada
                              </p>
                              <p className="text-xs font-black text-gray-850 tracking-tight">
                                {String(ajuste.ptoVta || 0).padStart(5, "0")}-{String(ajuste.nro || 0).padStart(8, "0")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-black ${config.color} tabular-nums`}>
                              {config.signo} ${formatearMonto(ajuste.total)}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">
                              {formatearFecha(ajuste.fecha)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

            </div>

            {/* COLUMNA DERECHA: INFORMACIÓN GENERAL, PAGOS Y TOTALES (5 de 12) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Información General */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                  <Info size={13} className="text-[var(--primary)]" />
                  <span>Información General</span>
                </div>
                <div className="bg-white rounded-md border border-gray-200/60 p-4 space-y-3 shadow-sm shadow-gray-100/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">Estado</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        data.estado === "ANULADO"
                          ? "bg-rose-50 border-rose-100 text-rose-700"
                          : "bg-emerald-50 border-emerald-100 text-emerald-700"
                      }`}
                    >
                      {data.estado || "VÁLIDO"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                    <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">Fecha Emisión</span>
                    <span className="text-gray-800 font-extrabold">{formatearFecha(data.fechaEmision)}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                    <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">Condición Venta</span>
                    <span className="text-gray-800 font-extrabold uppercase">
                      {String(data.condicionVenta || "CONTADO").replace("_", " ")}
                    </span>
                  </div>

                  {data.cae && (
                    <>
                      <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                        <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">CAE N°</span>
                        <span className="text-gray-850 font-extrabold tracking-wide select-all">{data.cae}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                        <span className="text-gray-450 font-bold uppercase tracking-wider text-[9px]">Vencimiento CAE</span>
                        <span className="text-gray-850 font-extrabold">{formatearFechaAfip(data.vtoCae || data.vencimientoCae)}</span>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Pagos Registrados */}
              {Array.isArray(data.pagos) && data.pagos.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                    <DollarSign size={13} className="text-emerald-500" />
                    <span>Pagos Registrados</span>
                  </div>
                  <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {data.pagos.map((pago, idx) => {
                      const config = getMetodoConfig(pago.metodo);
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-md ${config.lightBg} border ${config.border} flex flex-col justify-between shadow-xs`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`w-8 h-8 rounded-md ${config.color} text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5`}>
                                {config.icon}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-[9px] font-black ${config.text} uppercase leading-none mb-1.5`}>
                                  Método: {pago.metodo}
                                </p>
                                <p className="text-xs font-black text-gray-800 leading-snug truncate">
                                  {pago.referencia || "Sin referencia"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-black ${config.text} tabular-nums`}>
                                ${formatearMonto(pago.monto)}
                              </p>
                              <p className={`text-[9px] font-bold ${config.text} opacity-60 uppercase mt-0.5`}>
                                Abonado
                              </p>
                            </div>
                          </div>
                          {renderDetallesPago(pago.detalles)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Desglose de Totales */}
              <section className="space-y-2.5">
                <div className="flex items-center gap-2 px-1 text-gray-450 font-black uppercase tracking-widest text-[9px]">
                  <ShieldCheck size={13} className="text-[var(--primary)]" />
                  <span>Resumen de Totales</span>
                </div>
                <div className="bg-white rounded-md border border-gray-200/60 p-4 shadow-sm shadow-gray-100/30 space-y-3">
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-bold uppercase tracking-wider text-[9px]">Subtotal de Ítems</span>
                    <span className="font-extrabold text-gray-800 tabular-nums">
                      ${formatearMonto(itemsTotal || data.total)}
                    </span>
                  </div>

                  {Number(data.iva) > 0 && (
                    <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-50 pt-2">
                      <span className="font-bold uppercase tracking-wider text-[9px]">IVA (21%)</span>
                      <span className="font-extrabold text-gray-800 tabular-nums">
                        ${formatearMonto(data.iva)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-700 border-t border-gray-50 pt-2 font-black">
                    <span className="font-black uppercase tracking-wider text-[9px]">Total Comprobante</span>
                    <span className="font-black text-gray-900 tabular-nums">
                      ${formatearMonto(data.total)}
                    </span>
                  </div>

                  {recargoTotal > 0 && (
                    <>
                      <div className="flex justify-between items-center text-xs text-amber-600 border-t border-gray-50 pt-2">
                        <span className="font-bold uppercase tracking-wider text-[9px]">Recargo Financiación</span>
                        <span className="font-black tabular-nums">
                          +${formatearMonto(recargoTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-indigo-600 border-t border-gray-50 pt-2 font-black">
                        <span className="font-black uppercase tracking-wider text-[9px]">Total Tarjeta (A Cobrar)</span>
                        <span className="font-black text-sm tabular-nums">
                          ${formatearMonto(data.total + recargoTotal)}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Final Total Hero Box */}
                  <div className="pt-3.5 border-t border-gray-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 font-bold uppercase tracking-wider text-[9px] block leading-none mb-1">
                        Monto Imputado
                      </span>
                      <span className="text-xl font-black text-emerald-600 tracking-tight tabular-nums">
                        ${formatearMonto(data.total)}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                </div>

                {/* Saldo Pendiente */}
                {data.condicionVenta === "cuenta_corriente" && (
                  <div className="p-4 rounded-md bg-rose-50/50 border border-rose-100/80 flex items-center justify-between shadow-xs animate-in fade-in duration-300">
                    <div>
                      <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider mb-0.5 leading-none">
                        Saldo Pendiente
                      </p>
                      <p className="text-lg font-black text-rose-700 tabular-nums">
                        ${formatearMonto(data.total - (data.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0))}
                      </p>
                    </div>
                    <Clock size={20} className="text-rose-500 shrink-0" />
                  </div>
                )}
              </section>

            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetalleComprobanteDrawer;
