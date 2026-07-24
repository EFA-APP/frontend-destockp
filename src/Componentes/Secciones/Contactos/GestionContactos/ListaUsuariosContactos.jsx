import React, { useEffect, useState } from "react";
import { Users, Mail, MailX, Search, X } from "lucide-react";
import { CandadoIcono } from "../../../../assets/Icons";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { useActualizarContactoInline } from "../../../../Backend/Contactos/hooks/useActualizarContactoInline";
import ModalHabilitarUsuarioMasivo from "../../../Modales/Contactos/ModalHabilitarUsuarioMasivo";

/**
 * Componente interno de edición inline del correo electrónico (Feature 35,
 * contactos-tabs-usuarios-relaciones-globales, design.md §4.2, R9, R13).
 * Mismo patrón ya usado por InlineEnteFacturacion/InlineAtributo de
 * ListaContactos.jsx: estado `editando` local + input + guardar con
 * Enter/blur.
 */
const InlineEmailUsuario = ({ contacto, onActualizar }) => {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");

  const guardar = async () => {
    if (!valor.trim()) {
      setEditando(false);
      return;
    }
    const ok = await onActualizar(contacto.codigo, {
      correoElectronico: valor.trim(),
    });
    if (ok) setEditando(false); // si falló la validación (R11), sigue editando
  };

  if (editando) {
    return (
      <input
        autoFocus
        type="email"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => e.key === "Enter" && guardar()}
        placeholder="correo@ejemplo.com"
        className="w-full bg-[var(--surface)] border border-[var(--primary)] rounded-[8px] px-2 py-1 text-[12px] font-medium outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="flex items-center gap-1.5 text-[var(--text-muted)] italic hover:text-[var(--primary)] hover:not-italic transition-colors cursor-pointer"
    >
      <MailX size={13} className="opacity-60" />
      Cargar email...
    </button>
  );
};

/**
 * Tab "Usuarios" de DashboardContactos.jsx (Feature 34,
 * contactos-habilitar-usuario-masivo, design.md §2). Listado cross-entidad
 * (sin filtro tipoEntidad) con selección múltiple por checkbox para la
 * habilitación masiva de acceso. Paginación local, no compartida con
 * ListaContactos.jsx (R9).
 *
 * Feature 35 (contactos-tabs-usuarios-relaciones-globales, design.md §3-§4):
 * gana buscador con debounce (R5-R8) y edición inline del correo electrónico
 * para contactos sin email (R9-R13).
 */
const ListaUsuariosContactos = () => {
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(10);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  // R6: resetea a 1 la página local al cambiar el texto de búsqueda.
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busquedaLocal);
      setPagina(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaLocal]);

  const { contactos, total, paginas, cargandoContactos, refetch } =
    useContactos({ pagina, limite, busqueda: busquedaDebounced }); // R5, R7
  const { actualizarContactoInline } = useActualizarContactoInline();

  const toggleSeleccion = (contacto) => {
    const seleccionable =
      !!contacto.correoElectronico && !contacto.usuarioHabilitado;
    if (!seleccionable) return;

    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(contacto.codigo)) {
        next.delete(contacto.codigo);
      } else {
        next.add(contacto.codigo);
      }
      return next;
    });
  };

  const contactosSeleccionados = contactos.filter((c) =>
    seleccionados.has(c.codigo),
  );

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setSeleccionados(new Set());
    refetch();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[16px] shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-[13px] font-black uppercase text-[var(--text-primary)] tracking-widest flex items-center gap-2">
          <Users size={16} />
          Usuarios de contactos
        </h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* R5: buscador con debounce */}
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              type="text"
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              placeholder="Buscar contactos..."
              className="bg-transparent border-none outline-none text-[12px] font-medium py-1.5 px-2 w-48 text-[var(--text-primary)]"
            />
            {busquedaLocal && (
              <button
                onClick={() => setBusquedaLocal("")}
                className="text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {seleccionados.size > 0 && (
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-[10px] shadow-sm hover:brightness-110 transition-all cursor-pointer"
            >
              <CandadoIcono size={14} />
              Habilitar como usuario ({seleccionados.size})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--surface)] z-10">
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Contacto
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Tipo
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Email
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                Estado de acceso
              </th>
            </tr>
          </thead>
          <tbody>
            {cargandoContactos ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-2">
                    <div className="h-10 bg-[var(--fill-secondary)]/50 rounded-md animate-pulse" />
                  </td>
                </tr>
              ))
            ) : contactos.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-[12px] font-black uppercase tracking-widest text-[var(--text-muted)]"
                >
                  No se encontraron contactos
                </td>
              </tr>
            ) : (
              contactos.map((c) => {
                const seleccionable =
                  !!c.correoElectronico && !c.usuarioHabilitado;
                return (
                  <tr
                    key={c.codigo}
                    className="border-b border-[var(--border-subtle)] hover:bg-[var(--fill-secondary)]/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        disabled={!seleccionable}
                        checked={seleccionados.has(c.codigo)}
                        onChange={() => toggleSeleccion(c)}
                        title={
                          !c.correoElectronico
                            ? "El contacto no tiene correo electrónico cargado"
                            : c.usuarioHabilitado
                              ? "El contacto ya tiene usuario habilitado"
                              : undefined
                        }
                        className="w-4 h-4 accent-[var(--primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)]">
                      {c.razonSocial ||
                        `${c.nombre || ""} ${c.apellido || ""}`.trim() ||
                        "Sin Nombre"}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-bold uppercase text-[var(--text-muted)]">
                      {c.tipoEntidad}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-medium">
                      {c.correoElectronico ? (
                        <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
                          <Mail size={13} className="opacity-60" />
                          {c.correoElectronico}
                        </span>
                      ) : (
                        <InlineEmailUsuario
                          contacto={c}
                          onActualizar={actualizarContactoInline}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          c.usuarioHabilitado
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}
                      >
                        {c.usuarioHabilitado ? "Habilitado" : "No habilitado"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--fill-secondary)]/20 flex items-center justify-between">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">
          Total: {total}
        </span>
        <div className="flex items-center gap-3">
          <button
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => p - 1)}
            className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
          >
            Ant
          </button>
          <span className="text-[11px] font-black px-2">
            {pagina} / {paginas || 1}
          </span>
          <button
            disabled={pagina >= paginas}
            onClick={() => setPagina((p) => p + 1)}
            className="text-[10px] px-3 py-1.5 font-black uppercase tracking-widest bg-[var(--surface)] border border-[var(--border-subtle)] rounded hover:bg-[var(--fill-secondary)] disabled:opacity-30 cursor-pointer shadow-sm transition-all"
          >
            Sig
          </button>
        </div>
      </div>

      <ModalHabilitarUsuarioMasivo
        open={mostrarModal}
        onClose={handleCerrarModal}
        contactos={contactosSeleccionados}
      />
    </div>
  );
};

export default ListaUsuariosContactos;
