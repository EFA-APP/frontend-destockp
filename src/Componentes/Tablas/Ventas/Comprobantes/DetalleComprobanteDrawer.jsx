import React, { useEffect, useState } from "react";
import {
  X,
  Download,
  Printer,
  Eye,
  FileText,
  User,
  CreditCard,
  Calendar,
  QrCode,
  Tag,
  Receipt,
  CheckCircle2,
  Info,
  DollarSign,
  ArrowRightLeft
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

  if (!open && !isVisible) return null;

  const handleDescargarPDF = async () => {
    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={data} usuario={usuario} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${data.cae || 'SIN_CAE'}-${String(data.puntoVenta || 1).padStart(5, '0')}-${String(data.numeroComprobante || 0).padStart(8, '0')}.pdf`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al descargar PDF:", e);
    }
  };

  const handleImprimirPDF = async () => {
    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={data} usuario={usuario} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (e) {
      console.error("Error al imprimir PDF:", e);
    }
  };

  const handleVerPDF = async () => {
    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={data} usuario={usuario} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (e) {
      console.error("Error al ver PDF:", e);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const mapaIvaDescripcion = {
    1: "RESPONSABLE INSCRIPTO",
    4: "MONOTRIBUTO",
    5: "CONSUMIDOR FINAL",
    6: "EXENTO",
  };

  const formatearMonto = (monto) => {
    return Number(monto || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatearFechaAfip = (fechaStr) => {
    if (!fechaStr || fechaStr.length !== 8) return fechaStr;
    const anio = fechaStr.substring(0, 4);
    const mes = fechaStr.substring(4, 6);
    const dia = fechaStr.substring(6, 8);
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className={`h-screen fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className={`relative w-full max-w-[550px] bg-[#0c0c0c] border-l border-white/10 shadow-2xl transition-transform duration-300 transform flex flex-col h-full ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#111]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 text-[var(--primary)]">
              <ComprobanteIcono size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">
                {[3, 8, 13, 53].includes(Number(data.tipoDocumento)) ? "Nota de Crédito" : 
                 [2, 7, 12, 52].includes(Number(data.tipoDocumento)) ? "Nota de Débito" : 
                 "Factura"}
              </h2>
              <p className="text-[10px] font-bold text-white/70 tracking-tighter uppercase">
                {data.letraComprobante} {String(data.puntoVenta).padStart(5, '0')}-{String(data.numeroComprobante).padStart(8, '0')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <button
              onClick={handleVerPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
            >
              <Eye size={14} /> Visualizar
            </button>
            <button
              onClick={handleDescargarPDF}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--primary)] hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[var(--primary)]/20"
            >
              <Download size={14} /> Descargar
            </button>
            <button
              onClick={handleImprimirPDF}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all border border-white/5"
            >
              <Printer size={16} />
            </button>
          </div>

          {/* Status & General Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${
              data.estado === 'ANULADO' ? 'bg-red-500/5 border-red-500/10' : 
              data.estado === 'AJUSTADO_PARCIAL' ? 'bg-amber-500/5 border-amber-500/10' : 
              'bg-emerald-500/5 border-emerald-500/10'}`}>
              <div className={`flex items-center gap-2 mb-2 ${
                data.estado === 'ANULADO' ? 'text-red-500' :
                data.estado === 'AJUSTADO_PARCIAL' ? 'text-amber-500' :
                'text-emerald-500'}`}>
                <CheckCircle2 size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Estado</span>
              </div>
              <p className={`text-xs font-black uppercase tracking-tight ${
                data.estado === 'ANULADO' ? 'text-red-400' :
                data.estado === 'AJUSTADO_PARCIAL' ? 'text-amber-400' :
                'text-emerald-400'}`}>
                {data.estado || 'VALIDO'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-white/70">
                <Calendar size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Emisión</span>
              </div>
              <p className="text-xs font-black text-white/80 uppercase tracking-tight">{formatearFecha(data.fechaEmision)}</p>
            </div>
          </div>

          {/* AJUSTES APLICADOS A ESTE COMPROBANTE (Quien me ajusta a mí) */}
          {data.ajustes && Array.isArray(data.ajustes) && data.ajustes.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-2 text-rose-400/80">
                <ArrowRightLeft size={14} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Ajustes Aplicados (NC/ND)</h3>
                <div className="flex-1 h-px bg-white/5 ml-2" />
              </div>
              <div className="space-y-2">
                {data.ajustes.map((ajuste, idx) => {
                  const esNC = [3, 8, 13, 53].includes(Number(ajuste.tipo));
                  return (
                    <div key={idx} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${esNC ? 'bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10' : 'bg-blue-500/5 border-blue-500/10 hover:bg-blue-500/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${esNC ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                          <Receipt size={14} />
                        </div>
                        <div>
                          <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${esNC ? 'text-rose-400/60' : 'text-blue-400/60'}`}>
                            {esNC ? 'Nota de Crédito' : 'Nota de Débito'}
                          </p>
                          <p className="text-xs font-black text-white uppercase tracking-tight">
                            {String(ajuste.ptoVta).padStart(4, '0')}-{String(ajuste.nro).padStart(8, '0')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-black italic ${esNC ? 'text-rose-400' : 'text-blue-400'}`}>
                          {esNC ? '-' : '+'}${formatearMonto(ajuste.total)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* COMPROBANTES VINCULADOS (A quién ajusto yo) */}
          {data.cbtesAsoc && Array.isArray(data.cbtesAsoc) && data.cbtesAsoc.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-2 text-amber-400/80">
                <ArrowRightLeft size={14} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Comprobantes Vinculados</h3>
                <div className="flex-1 h-px bg-white/5 ml-2" />
              </div>
              <div className="space-y-2">
                {data.cbtesAsoc.map((cbte, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                        <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-amber-400/60 uppercase tracking-widest leading-none mb-1">Documento Original</p>
                        <p className="text-xs font-black text-white uppercase tracking-tight">
                           Cbt. Tipo: {cbte.tipo} | {String(cbte.ptoVta).padStart(4, '0')}-{String(cbte.nro).padStart(8, '0')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Client Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--primary-light)]">
              <User size={14} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Información del Cliente</h3>
              <div className="flex-1 h-px bg-white/5 ml-2" />
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5">
              <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tight">
                {data.receptor?.razonSocial || "CONSUMIDOR FINAL"}
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 font-mono">Documento</label>
                  <p className="text-[11px] font-bold text-white/70">
                    {data.receptor?.DocTipo === 80 ? 'CUIT' : 'DNI'}: {data.receptor?.DocNro || "0"}
                  </p>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 font-mono">Condición IVA</label>
                  <p className="text-[11px] font-bold text-white/70 uppercase">
                    {mapaIvaDescripcion[data.receptor?.CondicionIVAReceptorId] || data.receptor?.condicionIva || "CONSUMIDOR FINAL"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 font-mono">Domicilio</label>
                  <p className="text-[11px] font-bold text-white/70">
                    {data.receptor?.domicilio || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* OBSERVACIONES */}
          {data.observaciones && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--primary-light)]">
                <Info size={14} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Observaciones / Notas</h3>
                <div className="flex-1 h-px bg-white/5 ml-2" />
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-xs font-medium text-white/60 leading-relaxed italic">
                  "{data.observaciones}"
                </p>
              </div>
            </section>
          )}

          {/* Fiscal Details (only if CAE exists) */}
          {data.cae && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--primary-light)]">
                <QrCode size={14} />
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Datos de Autorización AFIP</h3>
                <div className="flex-1 h-px bg-white/5 ml-2" />
              </div>
              <div className="p-5 rounded-2xl bg-[#151515] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <QrCode size={100} />
                </div>
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">CAE Numero</label>
                      <p className="text-sm font-black text-[var(--primary)] font-mono tracking-widest leading-none">{data.cae}</p>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Vencimiento CAE</label>
                      <p className="text-[11px] font-bold text-white/70 uppercase tracking-wider">{formatearFechaAfip(data.vtoCae)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end items-center">
                    {data.qrCodeImage && (
                      <div className="p-2 bg-white rounded-lg shadow-2xl">
                        <img src={data.qrCodeImage} alt="QR" className="w-20 h-20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Details Table */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--primary-light)]">
              <Tag size={14} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Detalle de Productos</h3>
              <div className="flex-1 h-px bg-white/5 ml-2" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-white/5 text-white/40 uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-center">Cant.</th>
                    <th className="px-4 py-3 text-right">Unit.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-white/[0.01]">
                  {data.detalles?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 font-bold text-white/80">{item.nombre}</td>
                      <td className="px-4 py-4 text-center text-white/60">{item.cantidad}</td>
                      <td className="px-4 py-4 text-right text-white/60">${formatearMonto(item.precioUnitario)}</td>
                      <td className="px-4 py-4 text-right font-black text-white">${formatearMonto(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Breakdown of Payments */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--primary-light)]">
              <CreditCard size={14} />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Desglose de Cobros</h3>
              <div className="flex-1 h-px bg-white/5 ml-2" />
            </div>
            
            <div className="space-y-3">
              {data.pagos && data.pagos.length > 0 ? (
                data.pagos.map((pago, idx) => {
                  const getIcon = () => {
                    if (pago.metodo?.includes("EFECTIVO")) return <DollarSign size={14} className="text-emerald-400" />;
                    if (pago.metodo?.includes("TRANSFERENCIA")) return <ArrowRightLeft size={14} className="text-blue-400" />;
                    if (pago.metodo?.includes("TARJETA")) return <CreditCard size={14} className="text-amber-400" />;
                    return <Receipt size={14} className="text-white/40" />;
                  };

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                          {getIcon()}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-wider">{pago.metodo?.replace(/_/g, ' ')}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">Ref: {pago.referencia || "PAGO DIRECTO"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic tracking-tighter">${formatearMonto(pago.monto)}</p>
                        <p className="text-[8px] text-white/20 font-bold">{pago.detalles || ""}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                  <Info size={24} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{data.condicionVenta === "cuenta_corriente" ? "Pendiente de Cobro" : "Sin registros de pago"}</p>
                </div>
              )}
            </div>

            {/* Resume / Balance Logic */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Condición de Venta</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${data.condicionVenta === 'cuenta_corriente' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {data.condicionVenta || 'CONTADO'}
                </span>
              </div>
              
              {data.condicionVenta === 'cuenta_corriente' && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                   <div>
                    <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                    <p className="text-lg font-black text-blue-400 italic tracking-tighter">
                      ${formatearMonto(data.total - (data.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0))}
                    </p>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-blue-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500/40 border-t-blue-500 animate-spin" />
                   </div>
                </div>
              )}
            </div>
          </section>

          {/* Totals Section */}
          <section className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-3xl p-6 shadow-2xl space-y-3 mt-4">
            <div className="flex justify-between items-center text-white/40">
              <span className="text-[9px] font-black uppercase tracking-widest">Subtotal Bruto</span>
              <span className="text-xs font-bold font-mono">${formatearMonto(data.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-white/40">
              <span className="text-[9px] font-black uppercase tracking-widest">Impuestos (IVA)</span>
              <span className="text-xs font-bold font-mono">${formatearMonto(data.iva)}</span>
            </div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Total del Comprobante</span>
              <span className="text-2xl font-black text-white italic tracking-tighter">${formatearMonto(data.total)}</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DetalleComprobanteDrawer;
