import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  Printer,
  Eye,
  FileText,
  User,
  Calendar,
  Tag,
  DollarSign,
  ArrowRightLeft,
  Banknote,
  Landmark,
  ShieldCheck,
  CreditCard,
  Building2,
  FileCheck,
  FileX,
  Receipt,
  Copy,
  Check,
  Mail,
  AlertCircle,
  CheckCircle,
  Ban,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "./ComprobantePDF";
import { ComprobanteIcono } from "../../../../assets/Icons";
import {
  enviarComprobanteEmailApi,
  obtenerComprobantePorCodigo,
  anularComprobanteApi,
} from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import {
  ObtenerContactoApi,
  ActualizarContactoApi,
} from "../../../../Backend/Contactos/api/contactos.api";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

const LETRA_MAP = {
  1: "A",
  2: "A",
  3: "A",
  6: "B",
  7: "B",
  8: "B",
  11: "C",
  12: "C",
  13: "C",
};

const isoToAfip = (iso) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d)) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
};

const adaptarComprobante = (full) => {
  const letraComprobante =
    full.letraComprobante || LETRA_MAP[full.codigoTipoComprobante] || "";
  return {
    tipoDocumento: full.codigoTipoComprobante,
    letraComprobante,
    puntoVenta: full.puntoVenta,
    numeroComprobante: full.numeroComprobante,
    fechaEmision: full.fechaEmision,
    fechaVto: full.fechaVto,
    estado: full.estado,
    condicionVenta: full.condicionComprobante,
    cae: full.cae,
    vtoCae: isoToAfip(full.vtoCae), // PDF espera YYYYMMDD
    fiscal: !!full.cae,
    total: full.total,
    subtotal: full.subtotal,
    iva: full.iva,
    qrCodeImage: full.qrCode ?? undefined,
    receptor: {
      razonSocial: full.razonSocial,
      DocNro: full.numeroDocumento,
      DocTipo: 80,
      condicionIva: full.condicionIvaReceptor,
      codigoReceptor: full.codigoReceptor,
    },
    detalles: (full.detalles || []).map((d) => ({
      nombre: d.descripcion,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      tasaIva: d.tasaIva,
      subtotal:
        d.subtotal ?? d.precioUnitario * d.cantidad - (d.descuento || 0),
    })),
    pagos: (full.pagos || []).map((p) => ({
      metodo: p.tipoMetodoPago,
      monto: p.monto,
      referencia: p.referencia,
      fechaPago: p.fechaPago,
      codigoBancoDestino: p.codigoBancoDestino,
    })),
    ajustes: [],
    cbtesAsoc: (full.comprobantesAsociados || []).map((a) => {
      // Preferimos los datos reales del documento origen (tipoDescripcionComprobanteOrigen/
      // numeroComprobanteOrigenDisplay/puntoVentaOrigen), igual que ListadoComprobante.jsx.
      // Si su relación es anular/nota de crédito y todavía no hay ese dato (comprobantes
      // históricos generados antes del fix de backend), lo mostramos igual con ese nombre
      // aunque internamente haya sido grabado como una Factura Interna (991).
      const tipoVisual =
        a.tipoDescripcionComprobanteOrigen ??
        (a.tipoRelacion === "NOTA_CREDITO"
          ? "NOTA_CREDITO"
          : (a.codigoTipoComprobanteAsociado ?? a.codigoTipoComprobante ?? a.tipoRelacion));
      return {
        tipo: tipoVisual,
        ptoVta: a.puntoVentaOrigen ?? a.puntoVenta ?? 0,
        nro: a.numeroComprobanteOrigenDisplay ?? a.numeroComprobanteAsociado ?? a.numeroComprobanteOrigen,
        total: a.importeAplicado,
        codigo: a.codigoComprobante,
      };
    }),
  };
};

// ─── formatters ──────────────────────────────────────────────────────────────

const fmt = (n) =>
  `$ ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0)}`;

const fmtFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Handles YYYYMMDD (AFIP) or ISO string
const fmtVtoCae = (str) => {
  if (!str) return "—";
  if (typeof str === "string" && /^\d{8}$/.test(str))
    return `${str.slice(6)}/${str.slice(4, 6)}/${str.slice(0, 4)}`;
  return fmtFecha(str);
};

