import React, { useState, useEffect } from "react";
import { CerrarIcono, ConfiguracionEmpresaIcono } from "../../../assets/Icons";
import { useActualizarEmpresa } from "../../../Backend/Autenticacion/queries/Empresa/useActualizarEmpresa.mutation";
import { useAlertas } from "../../../store/useAlertas";
import ModalConfiguracionFiscal from "./ModalConfiguracionFiscal";

const ModalEditarEmpresa = ({ isOpen, onClose, empresaAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    condicionIva: "",
    razonSocial: "",
    cuit: "",
    domicilioComercial: "",
    iibb: "",
    inicioActividades: "",
    activo: true,
    conexionArca: false,
    esProduccion: false,
    usaContabilidad: false,
    configuracion: "",
  });

  const [jsonError, setJsonError] = useState(null);
  
  // States Modales Empresa
  const [modalFiscalOpen, setModalFiscalOpen] = useState(false);

  // States Logo
  const [previewUrl, setPreviewUrl] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  
  const { agregarAlerta } = useAlertas();

  const { mutateAsync: actualizarEmpresa, isPending } = useActualizarEmpresa();

  useEffect(() => {
    if (empresaAEditar) {
      // Extraemos la fecha si existe para el input tipo date
      let fechaFormateada = "";
      if (empresaAEditar.inicioActividades) {
        fechaFormateada = new Date(empresaAEditar.inicioActividades)
          .toISOString()
          .split("T")[0];
      }

      setFormData({
        nombre: empresaAEditar.nombre || "",
        descripcion: empresaAEditar.descripcion || "",
        condicionIva: empresaAEditar.condicionIva || "",
        razonSocial: empresaAEditar.razonSocial || "",
        cuit: empresaAEditar.cuit || "",
        domicilioComercial: empresaAEditar.domicilioComercial || "",
        iibb: empresaAEditar.iibb || "",
        inicioActividades: fechaFormateada,
        activo:
          empresaAEditar.activo !== undefined ? empresaAEditar.activo : true,
        conexionArca: empresaAEditar.conexionArca || false,
        esProduccion: empresaAEditar.esProduccion || false,
        usaContabilidad: empresaAEditar.usaContabilidad || false,
        configuracion: empresaAEditar.configuracion
          ? JSON.stringify(empresaAEditar.configuracion, null, 2)
          : "",
      });
      setPreviewUrl(empresaAEditar.configuracionVisual?.logoUrl || "");
      setLogoBase64("");
      setJsonError(null);
    }
  }, [empresaAEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.size > 1024 * 1024) {
      agregarAlerta({ message: "La imagen no debe superar 1MB.", type: "error" });
      return;
    }
    setPreviewUrl(URL.createObjectURL(archivo));
    const reader = new FileReader();
    reader.onload = (event) => setLogoBase64(event.target.result);
    reader.readAsDataURL(archivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJsonError(null);
    let parsedConfig = null;
    if (formData.configuracion && formData.configuracion.trim()) {
      try {
        parsedConfig = JSON.parse(formData.configuracion);
      } catch (err) {
        setJsonError("El formato JSON de la configuración no es válido. Verificá llaves, comas y comillas dobles.");
        return;
      }
    }

    try {
      const { configuracion, ...restFormData } = formData;
      const payload = {
        codigoEmpresa: empresaAEditar.codigo || empresaAEditar.codigoSecuencial,
        ...restFormData,
        configuracion: parsedConfig,
      };

      if (logoBase64) {
        payload.configuracionVisual = {
          ...(empresaAEditar.configuracionVisual || {}),
          logoUrl: logoBase64
        };
      }

      // Convertir fecha a ISO si existe, o eliminarla si está vacía
      if (payload.inicioActividades) {
        payload.inicioActividades = new Date(
          payload.inicioActividades,
        ).toISOString();
      } else {
        delete payload.inicioActividades;
      }

      await actualizarEmpresa(payload);
      onClose();
    } catch (error) {
      console.error("Error al actualizar empresa", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)] flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
              <ConfiguracionEmpresaIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Editar Organización
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Actualización de Datos Generales y Fiscales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* PANELES DE ESTADO Y CONFIGURACIÓN (TOGGLES) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:col-span-2">
              {/* ESTADO ACTIVO/INACTIVO */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/5 rounded-md border border-black/10 gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                  Estado del Sistema
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-black">
                    {formData.activo ? "Activa" : "Suspendida"}
                  </span>
                </label>
              </div>

              {/* CONEXIÓN ARCA */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/5 rounded-md border border-black/10 gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                  Integración AFIP
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="conexionArca"
                    checked={formData.conexionArca}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                  <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-black">
                    {formData.conexionArca ? "Conectado" : "Desconectado"}
                  </span>
                </label>
              </div>

              {/* ENTORNO PRODUCCIÓN */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/5 rounded-md border border-black/10 gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                  Entorno Operativo
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="esProduccion"
                    checked={formData.esProduccion}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-black">
                    {formData.esProduccion ? "Producción" : "Homologación"}
                  </span>
                </label>
              </div>

              {/* USO CONTABILIDAD */}
              <div className="flex flex-col items-center justify-center p-3 bg-black/5 rounded-md border border-black/10 gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                  Módulo Contable
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="usaContabilidad"
                    checked={formData.usaContabilidad}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-[11px] font-black uppercase tracking-widest text-black">
                    {formData.usaContabilidad ? "Activo" : "Inactivo"}
                  </span>
                </label>
              </div>
            </div>

            {/* SECCIÓN BÁSICA */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-black/10 pb-1 mb-3">
                Identidad Comercial
              </h3>
            </div>

            {/* NOMBRE DE FANTASÍA */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Nombre de Fantasía (Requerido)
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. EFA S.A."
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Descripción Adicional
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="2"
                placeholder="Notas u observaciones sobre esta empresa..."
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* SECCIÓN FISCAL */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-black/10 pb-1 mb-3">
                Información Fiscal Legal
              </h3>
            </div>

            {/* RAZÓN SOCIAL */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Razón Social
              </label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                placeholder="Nombre legal completo"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* CUIT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                CUIT
              </label>
              <input
                type="text"
                name="cuit"
                value={formData.cuit}
                onChange={handleChange}
                placeholder="Sin guiones"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* CONDICIÓN IVA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Condición frente al IVA
              </label>
              <select
                name="condicionIva"
                value={formData.condicionIva}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all appearance-none"
              >
                <option value="">Seleccionar condición...</option>
                <option value="RI">Responsable Inscripto</option>
                <option value="RM">Monotributo</option>
                <option value="EX">Exento</option>
                <option value="CF">Consumidor Final</option>
              </select>
            </div>

            {/* INGRESOS BRUTOS */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Ingresos Brutos (IIBB)
              </label>
              <input
                type="text"
                name="iibb"
                value={formData.iibb}
                onChange={handleChange}
                placeholder="N° de Ingresos Brutos"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* INICIO DE ACTIVIDADES */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Inicio de Actividades
              </label>
              <input
                type="date"
                name="inicioActividades"
                value={formData.inicioActividades}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* DOMICILIO COMERCIAL */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Domicilio Comercial
              </label>
              <input
                type="text"
                name="domicilioComercial"
                value={formData.domicilioComercial}
                onChange={handleChange}
                placeholder="Dirección fiscal completa"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* SECCIÓN FISCAL Y LOGO (MOVIDOS DE CONFIGURACIÓN) */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-black/10 pb-1 mb-3">
                Identidad Visual y Configuración AFIP
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                <div className="bg-black/5 p-4 rounded-md border border-black/10 flex flex-col justify-between items-start gap-4 shadow-sm hover:border-black/20 transition-all">
                  <div>
                    <h5 className="text-[13px] font-bold text-black! uppercase tracking-tight">
                      Configuración Fiscal y AFIP
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Suscripción certificados, ambientes, punto de venta y
                      datos maestros.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalFiscalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-black/10 hover:bg-black/5 text-[12px] font-bold text-black rounded-md uppercase tracking-wider transition-all"
                  >
                    Gestionar AFIP
                  </button>
                </div>

                <div className="bg-black/5 p-4 rounded-md border border-black/10 flex flex-col gap-4 shadow-sm hover:border-black/20 transition-all">
                  <div>
                    <h5 className="text-[13px] font-bold text-black! uppercase tracking-tight">
                      Logo Corporativo
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Se muestra en la barra lateral y en los comprobantes de venta.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md border border-black/10 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-2xl opacity-20">🖼️</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div>
                        <input type="file" id="logo-upload-empresa" accept="image/*" onChange={manejarArchivo} className="hidden" />
                        <label htmlFor="logo-upload-empresa" className="inline-block px-3 py-1.5 bg-white border border-black/10 hover:bg-black/5 text-[12px] font-bold text-black rounded-md cursor-pointer uppercase tracking-wider transition-all">
                          Subir Imagen
                        </label>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG/SVG con fondo transparente · Max 1MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            {/* SECCIÓN CONFIGURACIÓN JSON */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border-b border-black/10 pb-1 mb-3">
                Configuración Contable Avanzada (SaaS JSON)
              </h3>
            </div>

            {/* INPUT JSON CONFIGURACION */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70">
                  Parámetros JSON de Cuentas Contables
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      configuracion: JSON.stringify(
                        {
                          cuentas: {
                            deudoresFletes: "1105",
                            ingresoFletes: "4108",
                            ctaCteAlumnos: "1106",
                            ingresoCuotas: "4106"
                          }
                        },
                        null,
                        2
                      )
                    }));
                    setJsonError(null);
                  }}
                  className="text-[9px] font-black uppercase tracking-wider text-[var(--primary)] hover:underline cursor-pointer"
                >
                  Cargar plantilla por defecto
                </button>
              </div>
              <textarea
                name="configuracion"
                value={formData.configuracion}
                onChange={handleChange}
                rows="6"
                placeholder={`{\n  "cuentas": {\n    "deudoresFletes": "1105",\n    "ingresoFletes": "4108",\n    "ctaCteAlumnos": "1106",\n    "ingresoCuotas": "4106"\n  }\n}`}
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md font-mono text-[12px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all resize-y"
              />
              <span className="text-[10px] text-black/40 font-bold ml-1">
                Define las cuentas contables personalizadas que esta empresa utilizará en sus módulos de transporte y colegio.
              </span>
              {jsonError && (
                <span className="text-[11px] text-rose-600 font-bold ml-1 mt-1">
                  ⚠ {jsonError}
                </span>
              )}
            </div>
          </div>

          {/* ACCIONES DEL FORMULARIO */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/10 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-black rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>

      <ModalConfiguracionFiscal
        isOpen={modalFiscalOpen}
        onClose={() => setModalFiscalOpen(false)}
        empresaAEditar={empresaAEditar}
      />
    </div>
  );
};

export default ModalEditarEmpresa;
