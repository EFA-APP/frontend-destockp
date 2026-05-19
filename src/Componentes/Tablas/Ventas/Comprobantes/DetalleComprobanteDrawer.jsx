import React, { useEffect, useState } from "react";
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
  QrCode,
  Tag,
  Receipt,
  CheckCircle2,
  Info,
  DollarSign,
  ArrowRightLeft,
  Clock,
  Banknote,
  Landmark,
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
    } catch (e) { console.error(e); }
  };

  const handleImprimirPDF = async () => {
    try {
      const blob = await pdf(<ComprobantePDF comprobante={data} usuario={usuario} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank")?.print();
    } catch (e) { console.error(e); }
  };

  const handleVerPDF = async () => {
    try {
      const blob = await pdf(<ComprobantePDF comprobante={data} usuario={usuario} />).toBlob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (e) { console.error(e); }
  };

  const getDocConfig = (tipo) => {
    const t = Number(tipo);
    if ([3, 8, 13, 53, 203, 208, 213, 993].includes(t)) return { label: "NC", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", iconBg: "bg-rose-500", icon: <ArrowRightLeft size={20} />, signo: "-" };
    if ([2, 7, 12, 52, 202, 207, 212].includes(t)) return { label: "ND", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", iconBg: "bg-amber-500", icon: <ArrowRightLeft size={20} />, signo: "+" };
    if ([1, 6, 11, 51, 201, 206, 211].includes(t)) return { label: "Factura", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", iconBg: "bg-blue-500", icon: <FileText size={20} />, signo: "" };
    if ([0, 4, 9, 15, 48, 54, 55, 99, 100, 991, 992].includes(t)) return { label: "Pago", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", iconBg: "bg-emerald-500", icon: <Receipt size={20} />, signo: "-" };
    return { label: "Doc", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", iconBg: "bg-slate-500", icon: <FileText size={20} />, signo: "" };
  };

  const getMetodoConfig = (metodo) => {
    const m = String(metodo || "").toUpperCase();
    if (m.includes("EFECTIVO")) return { icon: <Banknote size={20} />, color: "bg-emerald-500", lightBg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-600" };
    if (m.includes("TRANSFERENCIA")) return { icon: <ArrowRightLeft size={20} />, color: "bg-blue-500", lightBg: "bg-blue-50/50", border: "border-blue-100", text: "text-blue-600" };
    if (m.includes("TARJETA")) return { icon: <CreditCard size={20} />, color: "bg-indigo-500", lightBg: "bg-indigo-50/50", border: "border-indigo-100", text: "text-indigo-600" };
    if (m.includes("CHEQUE")) return { icon: <Landmark size={20} />, color: "bg-amber-500", lightBg: "bg-amber-50/50", border: "border-amber-100", text: "text-amber-600" };
    return { icon: <CreditCard size={20} />, color: "bg-slate-500", lightBg: "bg-slate-50/50", border: "border-slate-100", text: "text-slate-600" };
  };

  return createPortal(
    <div className={`h-full fixed inset-0 z-[1000] flex justify-end transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-[550px] bg-white shadow-2xl transform transition-transform duration-500 flex flex-col h-full ${open ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-black/5 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100"><ComprobanteIcono size={28} /></div>
            <div>
              <h2 className="text-xl font-black text-[var(--primary)] uppercase tracking-tighter leading-none mb-1.5">Detalle de Comprobante</h2>
              <p className="text-[14px] font-black text-rose-500/60 uppercase">{data.letraComprobante} {String(data.puntoVenta).padStart(5, "0")}-{String(data.numeroComprobante).padStart(8, "0")}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50 transition-all"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gray-50/30">
          <div className="flex items-center gap-4 p-5 rounded-md bg-white border border-black/5 shadow-sm">
            <button onClick={handleVerPDF} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-gray-100 text-[11px] font-black uppercase tracking-widest transition-all"><Eye size={16} /> Ver PDF</button>
            <button onClick={handleDescargarPDF} className="w-12 h-11 flex items-center justify-center rounded-md bg-black text-white shadow-xl shadow-black/10 transition-all"><Download size={16} /></button>
            <button onClick={handleImprimirPDF} className="w-12 h-11 flex items-center justify-center rounded-md bg-gray-100 text-black/40"><Printer size={20} /></button>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className={`p-6 rounded-md border shadow-sm ${data.estado === "ANULADO" ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
              <span className="text-[10px] font-black uppercase block mb-1">Estado</span>
              <p className="text-lg font-black uppercase">{data.estado || "VÁLIDO"}</p>
            </div>
            <div className="p-6 rounded-md bg-white border border-black/5 shadow-sm text-[var(--primary)]">
              <span className="text-[10px] font-black uppercase block mb-1">Fecha</span>
              <p className="text-lg font-black uppercase">{formatearFecha(data.fechaEmision)}</p>
            </div>
          </div>

          {/* Comprobantes Vinculados */}
          {Array.isArray(data.ajustes) && data.ajustes.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Receipt size={18} className="text-rose-500" /><h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">Ajustes Aplicados</h3>
                <div className="flex-1 h-px bg-black/5" />
              </div>
              <div className="space-y-3">
                {data.ajustes.map((ajuste, idx) => {
                  const config = getDocConfig(ajuste.tipo);
                  return (
                    <div key={idx} className={`p-5 rounded-md ${config.bg} border ${config.border} flex items-center justify-between`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-md ${config.iconBg} text-white flex items-center justify-center shadow-md`}>{config.icon}</div>
                        <div>
                          <p className={`text-[10px] font-black ${config.color} opacity-60 uppercase leading-none mb-1`}>{config.label} Aplicada</p>
                          <p className="text-[14px] font-black text-[var(--primary)] tracking-tight">{String(ajuste.ptoVta || 0).padStart(5, "0")}-{String(ajuste.nro || 0).padStart(8, "0")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[14px] font-black ${config.color} tabular-nums`}>{config.signo} ${formatearMonto(ajuste.total)}</p>
                        <p className="text-[9px] font-black text-[var(--primary)]/30 uppercase">{formatearFecha(ajuste.fecha)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Receptor */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <User size={18} className="text-rose-500" /><h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">Cliente</h3>
              <div className="flex-1 h-px bg-black/5" />
            </div>
            <div className="p-6 rounded-md bg-white border border-black/5 flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 rounded-md bg-rose-500 text-white flex items-center justify-center text-2xl font-black shadow-lg">{(data.receptor?.razonSocial || "C")[0]}</div>
              <div>
                <h4 className="text-lg font-black text-[var(--primary)] uppercase leading-none mb-1">{data.receptor?.razonSocial || `${data.receptor?.nombre} ${data.receptor?.apellido}`}</h4>
                <p className="text-[12px] font-bold text-rose-500 uppercase">{data.receptor?.DocTipo === 80 ? "CUIT" : "DNI"}: {data.receptor?.DocNro || "0"}</p>
              </div>
            </div>
          </section>

          {/* Detalles de Items */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Tag size={18} className="text-rose-500" /><h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">Detalle de Items</h3>
              <div className="flex-1 h-px bg-black/5" />
            </div>
            <div className="bg-white rounded-md border border-black/5 overflow-hidden shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 text-[10px] text-[var(--primary)]/60 font-black uppercase border-b border-black/5">
                  <tr><th className="px-6 py-4">Descripción</th><th className="px-6 py-4 text-center">Cant.</th><th className="px-6 py-4 text-right">Subtotal</th></tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {data.detalles?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-[var(--primary)] uppercase mb-1">{item.nombre}</p>
                        <p className="text-[10px] font-bold text-[var(--primary)]/40 uppercase">P. Unit: ${formatearMonto(item.precioUnitario)}</p>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-[var(--primary)]/40">{item.cantidad}</td>
                      <td className="px-6 py-5 text-right font-black text-[var(--primary)] tabular-nums">${formatearMonto(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pagos Registrados */}
          {Array.isArray(data.pagos) && data.pagos.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <DollarSign size={18} className="text-emerald-500" /><h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">Pagos Registrados</h3>
                <div className="flex-1 h-px bg-black/5" />
              </div>
              <div className="space-y-3">
                {data.pagos.map((pago, idx) => {
                  const config = getMetodoConfig(pago.metodo);
                  return (
                    <div key={idx} className={`p-5 rounded-md ${config.lightBg} border ${config.border} flex items-center justify-between shadow-sm`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-md ${config.color} text-white flex items-center justify-center shadow-md`}>
                          {config.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-black ${config.text} opacity-80 uppercase leading-none mb-1`}>Método: {pago.metodo}</p>
                          <p className="text-[14px] font-black text-[var(--primary)] tracking-tight truncate">
                            {pago.referencia || "Sin referencia"}
                          </p>
                          {pago.detalles && <span className="text-[9px] font-bold text-black/30 block uppercase tracking-tighter truncate">{pago.detalles}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[16px] font-black ${config.text.replace('600', '700')} tabular-nums`}>${formatearMonto(pago.monto)}</p>
                        <p className={`text-[9px] font-black ${config.text} opacity-40 uppercase`}>Abonado</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Totales y Saldo */}
          <section className="space-y-4">
            <div className="p-6 rounded-md bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Total Comprobante</p>
                <p className="text-3xl font-black tabular-nums">${formatearMonto(data.total)}</p>
              </div>
              <div className="w-14 h-14 rounded-md bg-white/20 flex items-center justify-center border border-white/30"><CheckCircle2 size={32} /></div>
            </div>
            {data.condicionVenta === "cuenta_corriente" && (
              <div className="p-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-between shadow-lg shadow-blue-500/10">
                <div>
                  <p className="text-[10px] font-black text-blue-600/50 uppercase mb-1">Saldo Pendiente</p>
                  <p className="text-2xl font-black text-blue-700 tabular-nums">${formatearMonto(data.total - (data.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) || 0))}</p>
                </div>
                <Clock size={28} className="text-blue-600" />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetalleComprobanteDrawer;