// For the PDF component (expects YYYYMMDD) – already converted in the adapter,
// but this handles raw ISO strings as a safety net.
const formatearFechaAfip = (s) => {
  if (!s) return "";
  if (/^\d{8}$/.test(s))
    return `${s.slice(6)}/${s.slice(4, 6)}/${s.slice(0, 4)}`;
  return fmtFecha(s);
};

// ─── condición IVA ────────────────────────────────────────────────────────────

const CONDICION_IVA = {
  CF: "Consumidor Final",
  RI: "Resp. Inscripto",
  M: "Monotributo",
  EX: "Exento",
  1: "Resp. Inscripto",
  4: "Monotributo",
  5: "Consumidor Final",
  6: "Exento",
};

// ─── tipo documento ───────────────────────────────────────────────────────────

const getTipoConfig = (tipo) => {
  const t = Number(tipo);
  if ([1, 6, 11, 51, 201, 206, 211, 991].includes(t))
    return {
      label: "Factura",
      iconBg: "bg-blue-50 text-blue-700 border-blue-200",
      badgeCls: "bg-blue-50 text-blue-800 border-blue-200",
      accentCls: "bg-blue-600",
      Icon: FileCheck,
    };
  if ([2, 7, 12, 52, 202, 207, 212, 994].includes(t))
    return {
      label: "Nota de Débito",
      iconBg: "bg-amber-50 text-amber-700 border-amber-200",
      badgeCls: "bg-amber-50 text-amber-900 border-amber-200",
      accentCls: "bg-amber-500",
      Icon: FileText,
    };
  if ([3, 8, 13, 53, 203, 208, 213, 993].includes(t))
    return {
      label: "Nota de Crédito",
      iconBg: "bg-rose-50 text-rose-700 border-rose-200",
      badgeCls: "bg-rose-50 text-rose-800 border-rose-200",
      accentCls: "bg-rose-500",
      Icon: FileX,
    };
  if ([4, 9, 15, 54, 992].includes(t))
    return {
      label: "Recibo",
      iconBg: "bg-violet-50 text-violet-700 border-violet-200",
      badgeCls: "bg-violet-50 text-violet-800 border-violet-200",
      accentCls: "bg-violet-500",
      Icon: Receipt,
    };
  return {
    label: "Comprobante",
    iconBg: "bg-gray-50 text-gray-700 border-gray-200",
    badgeCls: "bg-gray-50 text-gray-800 border-gray-200",
    accentCls: "bg-gray-400",
    Icon: FileText,
  };
};

// R76/R90: la anulación general (T63) aplica exclusivamente a
// RECIBO/ORDEN_PAGO (incluidas sus variantes internas 992/993) — mismo
// criterio ya usado por `AnularReciboCasoDeUso` (comprobantes-ms).
const TIPOS_ANULABLES = [4, 9, 15, 54, 992, 993];
const esAnulable = (tipo) => TIPOS_ANULABLES.includes(Number(tipo));

const getFullTitle = (tipo, letra) => {
  const t = Number(tipo);
  let base = "COMPROBANTE";
  if ([1, 6, 11, 51, 201, 206, 211, 991].includes(t)) base = "FACTURA";
  if ([2, 7, 12, 52, 202, 207, 212, 995].includes(t)) base = "NOTA DE DÉBITO";
  if ([3, 8, 13, 53, 203, 208, 213, 994].includes(t)) base = "NOTA DE CRÉDITO";
  if ([4, 9, 15, 54, 992].includes(t)) base = "RECIBO";
  if ([993].includes(t)) base = "ORDEN DE PAGO";
  const interno = [991, 992, 993, 994, 995, 996].includes(t);
  return `${base}${letra ? ` ${letra}` : ""}${interno ? " (INTERNO)" : ""}`;
};

// Resumen "tipo + número" de un comprobante asociado (mismo criterio de
// formato ya usado en la sección "Comprobantes Asociados"), para mostrar
// junto al ítem de pago en "Detalle de Ítems".
const formatComprobanteAsociadoResumen = (cb) => {
  const tipoLabel = isNaN(Number(cb.tipo))
    ? String(cb.tipo || "").replace(/_/g, " ")
    : getFullTitle(cb.tipo, "");
  const numero = `${String(cb.ptoVta || 0).padStart(5, "0")}-${String(cb.nro || 0).padStart(8, "0")}`;
  return `${tipoLabel} ${numero}`;
};

