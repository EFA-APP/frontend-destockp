import { createPortal } from "react-dom";
import { X, Eye, Printer, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useAccionesComprobanteGenerado } from "../../../../Backend/Comprobantes/useAccionesComprobanteGenerado";

const fmtNro = (pv, nro) =>
  `${String(pv || 0).padStart(5, "0")}-${String(nro || 0).padStart(8, "0")}`;

const NOMBRE_TIPO = {
  FACTURA: "Factura",
  RECIBO: "Recibo",
  ORDEN_PAGO: "Orden de Pago",
};

const ModalExitoComprobante = ({ comprobante, onClose }) => {
  const codigoReceptor = Number(comprobante?.codigoReceptor);

  const nombreTipo =
    NOMBRE_TIPO[comprobante.tipoDescripcion] || comprobante.tipoDescripcion;
  const nroFmt = fmtNro(comprobante.puntoVenta, comprobante.numeroComprobante);

  // Feature 30 (comprobante-reintentar-tesoreria-contabilidad), R43: la
  // lógica de Ver PDF/Imprimir/Enviar por mail (antes inline acá) vive
  // ahora en un hook reutilizable, también consumido por
  // ModalReintentarComprobante.jsx. Comportamiento observable sin cambios.
  const {
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
  } = useAccionesComprobanteGenerado({
    codigo: comprobante.codigo,
    codigoReceptor,
    nombreComprobante: nombreTipo,
    numeroComprobanteFormateado: nroFmt,
  });

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
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
              <button
                onClick={handleAbrirEmail}
                disabled={cargando}
                className="flex items-center gap-3 px-4 py-3 rounded-md border border-violet-200 hover:border-violet-400 hover:bg-violet-50 text-sm font-bold text-violet-800 transition cursor-pointer disabled:opacity-50"
              >
                <Mail size={16} className="text-violet-600 shrink-0" />
                Enviar por mail
              </button>
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
