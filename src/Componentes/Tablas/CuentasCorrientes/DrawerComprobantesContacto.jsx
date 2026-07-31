import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Search,
  FileText,
  CreditCard,
  Wallet,
  Receipt,
  User,
  Download,
  Loader2,
} from "lucide-react";
import DataTable from "../../UI/DataTable/DataTable";
import DateRangePicker from "../../UI/DateRangePicker/DateRangePicker";
import { useListarComprobantesPorContacto } from "../../../Backend/CuentasCorrientes/queries/useListarComprobantesPorContacto";
import { cuentasCorrientesAPI } from "../../../Backend/CuentasCorrientes/api";
import { format } from "date-fns";

const ESTADO_LABELS = {
  BORRADOR: "Borrador",
  CONFIRMADO: "Confirmado",
  PENDIENTE_PAGO: "Pendiente de pago",
  PARCIALMENTE_ABONADO: "Parcialmente abonado",
  ANULACION_PARCIAL: "Anulación parcial",
  ABONADO: "Abonado",
  ANULADO: "Anulado",
};

const DrawerComprobantesContacto = ({
  isOpen,
  onClose,
  contacto,
  tipo = "INGRESO",
}) => {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const codigoContacto = contacto?.codigo || contacto?.codigoContacto;

  const { data: response, isLoading } = useListarComprobantesPorContacto(
    codigoContacto,
    {
      desde,
      hasta,
      estado,
    },
  );

  const comprobantes = response?.comprobantes || [];

  const handleClose = () => {
    onClose();
    setDesde("");
    setHasta("");
    setEstado("TODOS");
  };

  const handleDescargarPdf = async () => {
    try {
      setGenerandoPdf(true);

      const blob = await cuentasCorrientesAPI.descargarReportePdf(
        codigoContacto,
        { desde, hasta, estado, tipo },
      );
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `CuentaCorriente_${codigoContacto}_${new Date().toLocaleDateString("es-AR")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF de cuenta corriente:", error);
    } finally {
      setGenerandoPdf(false);
    }
  };

  const formatearMoneda = (monto) => {
    if (monto == null) return "$ 0.00";
    return Number(monto).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });
  };

  const columnas = [
    {
      key: "fechaEmision",
      etiqueta: "Fecha",
      renderizar: (valor, fila) => (
        <span className="text-sm font-bold text-gray-700 font-mono whitespace-nowrap">
          {fila.fechaEmision
            ? format(new Date(fila.fechaEmision), "dd/MM/yyyy")
            : "-"}
        </span>
      ),
    },
    {
      key: "numeroComprobante",
      etiqueta: "Comprobante",
      renderizar: (valor, fila) => {
        const ptoVta = String(fila.puntoVenta || 1).padStart(4, "0");
        const nro = String(fila.numeroComprobante || 0).padStart(8, "0");
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none mb-1 font-mono">{`${ptoVta}-${nro}`}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                Tipo {fila.codigoTipoComprobante}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "estado",
      etiqueta: "Estado",
      renderizar: (valor, fila) => {
        const est = fila.estado || "BORRADOR";
        let dotColor = "bg-gray-500";
        let color = "bg-gray-50 text-gray-700 border-gray-200";
        
        if (est === "ABONADO") {
          color = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
          dotColor = "bg-emerald-500";
        }
        if (est === "PENDIENTE_PAGO" || est === "PARCIALMENTE_ABONADO" || est === "ANULACION_PARCIAL") {
          color = "bg-amber-50 text-amber-700 border-amber-200/60";
          dotColor = "bg-amber-500";
        }
        if (est === "ANULADO") {
          color = "bg-rose-50 text-rose-700 border-rose-200/60";
          dotColor = "bg-rose-500";
        }
        if (est === "CONFIRMADO") {
          color = "bg-blue-50 text-blue-700 border-blue-200/60";
          dotColor = "bg-blue-500";
        }
        
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {ESTADO_LABELS[est] || est}
          </span>
        );
      },
    },
    {
      key: "total",
      etiqueta: "Total",
      renderizar: (valor, fila) => (
        <div className="text-right w-full pr-4">
          <span className="text-sm font-black tabular-nums text-gray-900">
            {formatearMoneda(fila.total)}
          </span>
        </div>
      ),
    },
    {
      key: "saldoPendiente",
      etiqueta: "Saldo Pendiente",
      renderizar: (valor, fila) => {
        const saldo = Number(fila.saldoPendiente || 0);
        return (
          <div className="text-right w-full pr-4">
            <span
              className={`text-sm font-black tabular-nums ${saldo > 0 ? "text-rose-600" : "text-gray-500"}`}
            >
              {formatearMoneda(saldo)}
            </span>
          </div>
        );
      },
    },
  ];

  if (!isOpen) return null;

  const saldoActual = Number(contacto?.saldo || 0);
  const saldoAFavor = Number(contacto?.saldoAFavor || 0);

  const nombreContacto =
    contacto?.razonSocial || contacto?.nombre || "Contacto";
  const inicial = nombreContacto.charAt(0).toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white shadow-2xl flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300">
        
        {/* Header Corporativo */}
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-200 flex items-start justify-between shrink-0">
          <div className="flex gap-5 items-center">
            <div className="h-16 w-16 rounded-md bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#1FAE6D] text-2xl font-black shadow-sm shrink-0">
              {inicial}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Detalle de Cuenta Corriente
              </p>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-3">
                {nombreContacto} {contacto?.apellido ? ` ${contacto.apellido}` : ""}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm font-mono">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  {contacto?.documento || "Sin documento"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md border shadow-sm ${
                    saldoActual > 0
                        ? "bg-rose-50 text-rose-700 border-rose-200/60"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  <Wallet
                    className={`w-3.5 h-3.5 ${saldoActual > 0 ? "text-rose-500" : "text-gray-500"}`}
                  />
                  Saldo: {formatearMoneda(saldoActual)}
                </span>
                
                {saldoAFavor > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md border shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200/60">
                    <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                    Saldo a Favor: {formatearMoneda(saldoAFavor)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-gray-900 rounded-md transition-all shadow-sm cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-8 py-5 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-end gap-5 shrink-0">
          <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="BORRADOR">{ESTADO_LABELS.BORRADOR}</option>
              <option value="CONFIRMADO">{ESTADO_LABELS.CONFIRMADO}</option>
              <option value="PENDIENTE_PAGO">
                {ESTADO_LABELS.PENDIENTE_PAGO}
              </option>
              <option value="PARCIALMENTE_ABONADO">
                {ESTADO_LABELS.PARCIALMENTE_ABONADO}
              </option>
              <option value="ANULACION_PARCIAL">
                {ESTADO_LABELS.ANULACION_PARCIAL}
              </option>
              <option value="ABONADO">{ESTADO_LABELS.ABONADO}</option>
              <option value="ANULADO">{ESTADO_LABELS.ANULADO}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Rango de Fechas
            </label>
            <div className="h-11">
              <DateRangePicker
                fechaDesde={desde}
                fechaHasta={hasta}
                onChange={(desdeStr, hastaStr) => {
                  setDesde(desdeStr);
                  setHasta(hastaStr);
                }}
              />
            </div>
          </div>
          <div className="flex sm:items-end">
            <button
              onClick={handleDescargarPdf}
              disabled={generandoPdf}
              className="h-11 w-full sm:w-auto px-6 flex items-center justify-center gap-2 rounded-md bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.15)] cursor-pointer transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generandoPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" strokeWidth={2.5} />
              )}
              {generandoPdf ? "Generando..." : "Exportar PDF"}
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <DataTable
              columnas={columnas}
              datos={comprobantes}
              loading={isLoading}
              mostrarAcciones={false}
              emptyMessage="No se encontraron comprobantes para este contacto con los filtros aplicados."
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DrawerComprobantesContacto;