// ─── método de pago ───────────────────────────────────────────────────────────

const getMetodoConfig = (metodo) => {
  const m = String(metodo || "").toUpperCase();
  if (m === "EFECTIVO")
    return {
      Icon: Banknote,
      color: "bg-emerald-600",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      text: "text-emerald-800",
      label: "Efectivo",
    };
  if (m === "TRANSFERENCIA")
    return {
      Icon: ArrowRightLeft,
      color: "bg-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      text: "text-blue-800",
      label: "Transferencia",
    };
  if (m === "TARJETA_CREDITO")
    return {
      Icon: CreditCard,
      color: "bg-indigo-600",
      bg: "bg-indigo-50/50",
      border: "border-indigo-100",
      text: "text-indigo-800",
      label: "Tarjeta Crédito",
    };
  if (m === "TARJETA_DEBITO")
    return {
      Icon: CreditCard,
      color: "bg-purple-600",
      bg: "bg-purple-50/50",
      border: "border-purple-100",
      text: "text-purple-800",
      label: "Tarjeta Débito",
    };
  if (m.includes("CHEQUE_TERCERO"))
    return {
      Icon: Landmark,
      color: "bg-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      text: "text-amber-900",
      label: "Cheque",
    };
  return {
    Icon: CreditCard,
    color: "bg-slate-500",
    bg: "bg-slate-50/50",
    border: "border-slate-100",
    text: "text-slate-800",
    label: metodo || "Otro",
  };
};

// ─── estado ───────────────────────────────────────────────────────────────────

const ESTADO_CLS = {
  BORRADOR: "bg-slate-100 text-slate-800 border-slate-200",
  CONFIRMADO: "bg-blue-50 text-blue-800 border-blue-200",
  PENDIENTE_PAGO: "bg-amber-50 text-amber-900 border-amber-200",
  PARCIALMENTE_ABONADO: "bg-orange-50 text-orange-900 border-orange-200",
  ABONADO: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ANULADO: "bg-red-50 text-red-800 border-red-200",
};

const ESTADO_DOT = {
  BORRADOR: "bg-slate-500",
  CONFIRMADO: "bg-blue-500",
  PENDIENTE_PAGO: "bg-amber-500",
  PARCIALMENTE_ABONADO: "bg-orange-500",
  ABONADO: "bg-emerald-500",
  ANULADO: "bg-red-500",
};

const ESTADO_LABEL = {
  BORRADOR: "Borrador",
  CONFIRMADO: "Confirmado",
  PENDIENTE_PAGO: "Pendiente de Pago",
  PARCIALMENTE_ABONADO: "Parcialmente Abonado",
  ABONADO: "Abonado",
  ANULADO: "Anulado",
};

// ─── micro-componentes ────────────────────────────────────────────────────────

const SecTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon size={14} className="text-[var(--primary)] shrink-0" />}
    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
      {children}
    </span>
  </div>
);

const DataRow = ({ label, children, mono }) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider shrink-0">
      {label}
    </span>
    <span
      className={`text-sm font-bold text-slate-900 text-right ${mono ? "font-mono tracking-wide" : ""}`}
    >
      {children ?? "—"}
    </span>
  </div>
);

