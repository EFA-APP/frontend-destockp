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
  Info
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
      link.download = `Comprobante-${data.puntoVenta}-${data.numeroComprobante}.pdf`;
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
              <h2 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Detalle del Comprobante</h2>
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
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2 text-emerald-500">
                <CheckCircle2 size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Estado</span>
              </div>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-tight">AUTORIZADO</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 mb-2 text-white/70">
                <Calendar size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Emisión</span>
              </div>
              <p className="text-xs font-black text-white/80 uppercase tracking-tight">{formatearFecha(data.fechaEmision)}</p>
            </div>
          </div>

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
                    {data.receptor?.condicionIva || "CONSUMIDOR FINAL"}
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
                      <td className="px-4 py-4 text-right text-white/60">${item.precioUnitario?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-black text-white">${item.subtotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Totals Section */}
          <section className="grid grid-cols-2 gap-8 items-end pb-8">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-[var(--primary-light)]">
                  <CreditCard size={14} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Información de Pago</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/70 uppercase">
                    Metodo: <span className="text-white">{data.metodoPago?.replace(/_/g, ' ') || "CONTADO"}</span>
                  </p>
                  <p className="text-[10px] font-bold text-white/70 uppercase">
                    Condición: <span className="text-white">{data.condicionVenta || "CONTADO"}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-3xl p-6 shadow-2xl space-y-3">
              <div className="flex justify-between items-center text-white/40">
                <span className="text-[9px] font-black uppercase tracking-widest">Subtotal</span>
                <span className="text-xs font-bold font-mono">${data.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="text-[9px] font-black uppercase tracking-widest">IVA (21%)</span>
                <span className="text-xs font-bold font-mono">${data.iva?.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/10 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Final</span>
                <span className="text-xl font-black text-white italic tracking-tighter">${data.total?.toLocaleString()}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DetalleComprobanteDrawer;
