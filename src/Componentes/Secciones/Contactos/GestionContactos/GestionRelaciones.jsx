import { useState } from "react";
import { BorrarIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import { Link2 } from "lucide-react";
import { useEntidades } from "../../../../Backend/Contactos/hooks/useEntidades";
import { useConfiguracionRelaciones } from "../../../../Backend/Contactos/hooks/useConfiguracionRelaciones";

// Feature 33 (contactos-relaciones-ui). Pantalla de administración de
// ConfiguracionRelacion (listado + alta + edición + baja), gateada por el
// mismo modoAdmin/permiso CONFIGURAR_CONTACTO que GestionEntidades.jsx (R25,
// R29, R30). Sigue el mismo patrón visual (2 columnas, form + listado) y las
// variables CSS ya usadas en GestionEntidades.jsx/ListaContactos.jsx (R32).
const CARDINALIDADES = ["UNO_A_UNO", "UNO_A_MUCHOS", "MUCHOS_A_MUCHOS"];

const FORM_VACIO = {
  clave: "",
  claveOrigen: "",
  claveDestino: "",
  nombreDirecto: "",
  nombreInverso: "",
  cardinalidad: "MUCHOS_A_MUCHOS",
  activo: true,
};

const GestionRelaciones = () => {
  const { entidades } = useEntidades();
  const {
    configuracionesRelacion,
    cargandoConfiguracionesRelacion,
    crearConfiguracionRelacion,
    actualizarConfiguracionRelacion,
    eliminarConfiguracionRelacion,
  } = useConfiguracionRelaciones();

  const [form, setForm] = useState(FORM_VACIO);
  const [editingId, setEditingId] = useState(null);

  const startEdit = (config) => {
    setEditingId(config.codigo);
    setForm({
      clave: config.clave,
      claveOrigen: config.claveOrigen,
      claveDestino: config.claveDestino,
      nombreDirecto: config.nombreDirecto,
      nombreInverso: config.nombreInverso,
      cardinalidad: config.cardinalidad,
      activo: config.activo,
    });
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setForm(FORM_VACIO);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombreDirecto || !form.nombreInverso) return;

    if (editingId) {
      // R27: edición restringida a nombreDirecto/nombreInverso/cardinalidad/activo.
      await actualizarConfiguracionRelacion({
        codigo: editingId,
        data: {
          nombreDirecto: form.nombreDirecto,
          nombreInverso: form.nombreInverso,
          cardinalidad: form.cardinalidad,
          activo: form.activo,
        },
      });
    } else {
      if (!form.clave || !form.claveOrigen || !form.claveDestino) return;
      await crearConfiguracionRelacion(form);
    }

    cancelarEdicion();
  };

  const handleEliminar = (config) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar la relación "${config.nombreDirecto}"?`,
      )
    ) {
      eliminarConfiguracionRelacion(config.codigo);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* COLUMNA 1: FORMULARIO */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] shadow-sm">
            <Link2 size={16} />
          </div>
          <div>
            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
              Relaciones entre Contactos
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              CONFIGURACIÓN DE VÍNCULOS DINÁMICOS
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`p-5 rounded-md border transition-all shadow-sm space-y-4 ${
            editingId
              ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20"
              : "bg-[var(--surface-hover)] border-[var(--border-subtle)]"
          }`}
        >
          {editingId && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
                Editando Relación
              </span>
              <button
                type="button"
                onClick={cancelarEdicion}
                className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest"
              >
                CANCELAR EDICIÓN
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
              Clave (identificador único)
            </label>
            <input
              type="text"
              disabled={!!editingId}
              placeholder="Ej: empleados"
              value={form.clave}
              onChange={(e) =>
                setForm({ ...form, clave: e.target.value.trim() })
              }
              className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)] disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Entidad Origen
              </label>
              <select
                disabled={!!editingId}
                value={form.claveOrigen}
                onChange={(e) =>
                  setForm({ ...form, claveOrigen: e.target.value })
                }
                className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
              >
                <option value="">SELECCIONAR...</option>
                {entidades.map((ent) => (
                  <option key={ent.clave} value={ent.clave}>
                    {ent.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Entidad Destino
              </label>
              <select
                disabled={!!editingId}
                value={form.claveDestino}
                onChange={(e) =>
                  setForm({ ...form, claveDestino: e.target.value })
                }
                className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider"
              >
                <option value="">SELECCIONAR...</option>
                {entidades.map((ent) => (
                  <option key={ent.clave} value={ent.clave}>
                    {ent.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Nombre Directo
              </label>
              <input
                type="text"
                placeholder="Ej: Empleados"
                value={form.nombreDirecto}
                onChange={(e) =>
                  setForm({ ...form, nombreDirecto: e.target.value })
                }
                className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Nombre Inverso
              </label>
              <input
                type="text"
                placeholder="Ej: Comercio"
                value={form.nombreInverso}
                onChange={(e) =>
                  setForm({ ...form, nombreInverso: e.target.value })
                }
                className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-muted)]"
              />
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] ml-1">
                Cardinalidad
              </label>
              <select
                value={form.cardinalidad}
                onChange={(e) =>
                  setForm({ ...form, cardinalidad: e.target.value })
                }
                className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-4 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] appearance-none cursor-pointer transition-all uppercase tracking-wider"
              >
                {CARDINALIDADES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer h-10"
            >
              {editingId ? "GUARDAR" : "REGISTRAR"}
            </button>
          </div>
        </form>
      </div>

      {/* COLUMNA 2: LISTADO */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
            <ConfiguracionIcono size={16} />
          </div>
          <div>
            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">
              Relaciones Configuradas
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
              VÍNCULOS ACTIVOS ENTRE ENTIDADES
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {cargandoConfiguracionesRelacion ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-[var(--fill-secondary)]/50 rounded-md animate-pulse"
              />
            ))
          ) : configuracionesRelacion.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
              <Link2 size={32} className="mb-2 opacity-20" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Sin relaciones configuradas
              </span>
            </div>
          ) : (
            configuracionesRelacion.map((config) => (
              <div
                key={config.codigo}
                className="flex flex-col px-5 py-4 bg-[var(--surface-hover)] rounded-md border border-[var(--border-subtle)] hover:border-[var(--primary)]/20 transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-md bg-[var(--fill-secondary)] text-[10px] font-black text-[var(--text-muted)] uppercase border border-[var(--border-subtle)] tracking-wider">
                      {config.claveOrigen} → {config.claveDestino}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-wide">
                        {config.nombreDirecto} / {config.nombreInverso}
                      </span>
                      <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                        {config.cardinalidad?.replace(/_/g, " ")} · clave: {config.clave}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEdit(config)}
                      className="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-all cursor-pointer"
                      title="Editar Relación"
                    >
                      <ConfiguracionIcono size={14} />
                    </button>
                    <button
                      onClick={() => handleEliminar(config)}
                      className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all cursor-pointer"
                      title="Eliminar Relación"
                    >
                      <BorrarIcono size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionRelaciones;
