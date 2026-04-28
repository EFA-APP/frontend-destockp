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
  ArrowRightLeft,
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
        <ComprobantePDF comprobante={data} usuario={usuario} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${data.cae || "SIN_CAE"}-${String(data.puntoVenta || 1).padStart(5, "0")}-${String(data.numeroComprobante || 0).padStart(8, "0")}.pdf`;
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
        <ComprobantePDF comprobante={data} usuario={usuario} />,
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
        <ComprobantePDF comprobante={data} usuario={usuario} />,
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
      minute: "2-digit",
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
    <div
      className={`h-full fixed inset-0 z-[1000] flex justify-end transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop con Blur más profundo */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Drawer Content - Ahora Blanco Premium */}
      <div
        className={`relative w-full max-w-[550px] bg-white shadow-[-30px_0_60px_rgba(0,0,0,0.2)] transform transition-transform duration-500 flex flex-col h-full ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header Drawer - Limpio y con Acento */}
        <div className="flex items-center justify-between p-8 border-b border-black/5 bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-sm">
              <ComprobanteIcono size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--primary)] uppercase tracking-tighter leading-none mb-1.5">
                {[3, 8, 13, 53].includes(Number(data.tipoDocumento))
                  ? "Nota de Crédito"
                  : [2, 7, 12, 52].includes(Number(data.tipoDocumento))
                    ? "Nota de Débito"
                    : "Comprobante de Venta"}
              </h2>
              <p className="text-[14px] font-black text-rose-500/60 tracking-[0.1em] uppercase">
                {data.letraComprobante}{" "}
                <span className="text-[var(--primary)]">
                  {String(data.puntoVenta).padStart(5, "0")}-
                  {String(data.numeroComprobante).padStart(8, "0")}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-rose-50 text-[var(--primary)]/60 hover:text-rose-500 transition-all group"
          >
            <X
              size={24}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gray-50/30">
          {/* Quick Actions Bar - Estilo Flotante */}
          <div className="flex items-center gap-4 p-5 rounded-md bg-white border border-black/5 shadow-sm">
            <button
              onClick={handleVerPDF}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-gray-100 hover:bg-gray-200 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest transition-all"
            >
              <Eye size={16} /> Ver PDF
            </button>
            <button
              onClick={handleDescargarPDF}
              className="w-12 h-11 flex items-center justify-center rounded-md bg-black text-white hover:bg-rose-600 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleImprimirPDF}
              className="w-12 h-12 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-[var(--primary)]/60 transition-all"
            >
              <Printer size={20} />
            </button>
          </div>

          {/* Status & General Info - Cards Refinadas */}
          <div className="grid grid-cols-2 gap-5">
            <div
              className={`p-6 rounded-md border shadow-sm transition-all ${data.estado === "ANULADO"
                ? "bg-rose-50 border-rose-100"
                : data.estado === "AJUSTADO_PARCIAL"
                  ? "bg-amber-50 border-amber-100"
                  : "bg-emerald-50 border-emerald-100"
                }`}
            >
              <div
                className={`flex items-center gap-2 mb-3 ${data.estado === "ANULADO"
                  ? "text-rose-600"
                  : data.estado === "AJUSTADO_PARCIAL"
                    ? "text-amber-600"
                    : "text-emerald-600"
                  }`}
              >
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Estado Actual
                </span>
              </div>
              <p
                className={`text-lg font-black uppercase tracking-tight ${data.estado === "ANULADO"
                  ? "text-rose-700"
                  : data.estado === "AJUSTADO_PARCIAL"
                    ? "text-amber-700"
                    : "text-emerald-700"
                  }`}
              >
                {data.estado || "VÁLIDO"}
              </p>
            </div>
            <div className="p-6 rounded-md bg-white border border-black/5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-[var(--primary)]/60">
                <Calendar size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Fecha de Emisión
                </span>
              </div>
              <p className="text-lg font-black text-[var(--primary)] uppercase tracking-tight">
                {formatearFecha(data.fechaEmision)}
              </p>
            </div>
          </div>

          {/* AJUSTES APLICADOS (A quién ajusto yo) */}
          {data.cbtesAsoc &&
            Array.isArray(data.cbtesAsoc) &&
            data.cbtesAsoc.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <ArrowRightLeft size={18} className="text-amber-500" />
                  <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                    Referencia a Comprobante
                  </h3>
                  <div className="flex-1 h-px bg-black/5" />
                </div>
                <div className="space-y-3">
                  {data.cbtesAsoc.map((cbte, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest leading-none mb-1.5">
                            Documento Asociado
                          </p>
                          <p className="text-[14px] font-black text-[var(--primary)] uppercase tracking-tight">
                            Tipo {cbte.tipo} |{" "}
                            {String(cbte.ptoVta).padStart(5, "0")}-
                            {String(cbte.nro).padStart(8, "0")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Client Info - Estilo Perfil */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <User size={18} className="text-rose-500" />
              <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                Información del Cliente
              </h3>
              <div className="flex-1 h-px bg-black/5" />
            </div>
            <div className="p-4 rounded-md bg-white border border-black/5 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/20" />
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-md bg-rose-500 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-rose-500/20 uppercase">
                  {(data.receptor?.razonSocial || "C")[0]}
                </div>
                <div>
                  <h4 className="text-lg font-black text-[var(--primary)] uppercase tracking-tight leading-none mb-1">
                    {data.receptor?.razonSocial || "CONSUMIDOR FINAL"}
                  </h4>
                  <p className="text-[12px] font-bold text-rose-500 uppercase tracking-widest">
                    {data.receptor?.DocTipo === 80 ? "CUIT" : "DNI"}:{" "}
                    {data.receptor?.DocNro || "0"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* OBSERVACIONES */}
          {data.observaciones && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Info size={18} className="text-rose-500" />
                <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                  Notas Internas
                </h3>
                <div className="flex-1 h-px bg-black/5" />
              </div>
              <div className="p-6 rounded-md bg-gray-50 border border-black/5">
                <p className="text-[14px] font-medium text-[var(--primary)]/60 leading-relaxed italic italic-rose">
                  "{data.observaciones}"
                </p>
              </div>
            </section>
          )}

          {/* Fiscal Details - AFIP QR */}
          {data.cae && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <QrCode size={18} className="text-rose-500" />
                <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                  Autorización Fiscal (AFIP)
                </h3>
                <div className="flex-1 h-px bg-black/5" />
              </div>
              <div className="p-6 rounded-md bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">
                        CAE Vigente
                      </label>
                      <p className="text-xl font-black text-emerald-700 font-mono tracking-widest leading-none">
                        {data.cae}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">
                        Vencimiento de CAE
                      </label>
                      <p className="text-[14px] font-black text-emerald-700 uppercase tracking-[0.1em]">
                        {formatearFechaAfip(data.vtoCae)}
                      </p>
                    </div>
                  </div>
                  {data.qrCodeImage && (
                    <div className="p-3 bg-white rounded-md shadow-xl shadow-emerald-700/10 border border-emerald-100">
                      <img
                        src={data.qrCodeImage}
                        alt="QR"
                        className="w-24 h-24 mix-blend-multiply"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Details Table - Estilo Ticket Premium */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <Tag size={18} className="text-rose-500" />
              <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                Detalle del Comprobante
              </h3>
              <div className="flex-1 h-px bg-black/5" />
            </div>
            <div className="bg-white rounded-md border border-black/5 overflow-hidden shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 text-[10px] text-[var(--primary)]/60 font-black uppercase tracking-widest border-b border-black/5">
                  <tr>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4 text-center">Cant.</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {data.detalles?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-rose-50/30 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-[var(--primary)] uppercase leading-none mb-1">
                          {item.nombre}
                        </p>
                        <p className="text-[10px] font-bold text-[var(--primary)]/60 uppercase tracking-widest">
                          P. Unitario: ${formatearMonto(item.precioUnitario)}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-[var(--primary)]/40">
                        {item.cantidad}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-[var(--primary)] tabular-nums">
                        ${formatearMonto(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Breakdown of Payments - Cards estilo Cobro */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <DollarSign size={18} className="text-emerald-500" />
              <h3 className="text-[12px] font-black text-[var(--primary)]/60 uppercase tracking-[0.2em]">
                Historial de Cobranza
              </h3>
              <div className="flex-1 h-px bg-black/5" />
            </div>

            <div className="space-y-3">
              {data.pagos && data.pagos.length > 0 ? (
                data.pagos.map((pago, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-5 rounded-md bg-white border border-black/5 shadow-sm hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {pago.metodo?.includes("EFECTIVO") ? (
                          <DollarSign size={24} />
                        ) : pago.metodo?.includes("TRANSFER") ? (
                          <ArrowRightLeft size={24} />
                        ) : (
                          <CreditCard size={24} />
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-[var(--primary)] uppercase tracking-tight">
                          {pago.metodo?.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-[var(--primary)]/60 font-bold uppercase tracking-widest">
                          REF: {pago.referencia || "SIN REFERENCIA"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-600 tabular-nums leading-none mb-1">
                        ${formatearMonto(pago.monto)}
                      </p>
                      <p className="text-[10px] font-black text-[var(--primary)]/10 uppercase">
                        {formatearFecha(pago.fecha) || "COBRADO"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 rounded-md border-2 border-dashed border-black/5 flex flex-col items-center justify-center opacity-30">
                  <Info size={32} className="mb-3 text-[var(--primary)]" />
                  <p className="text-[12px] font-black uppercase tracking-widest text-center">
                    {data.condicionVenta === "cuenta_corriente"
                      ? "Operación en Cuenta Corriente\n(Pendiente de cobro)"
                      : "Sin registros de pago detallados"}
                  </p>
                </div>
              )}
            </div>

            {/* Resume / Balance Logic - Diseño de impacto */}
            {data.condicionVenta === "cuenta_corriente" && (
              <div className="p-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-between shadow-xl shadow-blue-500/10">
                <div>
                  <p className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.2em] mb-2">
                    Saldo Pendiente de Cobro
                  </p>
                  <p className="text-2xl font-black text-blue-700 tabular-nums tracking-tighter">
                    $
                    {formatearMonto(
                      data.total -
                      (data.pagos?.reduce(
                        (acc, p) => acc + (p.monto || 0),
                        0,
                      ) || 0),
                    )}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Clock size={28} />
                </div>
              </div>
            )}
          </section>

          {/* Totals Section - Diseño de Ticket Final */}
          <section className="bg-[var(--primary)] text-white rounded-md p-8 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-white/40">
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  Importe Neto Gravado
                </span>
                <span className="text-[14px] font-bold font-mono">
                  ${formatearMonto(data.subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/40">
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                  Impuesto IVA (21%)
                </span>
                <span className="text-[14px] font-bold font-mono">
                  ${formatearMonto(data.iva)}
                </span>
              </div>

              <div className="h-px bg-white/10 my-2" />

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-rose-500 uppercase tracking-[0.3em] mb-1">
                    Total Final
                  </span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Saldo de Operación
                  </span>
                </div>
                <span className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">
                  ${formatearMonto(data.total)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DetalleComprobanteDrawer;
