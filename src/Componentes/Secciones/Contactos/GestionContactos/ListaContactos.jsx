import React, { useState } from "react";
import FormularioContacto from "./FormularioContacto";
import DetallesContacto from "./DetallesContacto";
import {
  AdvertenciaIcono,
  AgregarIcono,
  BorrarIcono,
  CuentaIcono,
} from "../../../../assets/Icons";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";
import MenuDeAccionesGenerico from "../../../UI/TablaReutilizable/MenuDeAccionesGenerico";
import { Search } from "lucide-react";

const ListaContactos = ({
  entidad,
  contactos,
  cargando,
  filtros,
  setFiltros,
  total,
  paginas,
  eliminarContacto,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contactoEditar, setContactoEditar] = useState(null);
  const [contactoDetalle, setContactoDetalle] = useState(null);
  const [contactoAEliminar, setContactoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);

  // Debounce para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, busqueda: busquedaLocal, pagina: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaLocal, setFiltros]);

  const handleNuevo = () => {
    setContactoEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditar = (contacto) => {
    setContactoEditar(contacto);
    setMostrarFormulario(true);
  };

  const acciones = [
    {
      ...accionesReutilizables.verDetalle,
      onClick: (fila) => setContactoDetalle(fila),
    },
    { ...accionesReutilizables.editar, onClick: (fila) => handleEditar(fila) },
    {
      ...accionesReutilizables.eliminar,
      onClick: (fila) => setContactoAEliminar(fila),
    },
  ];

  const handleConfirmarEliminar = async () => {
    if (!contactoAEliminar) return;
    try {
      setEliminando(true);
      await eliminarContacto(contactoAEliminar.codigoSecuencial);
      setContactoAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      alert("No se pudo eliminar el contacto. Intente nuevamente.");
    } finally {
      setEliminando(false);
    }
  };

  const HighlightText = (text, highlight) => {
    if (!highlight || !String(highlight).trim()) return text;
    const parts = String(text).split(new RegExp(`(${highlight})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span
              key={i}
              className="px-0.5 rounded-md border border-[var(--primary)]/50 text-[var(--primary)] bg-[var(--primary)]/5"
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Search and Action Bar Refined */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--surface-hover)]">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder={`BUSCAR POR NOMBRE, DNI O CÓDIGO...`}
            value={busquedaLocal}
            onChange={(e) => setBusquedaLocal(e.target.value)}
            className="w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md pl-10 pr-4 py-2 text-[12px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)] uppercase tracking-widest shadow-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <TieneAccion accion="CREAR_CONTACTO">
            <button
              onClick={handleNuevo}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-[var(--primary)] text-white rounded-md text-[11px] font-black uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer"
            >
              <AgregarIcono size={14} />
              NUEVO {entidad?.nombre || "CONTACTO"}
            </button>
          </TieneAccion>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--surface)]">
        {cargando ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-70">
            <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
              Cargando contactos...
            </span>
          </div>
        ) : contactos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
            <CuentaIcono size={64} className="text-[var(--text-muted)]" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Sin resultados
            </span>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[var(--fill-secondary)] sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-4">CÓDIGO</th>
                  <th className="px-6 py-4">NOMBRE Y APELLIDO</th>
                  <th className="px-6 py-4">SALDO ACTUAL</th>
                  {!entidad && <th className="px-6 py-4">TIPO</th>}
                  <th className="px-6 py-4 text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {contactos.map((c) => (
                  <tr
                    key={c.codigoSecuencial}
                    className="hover:bg-[var(--fill-secondary)]/50 transition-colors group"
                  >
                    <td className="px-6 py-3.5 text-[12px] font-bold text-[var(--text-secondary)]">
                      <span className="bg-[var(--fill-secondary)] px-2 py-0.5 rounded text-[11px] font-black">
                        {HighlightText(
                          c.codigoSecuencial.toString().padStart(4, "0"),
                          busquedaLocal,
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-[var(--text-primary)]">
                          {HighlightText(
                            c.razonSocial?.toUpperCase() ||
                              `${c.nombre?.toUpperCase()} ${c.apellido?.toUpperCase()}`,
                            busquedaLocal?.toUpperCase(),
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">
                            DNI/CUIT:
                          </span>
                          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                            {HighlightText(c.documento || "---", busquedaLocal)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--fill-secondary)]">
                        <span
                          className={`text-[12px] font-black tracking-tight ${
                            (c.atributos?.saldo || 0) > 0
                              ? "text-rose-500"
                              : (c.atributos?.saldo || 0) < 0
                                ? "text-emerald-500"
                                : "text-[var(--text-muted)]"
                          }`}
                        >
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(c.atributos?.saldo || 0)}
                        </span>
                      </div>
                    </td>
                    {!entidad && (
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-[var(--primary-subtle)] text-[10px] font-black uppercase tracking-wider text-[var(--primary-emphasis)] border border-[var(--primary)]/10">
                          {c.tipoEntidad}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end">
                        <MenuDeAccionesGenerico acciones={acciones} fila={c} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer Refinado */}
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-hover)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                Mostrando{" "}
                <span className="text-[var(--text-primary)]">
                  {contactos.length}
                </span>{" "}
                de <span className="text-[var(--text-primary)]">{total}</span>{" "}
                resultados
              </span>

              <div className="flex items-center gap-3">
                <button
                  disabled={filtros.pagina === 1}
                  onClick={() =>
                    setFiltros((p) => ({ ...p, pagina: p.pagina - 1 }))
                  }
                  className="p-2 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm">
                  <span className="text-[11px] font-black text-[var(--primary)]">
                    {filtros.pagina}
                  </span>
                  <span className="text-[11px] font-black text-[var(--text-muted)] opacity-30">
                    /
                  </span>
                  <span className="text-[11px] font-black text-[var(--text-secondary)]">
                    {paginas}
                  </span>
                </div>

                <button
                  disabled={filtros.pagina === paginas}
                  onClick={() =>
                    setFiltros((p) => ({ ...p, pagina: p.pagina + 1 }))
                  }
                  className="p-2 rounded-md bg-[var(--fill-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal / Overlay for Form */}
      {mostrarFormulario && (
        <FormularioContacto
          entidad={entidad}
          contacto={contactoEditar}
          onClose={() => {
            setMostrarFormulario(false);
            setContactoEditar(null);
          }}
        />
      )}

      {/* Modal / Overlay for Detail View */}
      {contactoDetalle && (
        <DetallesContacto
          contacto={contactoDetalle}
          onClose={() => setContactoDetalle(null)}
        />
      )}

      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {contactoAEliminar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm   ">
          <div className="bg-[#0a0a0a] border border-black/10 rounded-md max-w-md w-full p-6 shadow-2xl   ">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-700/10 flex items-center justify-center text-rose-700 mb-2">
                <AdvertenciaIcono size={32} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-black">
                  ¿ELIMINAR CONTACTO?
                </h3>
                <p className="text-[13px] text-black/40 font-bold leading-relaxed uppercase tracking-widest">
                  ESTÁS POR DESACTIVAR A{" "}
                  <span className="text-black">
                    {contactoAEliminar.razonSocial ||
                      `${contactoAEliminar.nombre} ${contactoAEliminar.apellido}`}
                  </span>
                  . ESTA ACCIÓN OCULTARÁ AL CONTACTO DE LAS LISTAS ACTIVAS PERO
                  MANTENDRÁ SU HISTORIAL.
                </p>
              </div>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setContactoAEliminar(null)}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-md bg-black/5 border border-black/10 text-[12px] font-black uppercase tracking-widest hover:bg-black/10  disabled:opacity-50"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleConfirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-md bg-rose-700 text-black text-[12px] font-black uppercase tracking-widest hover:bg-rose-600  shadow-lg shadow-rose-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {eliminando ? (
                    <div className="w-3 h-3 border-2 border-[var(--border-subtle)] border-t-transparent rounded-full " />
                  ) : (
                    <BorrarIcono size={12} />
                  )}
                  ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaContactos;
