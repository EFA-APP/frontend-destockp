import { useState } from "react";
import {
  BorrarIcono,
  ConfiguracionIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";

const GestionEntidades = () => {
  const { entidades, crearEntidad, eliminarEntidad, cargandoEntidades } =
    useEntidades();
  const {
    configs,
    crearConfiguracion,
    actualizarConfiguracion,
    eliminarConfiguracion,
    cargandoConfigs,
  } = useConfiguracionContactos();

  const [nuevaEntidad, setNuevaEntidad] = useState({
    nombre: "",
    clave: "",
    icono: "user",
    color: "#34d399",
  });

  const [nuevoCampo, setNuevoCampo] = useState({
    entidad: "",
    nombreCampo: "",
    claveCampo: "",
    tipoDato: "TEXTO",
    opciones: "",
    formula: "",
    requerido: false,
  });

  const [editingId, setEditingId] = useState(null);

  const handleCrearEntidad = async (e) => {
    e.preventDefault();
    if (!nuevaEntidad.nombre || !nuevaEntidad.clave) return;
    await crearEntidad(nuevaEntidad);
    setNuevaEntidad({
      nombre: "",
      clave: "",
      icono: "user",
      color: "#34d399",
    });
  };

  const handleCrearOConsolidarCampo = async (e) => {
    e.preventDefault();
    if (
      !nuevoCampo.entidad ||
      !nuevoCampo.nombreCampo ||
      !nuevoCampo.claveCampo
    )
      return;

    const payload = {
      ...nuevoCampo,
      codigoEmpresa: 2, // Hardcoded for POC as per existing pattern
      opciones:
        nuevoCampo.tipoDato === "LISTA"
          ? typeof nuevoCampo.opciones === "string"
            ? nuevoCampo.opciones.split(",").map((o) => o.trim())
            : nuevoCampo.opciones
          : null,
    };

    if (editingId) {
      await actualizarConfiguracion({
        codigoSecuencial: editingId,
        data: payload,
      });
    } else {
      await crearConfiguracion(payload);
    }

    setNuevoCampo({
      entidad: "",
      nombreCampo: "",
      claveCampo: "",
      tipoDato: "TEXTO",
      opciones: "",
      formula: "",
      requerido: false,
    });
    setEditingId(null);
  };

  const startEdit = (conf) => {
    setEditingId(conf.codigoSecuencial);
    setNuevoCampo({
      entidad: conf.entidadClave,
      nombreCampo: conf.nombreCampo,
      claveCampo: conf.claveCampo,
      tipoDato: conf.tipoDato,
      opciones: Array.isArray(conf.opciones)
        ? conf.opciones.join(", ")
        : conf.opciones || "",
      formula: conf.formula || "",
      requerido: conf.requerido || false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
        {/* SECCION 1: CREAR / LISTAR ENTIDADES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-sm">
              <CuentaIcono size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Maestro de Entidades
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                GESTIÓN DE CATEGORÍAS DE CONTACTOS
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCrearEntidad}
            className="bg-[var(--surface-hover)] p-5 rounded-md border border-[var(--border-subtle)] space-y-4 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  Nombre de Entidad
                </label>
                <input
                  type="text"
                  placeholder="Ej: ALUMNOS"
                  value={nuevaEntidad.nombre}
                  onChange={(e) =>
                    setNuevaEntidad({ ...nuevaEntidad, nombre: e.target.value })
                  }
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  Cód. Identificador
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="ALUM"
                  value={nuevaEntidad.clave}
                  onChange={(e) =>
                    setNuevaEntidad({
                      ...nuevaEntidad,
                      clave: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest"
                />
              </div>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  Color de Categoría
                </label>
                <div className="relative">
                  <input
                    type="color"
                    value={nuevaEntidad.color}
                    onChange={(e) =>
                      setNuevaEntidad({ ...nuevaEntidad, color: e.target.value })
                    }
                    className="w-full h-10 bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md p-1 cursor-pointer"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-8 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer h-10"
              >
                REGISTRAR
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-2.5">
            {entidades.map((ent) => (
              <div
                key={ent.clave}
                className="flex items-center justify-between px-5 py-3.5 bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] group hover:border-[var(--primary)]/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-lg"
                    style={{ backgroundColor: ent.color, boxShadow: `0 0 10px ${ent.color}44` }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                      {ent.nombre}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-black tracking-[0.1em]">
                      CLAVE: {ent.clave}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Estás seguro de eliminar la entidad "${ent.nombre}"?`,
                      )
                    ) {
                      eliminarEntidad(ent.clave);
                    }
                  }}
                  className="p-2.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <BorrarIcono size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECCION 2: CONFIGURAR CAMPOS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
              <ConfiguracionIcono size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
                Esquema de Atributos
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                CAMPOS DINÁMICOS POR ENTIDAD
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCrearOConsolidarCampo}
            className={`p-5 rounded-md border transition-all shadow-sm space-y-4 ${
              editingId
                ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20"
                : "bg-[var(--surface-hover)] border-[var(--border-subtle)]"
            }`}
          >
            {editingId && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                  Editando Atributo
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setNuevoCampo({
                      entidad: "",
                      nombreCampo: "",
                      claveCampo: "",
                      tipoDato: "TEXTO",
                      opciones: "",
                      formula: "",
                      requerido: false,
                    });
                  }}
                  className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest"
                >
                  CANCELAR EDICIÓN
                </button>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Entidad de Destino
              </label>
              <div className="relative">
                <select
                  disabled={!!editingId}
                  value={nuevoCampo.entidad}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, entidad: e.target.value })
                  }
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
                >
                  <option value="" className="text-[var(--text-muted)]">
                    SELECCIONAR ENTIDAD...
                  </option>
                  {entidades.map((ent) => (
                    <option
                      key={ent.clave}
                      value={ent.clave}
                    >
                      {ent.nombre.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--text-muted)]">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  Nombre Visual
                </label>
                <input
                  type="text"
                  placeholder="Ej: MATRÍCULA"
                  value={nuevoCampo.nombreCampo}
                  onChange={(e) =>
                    setNuevoCampo({
                      ...nuevoCampo,
                      nombreCampo: e.target.value,
                    })
                  }
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  ID Atributo (clave)
                </label>
                <input
                  type="text"
                  disabled={!!editingId}
                  placeholder="matricula"
                  value={nuevoCampo.claveCampo}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, claveCampo: e.target.value })
                  }
                  className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] tracking-wider disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                  Formato de Dato
                </label>
                <div className="relative">
                  <select
                    value={nuevoCampo.tipoDato}
                    onChange={(e) =>
                      setNuevoCampo({ ...nuevoCampo, tipoDato: e.target.value })
                    }
                    className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer transition-all uppercase tracking-wider"
                  >
                    <option value="TEXTO">TEXTO PLANO</option>
                    <option value="NUMERO">VALOR NUMÉRICO</option>
                    <option value="BOOLEANO">SÍ / NO</option>
                    <option value="LISTA">LISTA DESPLEGABLE</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--text-muted)]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className={`w-full h-10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer ${
                    editingId ? "bg-blue-500 shadow-blue-500/20" : "bg-blue-600 shadow-blue-600/20"
                  }`}
                >
                  {editingId ? "GUARDAR CAMBIOS" : "INSERTAR CAMPO"}
                </button>
              </div>
            </div>

            {/* FÓRMULA DE CÁLCULO */}
            <div className="space-y-1.5 pt-4 border-t border-[var(--border-subtle)]">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] ml-1 flex justify-between items-center">
                <span>Fórmula Dinámica (Opcional)</span>
                <span className="text-[9px] lowercase opacity-60 bg-amber-100 px-2 py-0.5 rounded italic">
                  usar {"{clave_campo}"}
                </span>
              </label>
              <textarea
                placeholder='Ej: {tipo_alumno} == "interno" ? 190000 : 130000'
                value={nuevoCampo.formula}
                onChange={(e) =>
                  setNuevoCampo({ ...nuevoCampo, formula: e.target.value })
                }
                rows={2}
                className="w-full bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-[12px] font-mono text-amber-800 focus:outline-none focus:border-amber-400 transition-all placeholder:text-amber-300"
              />
            </div>

            {nuevoCampo.tipoDato === "LISTA" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.15em] ml-1">
                  Opciones (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: OPCIÓN 1, OPCIÓN 2, OPCIÓN 3"
                  value={nuevoCampo.opciones}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, opciones: e.target.value })
                  }
                  className="w-full bg-[var(--primary-subtle)] border border-[var(--primary)]/30 rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--primary)]/30 uppercase tracking-widest"
                />
              </div>
            )}
          </form>

          <div className="grid grid-cols-1 gap-2.5">
            {configs.map((conf) => (
              <div
                key={conf.codigoSecuencial}
                className="flex flex-col px-5 py-4 bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] hover:border-[var(--primary)]/20 transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--fill-secondary)] text-[10px] font-black text-[var(--text-muted)] uppercase border border-[var(--border-subtle)] tracking-wider">
                      {conf.entidadClave}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wide">
                        {conf.nombreCampo}
                      </span>
                      {conf.formula && (
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"/>
                          Dinámico (Fórmula)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] bg-[var(--fill-secondary)] px-2 py-1 rounded-md">
                      {conf.tipoDato}
                    </span>
                    <button
                      onClick={() => startEdit(conf)}
                      className="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-all cursor-pointer"
                      title="Editar Esquema"
                    >
                      <ConfiguracionIcono size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Estás seguro de eliminar el atributo "${conf.nombreCampo}"?`,
                          )
                        ) {
                          eliminarConfiguracion(conf.codigoSecuencial);
                        }
                      }}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all cursor-pointer"
                      title="Eliminar Atributo"
                    >
                      <BorrarIcono size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionEntidades;
