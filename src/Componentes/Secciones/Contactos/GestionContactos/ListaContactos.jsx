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
              className="px-0.5 rounded-[2px] border border-[var(--primary)]/50 text-[var(--primary)] bg-[var(--primary)]/5"
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
      <div className="px-5 py-3 border-b border-black/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02]">
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-30 group-focus-within:opacity-100 ">
            <CuentaIcono size={12} />
          </div>
          <input
            type="text"
            placeholder={`BUSCAR POR NOMBRE, DNI O CÓDIGO...`}
            value={busquedaLocal}
            onChange={(e) => setBusquedaLocal(e.target.value)}
            className="w-full bg-black/5 border border-black/10 rounded-md pl-9 pr-4 py-1.5 text-[12px] font-black text-black focus:outline-none focus:border-[var(--primary)]  placeholder:text-black/20 uppercase tracking-widest"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <TieneAccion accion="CREAR_CONTACTO">
            <button
              onClick={handleNuevo}
              className="flex items-center justify-center gap-2 px-4 py-1.5 bg-[var(--primary)] text-black! rounded-md text-[12px] font-black uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95  shadow-lg shadow-[var(--primary)]/10 cursor-pointer"
            >
              <AgregarIcono size={12} />
              NUEVO {entidad?.nombre || "CONTACTO"}
            </button>
          </TieneAccion>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {cargando ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full " />
            <span className="text-[12px] font-black uppercase tracking-widest">
              Cargando contactos...
            </span>
          </div>
        ) : contactos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-20">
            <CuentaIcono size={64} />
            <span className="text-sm font-black uppercase tracking-[0.2em] mt-4">
              Sin resultados
            </span>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.04] sticky top-0 z-10 backdrop-blur-md">
                <tr className="text-[13px] font-black text-black/50 uppercase tracking-[0.1em] border-b border-black/10">
                  <th className="px-5 py-3">CÓDIGO</th>
                  <th className="px-5 py-3">NOMBRE/APELLIDO</th>
                  <th className="px-5 py-3">SALDO</th>
                  {!entidad && <th className="px-5 py-3">TIPO</th>}
                  <th className="px-5 py-3 text-right">CONTROLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {contactos.map((c) => (
                  <tr key={c.codigoSecuencial} className="  group relative">
                    <td className="px-5 py-2.5 text-[12px] font-black text-black/40 ">
                      {HighlightText(
                        c.codigoSecuencial.toString().padStart(4, "0"),
                        busquedaLocal,
                      )}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-2">
                            {/* // en mayuscula todo */}
                            <span className="text-[14px] font-bold text-black ">
                              {HighlightText(
                                c.razonSocial?.toUpperCase() ||
                                  `${c.nombre?.toUpperCase()} ${c.apellido?.toUpperCase()}`,
                                busquedaLocal?.toUpperCase(),
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-[12px] text-[var(--primary-light)]  ">
                              <p className="font-bold text-black/40">
                                Documento:{" "}
                              </p>
                              {HighlightText(
                                c.documento || "---",
                                busquedaLocal,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col">
                        <span
                          className={`text-[13px] font-black tracking-tight ${
                            (c.atributos?.saldo || 0) > 0
                              ? "text-rose-400"
                              : (c.atributos?.saldo || 0) < 0
                                ? "text-emerald-400"
                                : "text-black/20"
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
                      <td className="px-5 py-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-black/5 border border-black/10 text-[10px] font-black uppercase tracking-wider text-black/40">
                          {c.tipoEntidad}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-2.5 text-right">
                      <div className="flex justify-end ">
                        <MenuDeAccionesGenerico acciones={acciones} fila={c} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-black/5 bg-white/[0.01] flex items-center justify-between">
              <span className="text-[12px] font-black text-black/20 uppercase tracking-widest">
                Mostrando {contactos.length} de {total} contactos
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={filtros.pagina === 1}
                  onClick={() =>
                    setFiltros((p) => ({ ...p, pagina: p.pagina - 1 }))
                  }
                  className="p-2 rounded-md bg-black/5 border border-black/10 text-black/40 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed "
                >
                  <svg
                    width="14"
                    height="14"
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

                <div className="px-4 py-1.5 bg-black/5 border border-black/10 rounded-md">
                  <span className="text-[12px] font-black text-[var(--primary)]">
                    {filtros.pagina}
                  </span>
                  <span className="text-[12px] font-black text-black/10 mx-2">
                    /
                  </span>
                  <span className="text-[12px] font-black text-black/40">
                    {paginas}
                  </span>
                </div>

                <button
                  disabled={filtros.pagina === paginas}
                  onClick={() =>
                    setFiltros((p) => ({ ...p, pagina: p.pagina + 1 }))
                  }
                  className="p-2 rounded-md bg-black/5 border border-black/10 text-black/40 hover:text-black disabled:opacity-20 disabled:cursor-not-allowed "
                >
                  <svg
                    width="14"
                    height="14"
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
          <div className="bg-[#0a0a0a] border border-black/10 rounded-xl max-w-md w-full p-6 shadow-2xl   ">
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
