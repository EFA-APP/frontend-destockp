import { useState } from "react";
import {
  BorrarIcono,
  ConfiguracionIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";

const GestionEntidades = () => {
  const { entidades, crearEntidad, cargandoEntidades } = useEntidades();
  const {
    configs,
    crearConfiguracion,
    actualizarConfiguracion,
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* SECCION 1: CREAR / LISTAR ENTIDADES */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <CuentaIcono size={12} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              Maestro de Entidades
            </h2>
          </div>

          <form
            onSubmit={handleCrearEntidad}
            className="bg-white/[0.02] p-4 rounded-md border border-white/5 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Ej: ALUMNOS"
                  value={nuevaEntidad.nombre}
                  onChange={(e) =>
                    setNuevaEntidad({ ...nuevaEntidad, nombre: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                  Cód. [4]
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
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/10"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                  Identificador Visual
                </label>
                <input
                  type="color"
                  value={nuevaEntidad.color}
                  onChange={(e) =>
                    setNuevaEntidad({ ...nuevaEntidad, color: e.target.value })
                  }
                  className="w-full h-8 bg-white/[0.03] border border-white/5 rounded-md p-1 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                className="self-end px-6 py-2 bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/10"
              >
                REGISTRAR
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-2">
            {entidades.map((ent) => (
              <div
                key={ent.clave}
                className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] rounded-md border border-white/5 group hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    style={{ backgroundColor: ent.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white/90 uppercase">
                      {ent.nombre}
                    </span>
                    <span className="text-[9px] text-white/90 font-black tracking-tighter">
                      CLAVE: {ent.clave}
                    </span>
                  </div>
                </div>
                <button className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100">
                  <BorrarIcono size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECCION 2: CONFIGURAR CAMPOS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <ConfiguracionIcono size={12} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              Esquema de Atributos
            </h2>
          </div>

          <form
            onSubmit={handleCrearOConsolidarCampo}
            className={`p-4 rounded-md border transition-all space-y-3 ${
              editingId
                ? "bg-blue-500/5 border-blue-500/20"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            {editingId && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
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
                  className="text-[9px] font-bold text-white/90 hover:text-white"
                >
                  CANCELAR
                </button>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                Entidad de Destino
              </label>
              <select
                disabled={!!editingId}
                value={nuevoCampo.entidad}
                onChange={(e) =>
                  setNuevoCampo({ ...nuevoCampo, entidad: e.target.value })
                }
                className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="text-black">
                  SELECCIONAR...
                </option>
                {entidades.map((ent) => (
                  <option
                    key={ent.clave}
                    value={ent.clave}
                    className="text-black"
                  >
                    {ent.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
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
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                  ID Atributo
                </label>
                <input
                  type="text"
                  disabled={!!editingId}
                  placeholder="matricula"
                  value={nuevoCampo.claveCampo}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, claveCampo: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-white/10 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-white/90 uppercase tracking-widest ml-1">
                  Formato de Salida
                </label>
                <select
                  value={nuevoCampo.tipoDato}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, tipoDato: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/5 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]/50 appearance-none cursor-pointer"
                >
                  <option className="text-black" value="TEXTO">
                    TEXTO PLANO
                  </option>
                  <option className="text-black" value="NUMERO">
                    VALOR NUMÉRICO
                  </option>
                  <option className="text-black" value="BOOLEANO">
                    SÍ / NO
                  </option>
                  <option className="text-black" value="LISTA">
                    LISTA DESPLEGABLE
                  </option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className={`w-full py-2 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all ${
                    editingId ? "bg-blue-600" : "bg-blue-500"
                  }`}
                >
                  {editingId ? "GUARDAR CAMBIOS" : "INSERTAR"}
                </button>
              </div>
            </div>

            {/* FÓRMULA DE CÁLCULO */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <label className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest ml-1 flex justify-between">
                <span>Fórmula de Cálculo (Opcional)</span>
                <span className="text-[8px] opacity-40 lowercase">
                  usar {"{variable}"}
                </span>
              </label>
              <textarea
                placeholder='Ej: {tipo_alumno} == "interno" ? 190000 : 130000'
                value={nuevoCampo.formula}
                onChange={(e) =>
                  setNuevoCampo({ ...nuevoCampo, formula: e.target.value })
                }
                rows={2}
                className="w-full bg-amber-500/5 border border-amber-500/10 rounded-md px-3 py-2 text-[10px] font-mono text-amber-200/80 focus:outline-none focus:border-amber-500/30 transition-all placeholder:text-amber-500/20"
              />
            </div>

            {nuevoCampo.tipoDato === "LISTA" && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                <label className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest ml-1">
                  Opciones de la lista (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: OPCIÓN 1, OPCIÓN 2, OPCIÓN 3"
                  value={nuevoCampo.opciones}
                  onChange={(e) =>
                    setNuevoCampo({ ...nuevoCampo, opciones: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-[var(--primary)]/20 rounded-md px-3 py-1.5 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-white/10"
                />
              </div>
            )}
          </form>

          <div className="grid grid-cols-1 gap-2">
            {configs.map((conf) => (
              <div
                key={conf.codigoSecuencial}
                className="flex flex-col px-4 py-2.5 bg-white/[0.02] rounded-md border border-white/5 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black text-white/40 uppercase border border-white/5">
                      {conf.entidadClave}
                    </span>
                    <span className="text-[11px] font-black text-white/80 uppercase">
                      {conf.nombreCampo}
                    </span>
                    {conf.formula && (
                      <span className="text-[8px] font-bold text-amber-500/50 italic">
                        [Con Fórmula]
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/90 font-black tracking-tighter uppercase mr-2">
                      {conf.tipoDato}
                    </span>
                    <button
                      onClick={() => startEdit(conf)}
                      className="p-1.5 text-blue-400 bg-blue-400/20 rounded-md transition-all cursor-pointer"
                    >
                      <ConfiguracionIcono size={12} />
                    </button>
                    <button className="p-1.5 text-red-400 bg-red-400/20 rounded-md transition-all cursor-pointer">
                      <BorrarIcono size={12} />
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
