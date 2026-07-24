import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Eye,
  Printer,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { useAccionesComprobanteGenerado } from "../../../../Backend/Comprobantes/useAccionesComprobanteGenerado";
import { useReintentarPasoComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useReintentarPasoComprobante.mutation";

const fmtNro = (pv, nro) =>
  `${String(pv || 0).padStart(5, "0")}-${String(nro || 0).padStart(8, "0")}`;

const NOMBRE_TIPO = {
  FACTURA: "Factura",
  RECIBO: "Recibo",
  ORDEN_PAGO: "Orden de Pago",
};

const MENSAJE_PASO = {
  TESORERIA: "No se generó el movimiento de tesorería.",
  CONTABILIDAD: "No se generó la imputación contable.",
};

// Feature 30 (comprobante-reintentar-tesoreria-contabilidad): modal
// reutilizable, combina el aviso de "falló tesorería/contabilidad" +
// botón "Reintentar" (R33-R38) CON las mismas acciones de un comprobante ya
// generado (Ver PDF/Imprimir/Enviar por mail, R43-R45) — reabrible en
// cualquier momento (desde las 4 pantallas de creación o desde el badge del
// listado general, R32-R42), sin límite de reintentos.
const ModalReintentarComprobante = ({
  codigo,
  numeroComprobante,
  puntoVenta,
  tipoDescripcionComprobante,
  codigoReceptor,
  pasoFallido,
  onClose,
}) => {
  const [pasoPendiente, setPasoPendiente] = useState(pasoFallido ?? null);

  const nombreTipo =
    NOMBRE_TIPO[tipoDescripcionComprobante] || tipoDescripcionComprobante;
  const nroFmt = fmtNro(puntoVenta, numeroComprobante);

  const {
    step,
    setStep,
    cargando,
    emailInput,
    setEmailInput,
    contactoSinEmail,
    enviando,
    enviado,
    error: errorAcciones,
    emailNuevo,
    setEmailNuevo,
    guardandoEmail,
    handleVerPDF,
    handleImprimir,
    handleAbrirEmail,
    handleGuardarEmailContacto,
    handleEnviarEmail,
  } = useAccionesComprobanteGenerado({
    codigo,
    codigoReceptor,
    nombreComprobante: nombreTipo,
    numeroComprobanteFormateado: nroFmt,
  });

  const { mutate: reintentarPaso, isPending: reintentando } =
    useReintentarPasoComprobante();

  const [errorReintento, setErrorReintento] = useState(null);

  const handleReintentar = () => {
    if (!pasoPendiente) return;
    setErrorReintento(null);
    reintentarPaso(
      { codigo, paso: pasoPendiente },
      {
        // R36: cualquier resolución exitosa de la mutation (sin error)
        // implica que el/los paso(s) pendiente(s) YA quedaron procesados —
        // si algún paso encadenado (ver R26/R27) hubiera fallado, la
        // mutation habría rechazado en vez de resolver.
        onSuccess: () => {
          setPasoPendiente(null);
        },
        // R37: el reintento volvió a fallar (mismo paso u otro distinto,
        // ver R26) — se actualiza pasoPendiente según el nuevo `code`
        // recibido y se deja el botón "Reintentar" disponible de nuevo
        // (R38, sin límite de intentos).
        onError: (error) => {
          const data = error?.response?.data;
          if (data?.code === "MOVIMIENTO_FINANCIERO_FALLIDO") {
            setPasoPendiente("TESORERIA");
          } else if (data?.code === "ASIENTO_CONTABLE_FALLIDO") {
            setPasoPendiente("CONTABILIDAD");
          }
          setErrorReintento(
            data?.message || "No se pudo completar el reintento.",
          );
        },
      },
    );
  };

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
          {/* R39: "Cerrar" solo oculta el modal, sin request adicional ni
              alterar el estado persistido del comprobante. */}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Banner de aviso + Reintentar — solo si queda un paso pendiente. */}
          {pasoPendiente && (
            <div className="flex flex-col gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <p className="text-[12px] font-bold text-amber-800">
                  {MENSAJE_PASO[pasoPendiente]}
                </p>
              </div>
              <p className="text-[11px] text-amber-700 font-semibold">
                El comprobante ya se generó correctamente ({nroFmt}); solo
                falta completar este paso. Puedes reintentarlo cuando
                quieras.
              </p>
              {errorReintento && (
                <p className="text-[11px] text-rose-600 font-bold">
                  {errorReintento}
                </p>
              )}
              <button
                onClick={handleReintentar}
                disabled={reintentando}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  size={13}
                  className={reintentando ? "animate-spin" : ""}
                />
                {reintentando ? "Reintentando..." : "Reintentar"}
              </button>
            </div>
          )}

          {!pasoPendiente && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md">
              <CheckCircle size={14} className="text-emerald-600 shrink-0" />
              <p className="text-[12px] font-bold text-emerald-800">
                Comprobante completamente procesado.
              </p>
            </div>
          )}

          {/* Ver/Imprimir/Enviar — SIEMPRE visibles (R44/R45), sin importar
              si el paso pendiente ya fue resuelto o sigue fallando. */}
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
              {errorAcciones && (
                <p className="text-[11px] text-rose-600 font-bold">
                  {errorAcciones}
                </p>
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

              {errorAcciones && (
                <p className="text-[11px] text-rose-600 font-bold">
                  {errorAcciones}
                </p>
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
                onClick={() => setStep("opciones")}
                className="mt-2 px-6 py-2 rounded-md bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition cursor-pointer"
              >
                Volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalReintentarComprobante;
