import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { HospitalIcono } from "../../../../assets/Icons";
import { ArrowLeft } from "lucide-react";
import PasoSeleccionObraSocial from "./PasoSeleccionObraSocial";
import PasoCargaArchivo from "./PasoCargaArchivo";
import PasoPrevisualizacion from "./PasoPrevisualizacion";
import ModalConfirmarImportacion from "./ModalConfirmarImportacion";
import {
  previsualizarImportacionObraSocialApi,
  confirmarImportacionObraSocialApi,
} from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";

const ImportacionObrasSociales = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pasoActual, setPasoActual] = useState(1);
  const [obraSocial, setObraSocial] = useState(null);
  const [unidadNegocio, setUnidadNegocio] = useState("");
  // R24: resuelto en PasoSeleccionObraSocial a partir de la Unidad de
  // Negocio elegida (mismo mecanismo que useCabeceraComprobante.js), no un
  // selector de PDV directo.
  const [puntoVenta, setPuntoVenta] = useState("");
  const [periodo, setPeriodo] = useState("");

  const [archivoLeido, setArchivoLeido] = useState(null);
  const [datosProcesados, setDatosProcesados] = useState(null);

  const [verModalConfirmacion, setVerModalConfirmacion] = useState(false);
  const [filasAImportar, setFilasAImportar] = useState([]);

  const handleArchivoLeido = async (archivoBase64) => {
    try {
      const payload = {
        codigoObraSocial: obraSocial.codigo,
        periodo: periodo,
        archivoBase64: archivoBase64.base64,
      };

      const data = await previsualizarImportacionObraSocialApi(payload);

      setDatosProcesados({
        archivoNombre: archivoBase64.rawFile.name,
        archivoBase64: archivoBase64.base64,
        filas: data.registros,
        totales: data.totales,
        // Mejora obra-sociales-margen-editable: margen/redondeo real que se
        // usó para calcular esta previsualización, usado en el Paso 3 para
        // precargar el input editable de margen (recálculo client-side).
        margenGanancia: data.margenGanancia,
        redondeoEntero: data.redondeoEntero,
      });

      setPasoActual(3); // Previsualización (ya no hay mapeo)
    } catch (error) {
      console.error(error);
      alert(
        "Error al previsualizar: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const abrirModalImportacion = (filasConDecision) => {
    setFilasAImportar(filasConDecision);
    setVerModalConfirmacion(true);
  };

  const handleConfirmarBackend = async (payloadModal) => {
    try {
      const payload = {
        codigoUnidadNegocio: Number(unidadNegocio),
        // Bug 2 (progress/impl_obra-sociales-importaciones.md): puntoVenta
        // (real, resuelto en el paso 1 desde la Unidad de Negocio) y
        // codigoTipoComprobante (elegido en el modal) son campos separados
        // — antes se pisaban entre sí.
        puntoVenta: Number(puntoVenta),
        codigoTipoComprobante: payloadModal.codigoTipoComprobante,
        periodo: periodo,
        nombreArchivo: datosProcesados.archivoNombre,
        archivoBase64: datosProcesados.archivoBase64,
        // Feature 27 (obra-sociales-facturacion-por-paciente): cada fila
        // viaja con codigoContactoPaciente (si matcheó un Contacto por
        // documento en la previsualización) y crearComoClie (decisión del
        // usuario para las filas sin match, ya resuelta en
        // PasoPrevisualizacion.jsx) — el backend resuelve el receptor de
        // cada Factura POR FILA con estos 2 campos (R13-R17).
        registros: filasAImportar.map((f) => ({
          ...f,
          codigoContactoPaciente: f.contactoEncontrado?.codigo,
        })),
      };

      const response = await confirmarImportacionObraSocialApi(payload);

      // Bugfix (progress/impl_fix-cache-importaciones-comprobantes.md):
      // sin esto, react-query servía el listado de comprobantes cacheado
      // (staleTime 5min) y los recién importados no aparecían hasta un F5.
      queryClient.invalidateQueries({ queryKey: ["comprobantes"] });

      setVerModalConfirmacion(false);
      alert(response?.mensaje || "¡Importación exitosa!");

      // Reset
      setPasoActual(1);
      setObraSocial(null);
      setDatosProcesados(null);
    } catch (error) {
      console.error(error);
      alert(
        "Error al importar: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const pasos = [
    {
      numero: 1,
      titulo: "Entidad",
      descripcion: "Obra Social y Configuración",
    },
    { numero: 2, titulo: "Archivo", descripcion: "Carga de liquidación" },
    {
      numero: 3,
      titulo: "Revisión",
      descripcion: "Previsualización y validación",
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Obras Sociales</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Importaciones</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <HospitalIcono color="var(--primary)" size={28} strokeWidth={2.5} />
            Importar Obras Sociales
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Procesa archivos Excel de liquidaciones y genera facturas masivas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/panel/obra-sociales")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Volver
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Paso 1: Configuración */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#1FAE6D] border border-emerald-200/60 flex items-center justify-center font-black text-xs">
              1
            </div>
            <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
              Configuración de Importación
            </h3>
          </div>
          <PasoSeleccionObraSocial
            obraSocial={obraSocial}
            setObraSocial={setObraSocial}
            unidadNegocio={unidadNegocio}
            setUnidadNegocio={setUnidadNegocio}
            puntoVenta={puntoVenta}
            setPuntoVenta={setPuntoVenta}
            periodo={periodo}
            setPeriodo={setPeriodo}
            isIntegrated={true}
          />
        </div>

        {/* Paso 2: Cargar Archivo */}
        {!datosProcesados && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#1FAE6D] border border-emerald-200/60 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
                Cargar Archivo Excel
              </h3>
            </div>
            <PasoCargaArchivo
              obraSocial={obraSocial}
              onArchivoLeido={handleArchivoLeido}
              isIntegrated={true}
              disabled={
                !obraSocial ||
                !unidadNegocio ||
                !periodo ||
                (unidadNegocio && !puntoVenta)
              }
            />
          </div>
        )}

        {/* Paso 3: Previsualización */}
        {datosProcesados && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-emerald-50 text-[#1FAE6D] border border-emerald-200/60 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  Resultados de Previsualización
                </h3>
              </div>
              <button
                onClick={() => setDatosProcesados(null)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Limpiar Resultados (Subir otro)
              </button>
            </div>
            <PasoPrevisualizacion
              datosProcesados={datosProcesados}
              onImportar={(filasConDecision) =>
                abrirModalImportacion(filasConDecision)
              }
              isIntegrated={true}
            />
          </div>
        )}
      </div>

      {verModalConfirmacion && (
        <ModalConfirmarImportacion
          filasAImportar={filasAImportar}
          obraSocial={obraSocial}
          onClose={() => setVerModalConfirmacion(false)}
          onConfirmar={handleConfirmarBackend}
        />
      )}
    </div>
  );
};

export default ImportacionObrasSociales;