// ─── componente principal ─────────────────────────────────────────────────────

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const DetalleComprobanteDrawer = ({ open, onClose, data, usuario, onAnulado }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mostrarAnular, setMostrarAnular] = useState(false);
  const [motivoAnular, setMotivoAnular] = useState("");
  const [anulando, setAnulando] = useState(false);
  const [errorAnular, setErrorAnular] = useState(null);
  const [caeCopiado, setCaeCopiado] = useState(false);
  const [stepEmail, setStepEmail] = useState(null); // null | 'cargando' | 'form' | 'enviado'
  const [emailInput, setEmailInput] = useState("");
  const [contactoSinEmail, setContactoSinEmail] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [errorEmail, setErrorEmail] = useState(null);
  const [emailNuevo, setEmailNuevo] = useState("");
  const [guardandoEmail, setGuardandoEmail] = useState(false);

  const [seleccionadosAsoc, setSeleccionadosAsoc] = useState({});
  const [cargandoAsoc, setCargandoAsoc] = useState(false);

  useEffect(() => {
    if (data?.cbtesAsoc) {
      const initial = {};
      for (const cb of data.cbtesAsoc) {
        if (cb.codigo) {
          initial[cb.codigo] = true; // checked by default
        }
      }
      setSeleccionadosAsoc(initial);
    } else {
      setSeleccionadosAsoc({});
    }
  }, [data]);

  const toggleAsociado = (codigo) => {
    setSeleccionadosAsoc((prev) => ({
      ...prev,
      [codigo]: !prev[codigo],
    }));
  };
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(t);
    }
  }, [open]);

  const tipoConfig = useMemo(
    () => getTipoConfig(data?.tipoDocumento),
    [data?.tipoDocumento],
  );

  const itemsSubtotal = useMemo(
    () => (data?.detalles || []).reduce((s, d) => s + (d.subtotal || 0), 0),
    [data?.detalles],
  );

  if (!open && !isVisible) return null;
  if (!data) return null;

  // ── PDF ──
  const makePdfBlob = async () => {
    const list = [data];
    const elegidos = (data.cbtesAsoc || []).filter(
      (cb) => cb.codigo && seleccionadosAsoc[cb.codigo]
    );

    if (elegidos.length > 0) {
      setCargandoAsoc(true);
      try {
        for (const cb of elegidos) {
          const full = await obtenerComprobantePorCodigo(cb.codigo);
          if (full) {
            list.push(adaptarComprobante(full));
          }
        }
      } catch (e) {
        console.error("Error fetching associated vouchers for PDF:", e);
      } finally {
        setCargandoAsoc(false);
      }
    }

    return await pdf(
      <ComprobantePDF comprobante={list.length === 1 ? list[0] : list} usuario={usuario} />
    ).toBlob();
  };

  const handleVerPDF = async () => {
    try {
      window.open(URL.createObjectURL(await makePdfBlob()), "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const url = URL.createObjectURL(await makePdfBlob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.cae || "COMP"}-${data.puntoVenta}-${data.numeroComprobante}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImprimirPDF = async () => {
    try {
      window.open(URL.createObjectURL(await makePdfBlob()), "_blank")?.print();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopiarCae = (cae) => {
    if (!cae) return;
    navigator.clipboard.writeText(cae);
    setCaeCopiado(true);
    setTimeout(() => setCaeCopiado(false), 2000);
  };

  const handleAbrirEmail = async () => {
    setStepEmail("cargando");
    setErrorEmail(null);
    try {
      const codigoReceptor =
        data?.receptor?.codigoReceptor ?? data?.codigoReceptor;
      if (!codigoReceptor) {
        setContactoSinEmail(true);
        setStepEmail("form");
        return;
      }
      const contacto = await ObtenerContactoApi(codigoReceptor);
      if (contacto?.correoElectronico) {
        setEmailInput(contacto.correoElectronico);
        setContactoSinEmail(false);
      } else {
        setContactoSinEmail(true);
        setEmailInput("");
      }
      setStepEmail("form");
    } catch {
      setErrorEmail("No se pudo obtener el contacto.");
      setStepEmail(null);
    }
  };

  const handleEnviarEmailDrawer = async () => {
    if (!emailInput) return;
    setEnviandoEmail(true);
    setErrorEmail(null);
    try {
      const blob = await makePdfBlob();
      const pdfBase64 = await blobToBase64(blob);
      const nroFmtEmail = `${String(data.puntoVenta || 0).padStart(5, "0")}-${String(data.numeroComprobante || 0).padStart(8, "0")}`;
      const nombreTipo = getFullTitle(
        data.tipoDocumento,
        data.letraComprobante,
      );
      await enviarComprobanteEmailApi({
        emailDestino: emailInput,
        pdfBase64,
        nombreComprobante: nombreTipo,
        numeroComprobante: nroFmtEmail,
        codigoUnidadNegocio: data.codigoUnidadNegocio,
      });
      setStepEmail("enviado");
    } catch (e) {
      setErrorEmail(e?.response?.data?.message || "Error al enviar el email.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleAnular = async () => {
    if (!motivoAnular.trim() || !data?.codigo) return;
    setAnulando(true);
    setErrorAnular(null);
    try {
      await anularComprobanteApi(data.codigo, motivoAnular.trim());
      setMostrarAnular(false);
      setMotivoAnular("");
      onAnulado?.();
    } catch (e) {
      setErrorAnular(
        e?.response?.data?.message || "No se pudo anular el comprobante.",
      );
    } finally {
      setAnulando(false);
    }
  };

  const nroFmt = `${String(data.puntoVenta || 0).padStart(5, "0")}-${String(data.numeroComprobante || 0).padStart(8, "0")}`;
  const titulo = getFullTitle(data.tipoDocumento, data.letraComprobante);
  const { Icon: TipoIcon } = tipoConfig;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center h-full md:p-6 overflow-y-auto transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl bg-white rounded-md shadow-2xl border border-slate-100 flex flex-col md:my-4 max-h-[92vh] overflow-hidden transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Accent top bar */}
        <div className={`h-1 w-full shrink-0 ${tipoConfig.accentCls}`} />

        {/* ── HEADER ── */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-white">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Tipo icon */}
            <div
              className={`w-11 h-11 rounded-md ${tipoConfig.iconBg} flex items-center justify-center shadow-sm shrink-0 border`}
            >
              <TipoIcon size={20} />
            </div>

            {/* Title block */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tipoConfig.badgeCls}`}
                >
                  {titulo}
                </span>
                {data.estado && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      ESTADO_CLS[data.estado] ||
                      "bg-slate-100 text-slate-800 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${ESTADO_DOT[data.estado] || "bg-slate-400"}`}
                    />
                    {ESTADO_LABEL[data.estado] || data.estado}
                  </span>
                )}
                {data.fiscal && data.cae && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-800 border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    CAE ✓
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums tracking-tight font-mono leading-none mt-1">
                {nroFmt}
              </p>
              {data.receptor?.razonSocial && (
                <p className="text-xs font-semibold text-slate-600 mt-1 truncate uppercase">
                  {data.receptor.razonSocial}
                </p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="hidden sm:block shrink-0 text-right bg-slate-50 border border-slate-100 rounded-md px-3.5 py-1.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">
              Total Comprobante
            </p>
            <p className="text-lg font-black text-slate-900 tabular-nums leading-none">
              {fmt(data.total)}
            </p>
          </div>

          {/* PDF + Close */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-1">
              <button
                onClick={handleVerPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wider bg-[var(--color-brand-primary)] text-white hover:brightness-110 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Eye size={14} />
                <span className="hidden md:inline">Ver PDF</span>
              </button>
              <button
                onClick={handleDescargarPDF}
                title="Descargar PDF"
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors active:scale-95 cursor-pointer"
              >
                <Download size={14} />
              </button>
              <button
                onClick={handleImprimirPDF}
                title="Imprimir"
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors active:scale-95 cursor-pointer"
              >
                <Printer size={14} />
              </button>
              <TieneAccion accion="ENVIAR_EMAIL">
                <button
                  onClick={handleAbrirEmail}
                  disabled={stepEmail === "cargando"}
                  title="Enviar por email"
                  className="p-1.5 rounded-md text-slate-600 hover:text-violet-600 hover:bg-violet-50 transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Mail size={14} />
                </button>
              </TieneAccion>
            </div>
            {esAnulable(data.tipoDocumento) && data.estado !== "ANULADO" && data.codigo && (
              <button
                onClick={() => setMostrarAnular((v) => !v)}
                title="Anular comprobante"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Ban size={14} />
                <span className="hidden md:inline">Anular</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors group active:scale-95 cursor-pointer"
            >
              <X
                size={16}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>

        {/* ── ANULAR PANEL (R89, T63) ── */}
        {mostrarAnular && (
          <div className="px-5 py-3 border-b border-slate-100 bg-rose-50/50 flex flex-col gap-2">
            <p className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
              <AlertCircle size={12} /> Esta acción revierte el saldo/asiento
              contable de este comprobante. Ingresá un motivo obligatorio.
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={motivoAnular}
                onChange={(e) => setMotivoAnular(e.target.value)}
                placeholder="Motivo de la anulación"
                disabled={anulando}
                className="flex-1 px-3 py-1.5 text-xs font-bold border border-rose-300 rounded-md focus:outline-none focus:border-rose-500 disabled:opacity-60"
              />
              <button
                onClick={handleAnular}
                disabled={!motivoAnular.trim() || anulando}
                className="px-3 py-1.5 text-xs font-black uppercase rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {anulando ? "..." : "Confirmar anulación"}
              </button>
              <button
                onClick={() => {
                  setMostrarAnular(false);
                  setErrorAnular(null);
                }}
                disabled={anulando}
                className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50"
              >
                <X size={13} />
              </button>
            </div>
            {errorAnular && (
              <p className="text-[10px] text-rose-600 font-bold">{errorAnular}</p>
            )}
          </div>
        )}

        {/* ── EMAIL PANEL ── */}
        {stepEmail === "form" && (
          <div className="px-5 py-3 border-b border-slate-100 bg-violet-50/50 flex flex-col gap-3">
            {contactoSinEmail ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <AlertCircle size={12} /> Este contacto no tiene email.
                  Ingresa uno para guardarlo y continuar.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email del contacto"
                    value={emailNuevo}
                    onChange={(e) => setEmailNuevo(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold border border-amber-300 rounded-md focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={async () => {
                      if (!emailNuevo) return;
                      setGuardandoEmail(true);
                      try {
                        const codigoReceptor =
                          data?.receptor?.codigoReceptor ??
                          data?.codigoReceptor;
                        await ActualizarContactoApi(codigoReceptor, {
                          correoElectronico: emailNuevo,
                        });
                        setEmailInput(emailNuevo);
                        setContactoSinEmail(false);
                        setEmailNuevo("");
                      } catch {
                        setErrorEmail("No se pudo guardar el email.");
                      } finally {
                        setGuardandoEmail(false);
                      }
                    }}
                    disabled={!emailNuevo || guardandoEmail}
                    className="px-3 py-1.5 text-xs font-black uppercase rounded-md bg-amber-600 text-white disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoEmail ? "..." : "Guardar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-bold border border-violet-300 rounded-md focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleEnviarEmailDrawer}
                  disabled={!emailInput || enviandoEmail}
                  className="px-3 py-1.5 text-xs font-black uppercase rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
                >
                  {enviandoEmail ? "..." : "Enviar"}
                </button>
                <button
                  onClick={() => setStepEmail(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            )}
            {errorEmail && (
              <p className="text-[10px] text-rose-600 font-bold">
                {errorEmail}
              </p>
            )}
          </div>
        )}
        {stepEmail === "enviado" && (
          <div className="px-5 py-2 border-b border-slate-100 bg-emerald-50 flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle size={12} /> Email enviado a {emailInput}
            </p>
            <button
              onClick={() => setStepEmail(null)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-slate-50/50">
          <div className="grid grid-cols-1 gap-4">
            {/* ─── COLUMNA IZQUIERDA (7/12) ─── */}
            <div className="lg:col-span-7 space-y-4">
              {/* Receptor */}
              <div className="bg-white rounded-md border border-slate-100 p-4 shadow-sm">
                <SecTitle icon={User}>Receptor</SecTitle>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm`}
                  >
                    {(data.receptor?.razonSocial || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 uppercase leading-snug">
                      {data.receptor?.razonSocial || "Consumidor Final"}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        {data.receptor?.DocTipo === 80 ? "CUIT" : "DNI"}:{" "}
                        <span className="text-slate-900 font-mono tracking-wider font-bold">
                          {data.receptor?.DocNro || "—"}
                        </span>
                      </span>
                      {data.receptor?.condicionIva && (
                        <span className="text-xs font-semibold text-slate-600 uppercase">
                          IVA:{" "}
                          <span className="text-slate-900 font-bold">
                            {CONDICION_IVA[data.receptor.condicionIva] ||
                              data.receptor.condicionIva}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ítems */}
              <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <SecTitle icon={Tag}>Detalle de Ítems</SecTitle>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-y border-slate-100">
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 w-full">
                          Descripción
                        </th>
                        <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-center whitespace-nowrap">
                          Cant.
                        </th>
                        <th className="px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right whitespace-nowrap">
                          P. Unit.
                        </th>
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 text-right whitespace-nowrap">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.detalles || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider"
                          >
                            Sin ítems registrados
                          </td>
                        </tr>
                      ) : (
                        (data.detalles || []).map((item, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-slate-800 leading-snug">
                                {item.nombre || (
                                  <span className="text-slate-400 italic font-normal">
                                    Sin descripción
                                  </span>
                                )}
                              </p>
                              {item.tasaIva > 0 && (
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                  IVA {item.tasaIva}%
                                </p>
                              )}
                              {typeof item.nombre === "string" &&
                                item.nombre.startsWith("Pago período") &&
                                Array.isArray(data.cbtesAsoc) &&
                                data.cbtesAsoc.length > 0 && (
                                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                    Vinculado a:{" "}
                                    {data.cbtesAsoc
                                      .map((cb) => formatComprobanteAsociadoResumen(cb))
                                      .join(", ")}
                                  </p>
                                )}
                            </td>
                            <td className="px-3 py-3 text-center text-sm font-bold text-slate-900 tabular-nums font-mono">
                              {item.cantidad}
                            </td>
                            <td className="px-3 py-3 text-right text-sm font-medium text-slate-600 tabular-nums font-mono">
                              {fmt(item.precioUnitario)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-bold text-slate-950 tabular-nums font-mono">
                              {fmt(item.subtotal)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comprobantes asociados */}
              {Array.isArray(data.cbtesAsoc) && data.cbtesAsoc.length > 0 && (
                <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] p-5 shadow-sm">
                  <SecTitle icon={Building2}>Comprobantes Asociados {cargandoAsoc && <span className="text-xs text-[var(--primary)] font-bold animate-pulse">(Preparando PDFs...)</span>}</SecTitle>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">
                    Selecciona cuáles incluir en la descarga, impresión o envío:
                  </p>
                  <div className="space-y-2">
                    {data.cbtesAsoc.map((cb, i) => {
                      const tieneCodigo = !!cb.codigo;
                      const seleccionado = tieneCodigo ? !!seleccionadosAsoc[cb.codigo] : false;
                      return (
                        <div
                          key={i}
                          onClick={() => tieneCodigo && toggleAsociado(cb.codigo)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-md border gap-3 select-none transition-all ${
                            tieneCodigo ? "cursor-pointer" : ""
                          } ${
                            seleccionado
                              ? "bg-blue-50 border-blue-200"
                              : "bg-slate-50/50 border-slate-100 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {tieneCodigo && (
                            <input
                              type="checkbox"
                              checked={seleccionado}
                              onChange={() => {}}
                              className="accent-[var(--primary)] w-4 h-4 cursor-pointer shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex-1">
                            {isNaN(Number(cb.tipo))
                              ? String(cb.tipo || "").replace(/_/g, " ")
                              : getFullTitle(cb.tipo, "")}
                          </span>
                          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            {String(cb.ptoVta || 0).padStart(5, "0")}-
                            {String(cb.nro || 0).padStart(8, "0")}
                          </span>
                          {cb.total > 0 && (
                            <span className="text-sm font-bold text-blue-900 tabular-nums font-mono">
                              {fmt(cb.total)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ajustes */}
              {Array.isArray(data.ajustes) && data.ajustes.length > 0 && (
                <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] p-5 shadow-sm">
                  <SecTitle icon={ArrowRightLeft}>Ajustes Aplicados</SecTitle>
                  <div className="space-y-2">
                    {data.ajustes.map((aj, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-md bg-slate-50 border border-slate-200 gap-3"
                      >
                        <span className="text-xs font-bold text-slate-700 uppercase">
                          Tipo {aj.tipo}
                        </span>
                        <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                          {String(aj.ptoVta || 0).padStart(5, "0")}-
                          {String(aj.nro || 0).padStart(8, "0")}
                        </span>
                        <span className="text-sm font-bold text-slate-950 tabular-nums font-mono">
                          {fmt(aj.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ─── COLUMNA DERECHA (5/12) ─── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Info general */}
              <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] p-5 shadow-sm">
                <SecTitle icon={Calendar}>Información</SecTitle>
                <DataRow label="Fecha Emisión">
                  {fmtFecha(data.fechaEmision)}
                </DataRow>
                {data.fechaVto && (
                  <DataRow label="Fecha Vencimiento">
                    {fmtFecha(data.fechaVto)}
                  </DataRow>
                )}
                <DataRow label="Condición de Venta">
                  {String(data.condicionVenta || "—")
                    .replace(/_/g, " ")
                    .toUpperCase()}
                </DataRow>
                <DataRow label="Punto de Venta" mono>
                  {String(data.puntoVenta || 0).padStart(5, "0")}
                </DataRow>
              </div>

              {/* Pagos */}
              {Array.isArray(data.pagos) && data.pagos.length > 0 && (
                <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] p-5 shadow-sm">
                  <SecTitle icon={DollarSign}>Pagos Registrados</SecTitle>
                  <div className="space-y-2.5">
                    {data.pagos.map((pago, i) => {
                      const cfg = getMetodoConfig(pago.metodo);
                      const { Icon: PagoIcon } = cfg;
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-md ${cfg.bg} border ${cfg.border}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-md ${cfg.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            <PagoIcon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}
                            >
                              {cfg.label}
                            </p>
                            {pago.codigoBancoDestino && (
                              <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                                Banco: {pago.codigoBancoDestino}
                              </p>
                            )}
                            {pago.referencia && (
                              <p className="text-[11px] font-semibold text-slate-700">
                                Ref: {pago.referencia}
                              </p>
                            )}
                            {pago.fechaPago && (
                              <p className="text-[11px] font-semibold text-slate-700">
                                {fmtFecha(pago.fechaPago)}
                              </p>
                            )}
                          </div>
                          <p
                            className={`text-sm font-bold tabular-nums shrink-0 ${cfg.text}`}
                          >
                            {fmt(pago.monto)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Totales */}
              <div className="bg-white rounded-[16px] border border-[var(--color-neutral-border)] p-5 shadow-sm">
                <SecTitle icon={ShieldCheck}>Totales</SecTitle>
                <div className="space-y-0">
                  <DataRow label="Subtotal Neto">
                    <span className="tabular-nums font-mono">
                      {fmt(data.subtotal ?? itemsSubtotal)}
                    </span>
                  </DataRow>
                  {Number(data.iva) > 0 && (
                    <DataRow label="IVA">
                      <span className="tabular-nums font-mono">
                        {fmt(data.iva)}
                      </span>
                    </DataRow>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-lg font-black text-slate-900 tabular-nums font-mono">
                    {fmt(data.total)}
                  </span>
                </div>
              </div>

              {/* CAE / Fiscal */}
              {data.fiscal && data.cae && (
                <div className="bg-white rounded-[16px] border border-emerald-200/80 p-5 shadow-sm bg-emerald-50/10">
                  <SecTitle icon={ShieldCheck}>AFIP / ARCA</SecTitle>

                  <div className="space-y-0 mb-4 bg-white border border-slate-100 rounded-md p-1">
                    <div className="flex items-center justify-between py-2 px-2.5 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        CAE N°
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-900 select-all tracking-wider">
                          {data.cae}
                        </span>
                        <button
                          onClick={() => handleCopiarCae(data.cae)}
                          className="p-1 rounded-md text-slate-500 hover:text-[var(--primary)] hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                          title="Copiar CAE"
                        >
                          {caeCopiado ? (
                            <Check size={14} className="text-emerald-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 px-2.5">
                      <span className="text-xs font-semibold text-slate-600 uppercase">
                        Vto. CAE
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {fmtVtoCae(data.vtoCae)}
                      </span>
                    </div>
                  </div>

                  {data.qrCodeImage && (
                    <div className="flex flex-col items-center gap-2 pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Código QR AFIP
                      </p>
                      <img
                        src={data.qrCodeImage}
                        alt="QR AFIP"
                        className="w-32 h-32 border border-slate-200 rounded-md p-1.5 bg-white shadow-sm"
                      />
                    </div>
                  )}

                  <p className="text-[10px] text-emerald-700 text-center mt-3 font-bold uppercase tracking-wider">
                    Comprobante autorizado por AFIP
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default DetalleComprobanteDrawer;
