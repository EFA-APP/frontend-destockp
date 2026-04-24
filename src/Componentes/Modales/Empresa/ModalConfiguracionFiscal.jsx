import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../store/useAlertas";
import {
  actualizarDatosFiscalesApi,
  actualizarEstadoProduccionApi,
  guardarConfiguracionArcaApi,
} from "../../../Backend/Autenticacion/api/Empresa/empresa.api";
import InputReutilizable from "../../UI/InputReutilizable/InputReutilizable";

const ModalConfiguracionFiscal = ({ isOpen, onClose }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);
  const { agregarAlerta } = useAlertas();

  // Datos Fiscales Maestros
  const [datosFiscales, setDatosFiscales] = useState({
    razonSocial: usuario?.datosFiscales?.razonSocial || "",
    cuit: usuario?.datosFiscales?.cuit || "",
    condicionIva: usuario?.datosFiscales?.condicionIva || "RI",
    domicilioComercial: usuario?.datosFiscales?.domicilioComercial || "",
    iibb: usuario?.datosFiscales?.iibb || "",
    inicioActividades: usuario?.datosFiscales?.inicioActividades
      ? usuario.datosFiscales.inicioActividades.split("T")[0]
      : "",
    esProduccion: usuario?.datosFiscales?.esProduccion || false,
  });

  // Configuración ARCA (AFIP)
  const [configArca, setConfigArca] = useState({
    puntoVenta: usuario?.conexionArca?.puntoVenta || 1,
    esProduccion: usuario?.datosFiscales?.esProduccion || false,
  });

  // Archivos Certificados
  const [archivos, setArchivos] = useState({
    certHomo: null,
    keyHomo: null,
    certProd: null,
    keyProd: null,
  });

  const [cargando, setCargando] = useState(false);
  const [tab, setTab] = useState("fiscal"); // "fiscal" | "arca"

  if (!isOpen) return null;

  const handleChangeFiscal = (e) => {
    const { name, value } = e.target;
    setDatosFiscales((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setArchivos((prev) => ({ ...prev, [tipo]: content }));
    };
    reader.readAsText(file);
  };

  const manejarGuardar = async () => {
    try {
      setCargando(true);

      // 1. Guardar Datos Fiscales Maestros
      await actualizarDatosFiscalesApi({
        codigoEmpresa: usuario.codigoEmpresa,
        ...datosFiscales,
        inicioActividades: datosFiscales.inicioActividades
          ? new Date(datosFiscales.inicioActividades)
          : null,
      });

      // 2. Guardar Estado de Producción (Switch)
      if (configArca.esProduccion !== usuario.datosFiscales.esProduccion) {
        await actualizarEstadoProduccionApi({
          codigoEmpresa: usuario.codigoEmpresa,
          esProduccion: configArca.esProduccion,
        });
      }

      // 3. Guardar Configuración de ARCA (Certificados y Punto Venta)
      // Solo enviamos certificados si fueron seleccionados
      const payloadArca = {
        codigoEmpresa: usuario.codigoEmpresa,
        cuit: datosFiscales.cuit,
        puntoVenta: Number(configArca.puntoVenta),
        esProduccion: configArca.esProduccion,
      };

      // Si cargó archivos de Homo
      if (archivos.certHomo && archivos.keyHomo) {
        await guardarConfiguracionArcaApi({
          ...payloadArca,
          certificado: archivos.certHomo,
          clavePrivada: archivos.keyHomo,
          esProduccion: false, // Estamos guardando los de homo
        });
      }

      // Si cargó archivos de Prod
      if (archivos.certProd && archivos.keyProd) {
        await guardarConfiguracionArcaApi({
          ...payloadArca,
          certificado: archivos.certProd,
          clavePrivada: archivos.keyProd,
          esProduccion: true, // Estamos guardando los de prod
        });
      }

      // Si no cargó archivos pero cambió el punto de venta, igual actualizamos Arca
      if (!archivos.certHomo && !archivos.certProd) {
        await guardarConfiguracionArcaApi(payloadArca);
      }

      // Actualizar Store Local
      setUsuario({
        ...usuario,
        datosFiscales: {
          ...datosFiscales,
          esProduccion: configArca.esProduccion,
        },
        conexionArca: {
          ...usuario.conexionArca,
          puntoVenta: configArca.puntoVenta,
          activo: true, // Aseguramos que se marque como activo si se guardó certs
        },
      });

      agregarAlerta({
        message: "Configuración fiscal actualizada correctamente.",
        type: "success",
      });
      onClose();
    } catch (error) {
      console.error(error);
      agregarAlerta({
        message:
          error.message || "Error al actualizar la configuración fiscal.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md   "
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden   ">
        <div className="px-8 py-6 border-b border-[var(--border-subtle)] bg-[var(--primary-subtle)]/10 flex justify-between items-center">
          <div>
            <h2 className="text-[17px] font-bold text-black uppercase tracking-wider mb-1">
              🛠️ Configuración Fiscal y AFIP
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] font-medium">
              Gestión de identidad fiscal, entorno y credenciales de
              facturación.
            </p>
          </div>

          <div className="flex bg-[var(--surface-hover)] p-1.5 rounded-md border border-[var(--border-subtle)] shadow-inner">
            <button
              onClick={() => setTab("fiscal")}
              className={`px-4 py-2 text-[13px] font-bold rounded-md   ${tab === "fiscal" ? "bg-[var(--primary)] text-black shadow-md" : "text-[var(--text-muted)] hover:text-black"}`}
            >
              DATOS FISCALES
            </button>
            <button
              onClick={() => setTab("arca")}
              className={`px-4 py-2 text-[13px] font-bold rounded-md   ${tab === "arca" ? "bg-[var(--primary)] text-black shadow-md" : "text-[var(--text-muted)] hover:text-black"}`}
            >
              ENTORNO AFIP
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 h-[500px] overflow-y-auto scrollbar-thin">
          {tab === "fiscal" && (
            <div className="space-y-6   ">
              <div className="grid grid-cols-2 gap-6">
                <InputReutilizable
                  label="Razón Social"
                  name="razonSocial"
                  valor={datosFiscales.razonSocial}
                  onChange={handleChangeFiscal}
                  placeholder="Ej: Mi Empresa S.A."
                />
                <InputReutilizable
                  label="CUIT"
                  name="cuit"
                  valor={datosFiscales.cuit}
                  onChange={handleChangeFiscal}
                  placeholder="00-00000000-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest pl-0.5">
                    Condición IVA
                  </label>
                  <select
                    name="condicionIva"
                    value={datosFiscales.condicionIva}
                    onChange={handleChangeFiscal}
                    className="flex h-10 w-full rounded-md px-4 text-[15px] bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-black focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]  outline-none"
                  >
                    <option value="RI">Responsable Inscripto</option>
                    <option value="RM">Responsable Monotributo</option>
                    <option value="EX">Iva Sujeto Exento</option>
                    <option value="CF">Consumidor Final</option>
                  </select>
                </div>
                <InputReutilizable
                  label="Ingresos Brutos (IIBB)"
                  name="iibb"
                  valor={datosFiscales.iibb}
                  onChange={handleChangeFiscal}
                  placeholder="Exento / Nro IIBB"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <InputReutilizable
                  label="Inicio de Actividades"
                  name="inicioActividades"
                  tipo="date"
                  valor={datosFiscales.inicioActividades}
                  onChange={handleChangeFiscal}
                />
                <InputReutilizable
                  label="Domicilio Comercial"
                  name="domicilioComercial"
                  valor={datosFiscales.domicilioComercial}
                  onChange={handleChangeFiscal}
                  placeholder="Ej: Av. Siempreviva 123"
                />
              </div>
            </div>
          )}

          {tab === "arca" && (
            <div className="space-y-8   ">
              {/* Switch Entorno */}
              <div className="bg-[var(--surface-hover)]/50 border-2 border-[var(--border-subtle)] p-6 rounded-md flex items-center justify-between shadow-xl">
                <div>
                  <h4 className="text-[15px] font-bold text-black uppercase tracking-tight mb-1">
                    Entorno de Operación
                  </h4>
                  <p className="text-[13px] text-[var(--text-muted)] font-medium">
                    Determina si los comprobantes tienen validez fiscal ante
                    AFIP.
                  </p>
                </div>
                <div
                  onClick={() => {
                    const nuevoEstado = !configArca.esProduccion;
                    setConfigArca((prev) => ({
                      ...prev,
                      esProduccion: nuevoEstado,
                    }));
                    setDatosFiscales((prev) => ({
                      ...prev,
                      esProduccion: nuevoEstado,
                    }));
                  }}
                  className={`relative w-16 h-8 rounded-md p-1 cursor-pointer   flex items-center ${configArca.esProduccion ? "bg-emerald-600 shadow-lg shadow-emerald-700/20" : "bg-[var(--primary)] shadow-lg shadow-[var(--primary)]/20"}`}
                >
                  <div
                    className={`w-6 h-6 bg-[var(--surface)] rounded-md shadow-md transform   ${configArca.esProduccion ? "translate-x-8" : "translate-x-0"}`}
                  />
                  <span
                    className={`absolute ${configArca.esProduccion ? "-ml-10" : "ml-10"} text-[12px] font-black text-black uppercase tracking-tighter`}
                  >
                    {configArca.esProduccion ? "PROD" : "HOMO"}
                  </span>
                </div>
              </div>

              <div className="w-1/2">
                <InputReutilizable
                  label="Punto de Venta"
                  tipo="number"
                  valor={configArca.puntoVenta}
                  onChange={(e) =>
                    setConfigArca((prev) => ({
                      ...prev,
                      puntoVenta: e.target.value,
                    }))
                  }
                />
              </div>

              {/* GESTION DE CERTIFICADOS */}
              <div className="grid grid-cols-2 gap-8">
                {/* HOMOLOGACION */}
                <div className="space-y-4 p-5 border border-[var(--border-subtle)] rounded-md bg-[var(--primary)]/5">
                  <h5 className="text-[13px] font-black text-[var(--primary)] uppercase tracking-[0.2em] border-b border-[var(--primary)]/20 pb-2 mb-4">
                    HOMOLOGACIÓN
                  </h5>

                  <div className="space-y-2">
                    <label className="text-[12px] text-[var(--text-muted)] uppercase font-black tracking-wider">
                      Certificado (.crt)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "certHomo")}
                      className="block w-full text-[12px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-black file:bg-[var(--primary)]/20 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/30 cursor-pointer "
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-[var(--text-muted)] uppercase font-black tracking-wider">
                      Clave Privada (.key)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "keyHomo")}
                      className="block w-full text-[12px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-black file:bg-[var(--primary)]/20 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/30 cursor-pointer "
                    />
                  </div>
                </div>

                {/* PRODUCCION */}
                <div className="space-y-4 p-5 border border-[var(--border-subtle)] rounded-md bg-emerald-700/5">
                  <h5 className="text-[13px] font-black text-emerald-700 uppercase tracking-[0.2em] border-b border-emerald-700/20 pb-2 mb-4">
                    PRODUCCIÓN
                  </h5>

                  <div className="space-y-2">
                    <label className="text-[12px] text-[var(--text-muted)] uppercase font-black tracking-wider">
                      Certificado (.crt)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "certProd")}
                      className="block w-full text-[12px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-black file:bg-emerald-700/20 file:text-emerald-700 hover:file:bg-emerald-700/30 cursor-pointer "
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] text-[var(--text-muted)] uppercase font-black tracking-wider">
                      Clave Privada (.key)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, "keyProd")}
                      className="block w-full text-[12px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[12px] file:font-black file:bg-emerald-700/20 file:text-emerald-700 hover:file:bg-emerald-700/30 cursor-pointer "
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[var(--surface-hover)] p-4 rounded-md border-l-4 border-emerald-700 shadow-md">
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed font-medium">
                  <strong className="text-emerald-700 uppercase">
                    Aviso de Producción:
                  </strong>{" "}
                  Para operar en entorno fiscal real, debés delegar el servicio{" "}
                  <span className="text-black">"Facturación Electrónica"</span>{" "}
                  en el portal de AFIP utilizando el certificado cargado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[var(--surface-hover)]/80 border-t border-[var(--border-subtle)] flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            disabled={cargando}
            className="px-6 py-2.5 border border-[var(--border-subtle)] hover:bg-[var(--surface-active)] text-[13px] font-bold text-[var(--text-secondary)] rounded-md  uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            onClick={manejarGuardar}
            disabled={cargando}
            className="px-8 py-2.5 bg-[var(--surface)] text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-[13px] font-black rounded-md shadow-xl  flex items-center gap-3 uppercase tracking-widest"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full " />
                Sincronizando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfiguracionFiscal;
