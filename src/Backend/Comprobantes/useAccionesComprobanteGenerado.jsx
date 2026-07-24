import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "../../Componentes/Tablas/Ventas/Comprobantes/ComprobantePDF";
import {
  obtenerComprobantePorCodigo,
  enviarComprobanteEmailApi,
} from "../Ventas/api/Comprobante/comprobante.api";
import { ObtenerContactoApi, ActualizarContactoApi } from "../Contactos/api/contactos.api";
import { useAuthStore } from "../Autenticacion/store/authenticacion.store";

// Feature 30 (comprobante-reintentar-tesoreria-contabilidad), R43: lógica de
// "Ver PDF" / "Imprimir" / "Enviar por mail" extraída TAL CUAL de
// ModalExitoComprobante.jsx (antes inline en ese componente), para que
// ModalReintentarComprobante.jsx (nuevo) pueda ofrecer las mismas 3
// acciones sobre un comprobante ya persistido sin duplicar la lógica.
// `nombreComprobante`/`numeroComprobanteFormateado` se reciben como
// parámetros (en vez de recalcularse acá) porque cada consumidor ya los
// computa localmente para su propio encabezado (formato idéntico al
// preexistente en ModalExitoComprobante.jsx), evitando una segunda fuente
// de verdad para ese formateo.
//
// Nota (deviation menor de nombre de archivo respecto a design.md/tasks.md,
// que listan `.js`): el archivo usa JSX (`<ComprobantePDF .../>` dentro de
// `pdf(...)`, igual que el código original de ModalExitoComprobante.jsx) —
// Vite/esbuild no transforma JSX dentro de archivos `.js` en este proyecto
// (`vite.config.js` no tiene override de loader), así que se necesita la
// extensión `.jsx` para que el build no falle. Mismo contenido/comportamiento,
// sin impacto en ningún R (detalle de build, no de negocio).

// Copia de adaptarParaDrawer (misma que en ListadoComprobante.jsx /
// ModalExitoComprobante.jsx antes de esta extracción).
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

export function useAccionesComprobanteGenerado({
  codigo,
  codigoReceptor,
  nombreComprobante,
  numeroComprobanteFormateado,
}) {
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

  const obtenerPdfBlob = async () => {
    const full = await obtenerComprobantePorCodigo(codigo);
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
      const contacto = await ObtenerContactoApi(Number(codigoReceptor));
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
      await ActualizarContactoApi(codigoReceptor, {
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
        nombreComprobante,
        numeroComprobante: numeroComprobanteFormateado,
      });
      setEnviado(true);
    } catch (e) {
      setError(e?.response?.data?.message || "Error al enviar el email.");
    } finally {
      setEnviando(false);
    }
  };

  return {
    step,
    setStep,
    cargando,
    emailInput,
    setEmailInput,
    contactoSinEmail,
    enviando,
    enviado,
    error,
    emailNuevo,
    setEmailNuevo,
    guardandoEmail,
    handleVerPDF,
    handleImprimir,
    handleAbrirEmail,
    handleGuardarEmailContacto,
    handleEnviarEmail,
  };
}
