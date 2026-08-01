import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  BorrarIcono,
  CerrarIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { Search } from "lucide-react";
import { useAlertas } from "../../../../store/useAlertas";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

const FormularioContacto = ({
  entidad: entidadProp,
  contacto,
  onClose,
  onExito,
  posicion = "derecha",
  datosIniciales = {},
  inline = false,
}) => {
  const { entidades, cargandoEntidades } = useEntidades();
  const { configs, cargandoConfigs } = useConfiguracionContactos();
  const { crearContacto, actualizarContacto } = useContactos();
  const { tieneAccion } = usePermisosDeUsuario();
  const { agregarAlerta } = useAlertas();

  const [form, setForm] = useState({
    tipoEntidad: entidadProp?.clave || contacto?.tipoEntidad || "",
    nombre: contacto?.nombre || "",
    apellido: contacto?.apellido || "",
    razonSocial: datosIniciales.razonSocial ?? contacto?.razonSocial ?? "",
    documento: datosIniciales.documento ?? contacto?.documento ?? "",
    correoElectronico: contacto?.correoElectronico || "",
    tipoDocumento: contacto?.tipoDocumento === 99 ? "" : (contacto?.tipoDocumento || ""),
    condicionIva: contacto?.condicionIva || "CF",
    atributos: contacto?.atributos || {},
    // Feature 33 (contactos-relaciones-ui, R45): se deja de emitir
    // `relaciones` desde este formulario (sección "4. Vínculos/Relaciones"
    // retirada, ver más abajo). El mecanismo backend (`Contacto.relaciones`,
    // `_sincronizarEspejos`) sigue intacto para cualquier otro emisor.
    enteFacturacion: contacto?.enteFacturacion || null,
  });

  const [emailError, setEmailError] = useState("");

  const validarEmail = (email) => {
    if (!email) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) ? "" : "Formato de correo electrónico inválido";
  };

  const entidadActual = entidades.find((e) => e.clave === form.tipoEntidad);
  const configsEntidad = configs.filter(
    (c) => c.entidadClave === form.tipoEntidad,
  );

  const advertenciaDocumento = (() => {
    const tipoDoc = Number(form.tipoDocumento);
    const doc = (form.documento || "").trim();
    if (!doc) return "";
    const soloDigitos = /^\d+$/.test(doc);
    if (tipoDoc === 80 && (!soloDigitos || doc.length !== 11)) {
      return "El CUIT ingresado no tiene 11 dígitos numéricos. Verifique el dato antes de guardar (AFIP puede rechazar comprobantes con un CUIT inválido).";
    }
    if (tipoDoc === 96 && (!soloDigitos || doc.length < 7 || doc.length > 8)) {
      return "El DNI ingresado no tiene entre 7 y 8 dígitos numéricos. Verifique el dato antes de guardar.";
    }
    return "";
  })();

  const [busquedaEnte, setBusquedaEnte] = useState({
    entidad: "",
    codigo: "",
    query: "",
    mostrarDropdown: false,
  });

  const [debouncedQueryEnte, setDebouncedQueryEnte] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQueryEnte(busquedaEnte.query);
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaEnte.query]);

  const { contactos: listaEntes, cargandoContactos: cargandoEntes } =
    useContactos({
      tipoEntidad: busquedaEnte.entidad,
      busqueda: debouncedQueryEnte,
    });

  const [highlightedIndexEnte, setHighlightedIndexEnte] = useState(-1);

  const enteActualNombre = Array.isArray(listaEntes)
    ? listaEntes.find(
        (c) => c.codigo === form.enteFacturacion?.codigo,
      )?.razonSocial || "---"
    : "---";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tipoEntidad) {
      agregarAlerta({
        title: "Categoría Requerida",
        message:
          "Debe seleccionar una categoría (Alumno, Proveedor, etc.) antes de registrar el contacto.",
        type: "warning",
      });
      return;
    }

    const tieneIdentidad =
      form.nombre.trim() || form.apellido.trim() || form.razonSocial.trim();
    if (!tieneIdentidad) {
      agregarAlerta({
        title: "Datos Insuficientes",
        message:
          "Debe completar al menos un campo de identificación (Nombre, Apellido o Razón Social).",
        type: "warning",
      });
      return;
    }

    if (form.correoElectronico) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correoElectronico.trim())) {
        agregarAlerta({
          title: "Correo Inválido",
          message: "El correo electrónico ingresado no tiene un formato válido.",
          type: "warning",
        });
        return;
      }
    }

    const payload = {
      ...form,
      tipoDocumento: form.tipoDocumento ? Number(form.tipoDocumento) : 99,
    };

    try {
      if (contacto) {
        await actualizarContacto({ id: contacto.codigo, dto: payload });
        onClose();
      } else {
        const nuevo = await crearContacto(payload);
        if (onExito) onExito(nuevo);
        onClose();
      }
    } catch (err) {
      console.error("Error al guardar contacto:", err);
    }
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAtributoChange = (clave, valor) => {
    setForm((prev) => ({
      ...prev,
      atributos: { ...prev.atributos, [clave]: valor },
    }));
  };

  const contenido = (
    <>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <CuentaIcono size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none mb-1">
                {contacto ? "EDITAR" : "NUEVO"}{" "}
                {entidadActual?.nombre || "CONTACTO"}
              </h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {contacto
                  ? `ID: ${contacto.codigo.toString().padStart(4, "0")}`
                  : "REGISTRO DE FICHA"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-all group cursor-pointer"
          >
            <CerrarIcono size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {cargandoEntidades || cargandoConfigs ? (
          <div className="flex-1 p-6 space-y-8 overflow-hidden animate-pulse">
            <div className="space-y-3">
              <div className="h-2 w-24 bg-gray-100 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-100 rounded-md" />
                <div className="h-10 bg-gray-100 rounded-md" />
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="h-px bg-gray-200" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 bg-gray-100 rounded-md" />
                <div className="h-14 bg-gray-100 rounded-md" />
              </div>
              <div className="h-12 bg-gray-100 rounded-md" />
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"
          >
            {/* 1. SELECCIÓN DE TIPO */}
            {!entidadProp && !contacto && (
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] ml-1">
                  Categoría de Contacto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {entidades.map((ent) => (
                    <button
                      key={ent.clave}
                      type="button"
                      onClick={() => handleChange("tipoEntidad", ent.clave)}
                      className={`px-3 py-2.5 rounded-md border text-[11px] font-black flex items-center gap-2.5 tracking-wider transition-all cursor-pointer ${
                        form.tipoEntidad === ent.clave
                          ? "bg-[#1FAE6D]/10 text-[#178F58] border-[#1FAE6D]/30 shadow-sm"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: ent.color || "var(--primary)",
                        }}
                      />
                      {ent.nombre.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. DATOS DE IDENTIDAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] whitespace-nowrap">
                  Ficha Personal
                </span>
                <div className="h-px w-full bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Nombres
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Razón Social / Denominación
                </label>
                <input
                  type="text"
                  placeholder="Empresa o nombre completo"
                  value={form.razonSocial}
                  onChange={(e) => handleChange("razonSocial", e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all placeholder:text-gray-400 uppercase tracking-widest shadow-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Tipo Doc.
                  </label>
                  <div className="relative">
                    <select
                      value={form.tipoDocumento}
                      onChange={(e) =>
                        handleChange("tipoDocumento", e.target.value)
                      }
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[12px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] appearance-none cursor-pointer transition-all uppercase shadow-sm"
                    >
                      <option value="">Seleccionar...</option>
                      <option value={80}>CUIT</option>
                      <option value={86}>CUIL</option>
                      <option value={96}>DNI</option>
                      <option value={94}>Pasaporte</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Número Doc.
                  </label>
                  <input
                    type="text"
                    value={form.documento}
                    onChange={(e) => handleChange("documento", e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Cond. Fiscal
                  </label>
                  <div className="relative">
                    <select
                      value={form.condicionIva}
                      onChange={(e) =>
                        handleChange("condicionIva", e.target.value)
                      }
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[12px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] appearance-none cursor-pointer transition-all uppercase shadow-sm"
                    >
                      <option value="CF">Consumidor Final</option>
                      <option value="RI">Resp. Inscripto</option>
                      <option value="MO">Monotributista</option>
                      <option value="EX">Exento</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {advertenciaDocumento && (
                <p className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mt-1">
                  {advertenciaDocumento}
                </p>
              )}

              {/* Correo Electrónico */}
              <div className="space-y-1.5 mt-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="text"
                  placeholder="ejemplo@correo.com"
                  value={form.correoElectronico}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange("correoElectronico", val);
                    if (emailError) {
                      setEmailError(validarEmail(val));
                    }
                  }}
                  onBlur={(e) => {
                    setEmailError(validarEmail(e.target.value));
                  }}
                  className={`w-full bg-white border rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none shadow-sm transition-all ${
                    emailError
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-gray-200 focus:border-[#1FAE6D]"
                  }`}
                />
                {emailError && (
                  <p className="text-[11px] text-rose-500 font-bold uppercase mt-1">
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            {/* 3. RESPONSABLE DE FACTURACIÓN */}
            <TieneAccion accion="ENTE_FACTURACION_CONTACTO">
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] whitespace-nowrap">
                    Facturación
                  </span>
                  {!form.enteFacturacion && (
                    <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Factura Directa
                    </span>
                  )}
                </div>

                {!form.enteFacturacion?.codigo ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          value={busquedaEnte.entidad}
                          onChange={(e) =>
                            setBusquedaEnte({
                              ...busquedaEnte,
                              entidad: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[11px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] cursor-pointer appearance-none uppercase shadow-sm"
                        >
                          <option value="">Seleccionar Entidad...</option>
                          {entidades.map((ent) => (
                            <option key={ent.clave} value={ent.clave}>
                              {ent.nombre.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Search size={12} />
                        </div>
                        <input
                          type="text"
                          disabled={!busquedaEnte.entidad}
                          placeholder={
                            !busquedaEnte.entidad
                              ? "Elija entidad primero..."
                              : "Buscar responsable..."
                          }
                          value={busquedaEnte.query}
                          onChange={(e) => {
                            setBusquedaEnte((prev) => ({
                              ...prev,
                              query: e.target.value,
                              mostrarDropdown: true,
                            }));
                            setHighlightedIndexEnte(-1);
                          }}
                          onFocus={() =>
                            busquedaEnte.entidad &&
                            setBusquedaEnte((p) => ({
                              ...p,
                              mostrarDropdown: true,
                            }))
                          }
                          onBlur={() =>
                            setTimeout(
                              () =>
                                setBusquedaEnte((p) => ({
                                  ...p,
                                  mostrarDropdown: false,
                                })),
                              200,
                            )
                          }
                          className="w-full bg-white border border-gray-200 rounded-md pl-9 pr-3 py-2 text-[11px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] disabled:opacity-50 transition-all shadow-sm"
                        />

                        {cargandoEntes && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-[#1FAE6D] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}

                        {busquedaEnte.mostrarDropdown && (
                          <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-white border border-gray-200 rounded-md shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                            {Array.isArray(listaEntes) &&
                            listaEntes.length > 0 ? (
                              listaEntes.map((c, idx) => (
                                <div
                                  key={c.codigo}
                                  onClick={() => {
                                    const nombre =
                                      c.razonSocial ||
                                      `${c.nombre} ${c.apellido}`;
                                    setForm((p) => ({
                                      ...p,
                                      enteFacturacion: c,
                                    }));
                                    setBusquedaEnte((p) => ({
                                      ...p,
                                      query: nombre,
                                      mostrarDropdown: false,
                                    }));
                                  }}
                                  className={`px-4 py-2.5 text-[11px] font-bold cursor-pointer rounded-md uppercase transition-colors ${idx === highlightedIndexEnte ? "bg-[#1FAE6D] text-white" : "text-gray-900 hover:bg-[#1FAE6D]/10 hover:text-[#1FAE6D]"}`}
                                >
                                  {c.razonSocial || `${c.nombre} ${c.apellido}`}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-[11px] text-gray-500 text-center font-bold uppercase italic">
                                {busquedaEnte.query
                                  ? "Sin resultados"
                                  : "Escriba para buscar..."}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#1FAE6D]/10 border border-[#1FAE6D]/20 rounded-md shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#1FAE6D] uppercase tracking-widest mb-0.5">
                        ENTE FACTURADOR:
                      </span>
                      <span className="text-[13px] font-black text-gray-900 uppercase truncate max-w-[200px]">
                        {form.enteFacturacion?.razonSocial ||
                          `${form.enteFacturacion?.nombre || ""} ${form.enteFacturacion?.apellido || ""}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, enteFacturacion: null }))
                      }
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                    >
                      <BorrarIcono size={16} />
                    </button>
                  </div>
                )}
              </div>
            </TieneAccion>

            {/* Feature 33 (contactos-relaciones-ui, R45): la sección
                "4. Vínculos / Relaciones" (gateada por TieneAccion
                accion="VINCULOS_CONTACTO") se retira de este formulario.
                VisorRelaciones (embebido en la Ficha de ListaContactos.jsx)
                cubre la misma necesidad de negocio de forma contextual, con
                las validaciones de cardinalidad/tipo que este mecanismo
                legacy nunca tuvo. Ver design.md §8 para la justificación
                completa. El backend (Contacto.relaciones,
                _sincronizarEspejos) sigue intacto (R43, R44); solo se
                retira este único emisor. */}

            {/* 5. CAMPOS DINÁMICOS */}
            {configsEntidad.length > 0 && (
              <div className="space-y-5 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] whitespace-nowrap">
                    Atributos {entidadActual?.nombre}
                  </span>
                  <div className="h-px w-full bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {configsEntidad.map((conf) => (
                    <div key={conf.claveCampo} className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        {conf.nombreCampo}{" "}
                        {conf.requerido && (
                          <span className="text-rose-500">*</span>
                        )}
                      </label>

                      {conf.tipoDato === "LISTA" ? (
                        <div className="relative">
                          <select
                            value={form.atributos[conf.claveCampo] || ""}
                            onChange={(e) =>
                              handleAtributoChange(
                                conf.claveCampo,
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[12px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] appearance-none cursor-pointer uppercase transition-all shadow-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {(conf.opciones || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>
                      ) : conf.tipoDato === "BOOLEANO" ? (
                        <div className="flex gap-2 p-1 bg-gray-50 rounded-md border border-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              handleAtributoChange(conf.claveCampo, true)
                            }
                            className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all cursor-pointer ${form.atributos[conf.claveCampo] === true ? "bg-white text-[#1FAE6D] shadow-sm border border-[#1FAE6D]/20" : "text-gray-500 hover:text-gray-900"}`}
                          >
                            SÍ
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAtributoChange(conf.claveCampo, false)
                            }
                            className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all cursor-pointer ${form.atributos[conf.claveCampo] === false ? "bg-white text-[#EF5A5A] shadow-sm border border-[#EF5A5A]/20" : "text-gray-500 hover:text-gray-900"}`}
                          >
                            NO
                          </button>
                        </div>
                      ) : (
                        <input
                          type={conf.tipoDato === "NUMERO" ? "number" : "text"}
                          value={form.atributos[conf.claveCampo] || ""}
                          onChange={(e) =>
                            handleAtributoChange(
                              conf.claveCampo,
                              e.target.value,
                            )
                          }
                          className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-[13px] font-bold text-gray-900 focus:outline-none focus:border-[#1FAE6D] transition-all shadow-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="pt-8 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#1FAE6D] text-white rounded-md text-[12px] font-black uppercase tracking-[0.2em] hover:bg-[#178F58] active:scale-95 transition-all shadow-sm shadow-[#1FAE6D]/20 cursor-pointer"
              >
                {contacto ? "ACTUALIZAR FICHA" : "REGISTRAR CONTACTO"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-white text-gray-500 rounded-md text-[11px] font-black uppercase tracking-[0.2em] border border-gray-200 hover:text-gray-900 hover:bg-gray-50 transition-all cursor-pointer"
              >
                DESCARTAR CAMBIOS
              </button>
            </div>
          </form>
        )}
    </>
  );

  if (inline) {
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {contenido}
      </div>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-md shadow-2xl border border-gray-200 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {contenido}
      </div>
    </div>,
    document.body
  );
};

export default FormularioContacto;
