import { useState } from "react";
import { createPortal } from "react-dom";
import { pdf } from "@react-pdf/renderer";
import { X, Eye, Printer, Mail, CheckCircle, AlertCircle } from "lucide-react";
import ComprobantePDF from "../../../Tablas/Ventas/Comprobantes/ComprobantePDF";
import {
  obtenerComprobantePorCodigo,
  enviarComprobanteEmailApi,
} from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import {
  ObtenerContactoApi,
  ActualizarContactoApi,
} from "../../../../Backend/Contactos/api/contactos.api";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

// Copia de adaptarParaDrawer (misma que en ListadoComprobante.jsx)
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
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
};

const adaptarParaDrawer = (full) => {
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
    vtoCae: isoToAfip(full.vtoCae),
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
    cbtesAsoc: (full.comprobantesAsociados || []).map((a) => ({
      tipo: a.codigoTipoComprobante ?? a.tipoRelacion,
      ptoVta: 0,
      nro: a.numeroComprobanteOrigen,
      total: a.importeAplicado,
    })),
  };
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const fmtNro = (pv, nro) =>
  `${String(pv || 0).padStart(5, "0")}-${String(nro || 0).padStart(8, "0")}`;

const NOMBRE_TIPO = {
  FACTURA: "Factura",
  RECIBO: "Recibo",
  ORDEN_PAGO: "Orden de Pago",
};

const ModalExitoComprobante = ({ comprobante, onClose }) => {
  const codigoReceptor = Number(comprobante?.codigoReceptor);
  const usuario = useAuthStore((s) => s.usuario);
  const [step, setStep] = useState("opciones"); // 'opciones' | 'email'
  const [cargando, setCargando] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [contactoSinEmail, setContactoSinEmail] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);
  const [emailNuevo, setEmailNuevo] = useState("");
  const [guardandoEmail, setGuardandoEmail] = useState(false);

  const nombreTipo =
    NOMBRE_TIPO[comprobante.tipoDescripcion] || comprobante.tipoDescripcion;
  const nroFmt = fmtNro(comprobante.puntoVenta, comprobante.numeroComprobante);

  const obtenerPdfBlob = async () => {
    const full = await obtenerComprobantePorCodigo(comprobante.codigo);
    const adapted = adaptarParaDrawer(full);
    return {
      blob: await pdf(
        <ComprobantePDF comprobante={adapted} usuario={usuario} />,
      ).toBlob(),
      adapted,
    };
  };

  const handleVerPDF = async () => {
    setCargando(true);
    try {
      const { blob } = await obtenerPdfBlob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleImprimir = async () => {
    setCargando(true);
    try {
      const { blob } = await obtenerPdfBlob();
      window.open(URL.createObjectURL(blob), "_blank")?.print();
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleAbrirEmail = async () => {
    setCargando(true);
    setError(null);
    try {
      const contacto = await ObtenerContactoApi(codigoReceptor);
      if (contacto?.correoElectronico) {
        setEmailInput(contacto.correoElectronico);
        setContactoSinEmail(false);
      } else {
        setContactoSinEmail(true);
        setEmailInput("");
      }
      setStep("email");
    } catch (e) {
      setError("No se pudo obtener el contacto.");
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarEmailContacto = async () => {
    if (!emailNuevo) return;
    setGuardandoEmail(true);
    try {
      await ActualizarContactoApi(comprobante.codigoReceptor, {
        correoElectronico: emailNuevo,
      });
      setEmailInput(emailNuevo);
      setContactoSinEmail(false);
      setEmailNuevo("");
    } catch (e) {
      setError("No se pudo guardar el email en el contacto.");
    } finally {
      setGuardandoEmail(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!emailInput) return;
    setEnviando(true);
    setError(null);
    try {
      const { blob } = await obtenerPdfBlob();
      const pdfBase64 = await blobToBase64(blob);
      await enviarComprobanteEmailApi({
        emailDestino: emailInput,
        pdfBase64,
        nombreComprobante: nombreTipo,
        numeroComprobante: nroFmt,
      });
      setEnviado(true);
    } catch (e) {
      setError(e?.response?.data?.message || "Error al enviar el email.");
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-md shadow-2xl border border-gray-100 w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {nombreTipo} generado
              </p>
              <p className="text-[11px] font-bold text-gray-500 font-mono">
                {nroFmt}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === "opciones" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleVerPDF}
                disabled={cargando}
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 text-sm font-bold text-gray-800 transition cursor-pointer disabled:opacity-50"
              >
                <Eye size={16} className="text-[var(--primary)] shrink-0" />
                Ver PDF
              </button>
              <button
                onClick={handleImprimir}
                disabled={cargando}
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-sm font-bold text-gray-800 transition cursor-pointer disabled:opacity-50"
              >
                <Printer size={16} className="text-gray-600 shrink-0" />
                Imprimir
              </button>
              <TieneAccion accion="ENVIAR_EMAIL">
                <button
                  onClick={handleAbrirEmail}
                  disabled={cargando}
                  className="flex items-center gap-3 px-4 py-3 rounded-md border border-violet-200 hover:border-violet-400 hover:bg-violet-50 text-sm font-bold text-violet-800 transition cursor-pointer disabled:opacity-50"
                >
                  <Mail size={16} className="text-violet-600 shrink-0" />
                  Enviar por mail
                </button>
              </TieneAccion>
              {cargando && (
                <p className="text-[11px] text-center text-gray-400 font-semibold">
                  Generando PDF...
                </p>
              )}
              {error && (
                <p className="text-[11px] text-rose-600 font-bold">{error}</p>
              )}
            </div>
          )}

          {step === "email" && !enviado && (
            <div className="flex flex-col gap-4">
              {contactoSinEmail ? (
                <div className="flex flex-col gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      size={14}
                      className="text-amber-600 shrink-0"
                    />
                    <p className="text-[12px] font-bold text-amber-800">
                      Este contacto no tiene email registrado.
                    </p>
                  </div>
                  <p className="text-[11px] text-amber-700 font-semibold">
                    Pods guardarlo ahora y quedar en el contacto para proximos
                    envios.
                  </p>
                  <input
                    type="email"
                    placeholder="Ingresa el email del contacto"
                    value={emailNuevo}
                    onChange={(e) => setEmailNuevo(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-amber-300 text-sm font-bold text-gray-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleGuardarEmailContacto}
                    disabled={!emailNuevo || guardandoEmail}
                    className="px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoEmail ? "Guardando..." : "Guardar y continuar"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                    Email destino
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md border border-gray-300 text-sm font-bold text-gray-900 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              )}

              {error && (
                <p className="text-[11px] text-rose-600 font-bold">{error}</p>
              )}

              {!contactoSinEmail && (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setStep("opciones")}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleEnviarEmail}
                    disabled={!emailInput || enviando}
                    className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md bg-violet-600 text-white hover:bg-violet-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {enviando ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "email" && enviado && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle size={36} className="text-emerald-500" />
              <p className="text-sm font-black text-gray-900">
                Email enviado correctamente
              </p>
              <p className="text-[11px] text-gray-500">
                a <span className="font-bold">{emailInput}</span>
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalExitoComprobante;
