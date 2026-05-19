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
import DataTable from "../../../UI/DataTable/DataTable";

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

  const columnas = [
    {
      key: "codigoSecuencial",
      etiqueta: "Código",
      renderizar: (valor) => (
        <span className="bg-[var(--fill-secondary)] px-2 py-0.5 rounded text-[11px] font-black">
          {valor.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "contacto",
      etiqueta: "Nombre / Razón Social",
      renderizar: (_, fila) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold text-[var(--text-primary)]">
            {fila.razonSocial?.toUpperCase() ||
              `${fila.nombre?.toUpperCase()} ${fila.apellido?.toUpperCase()}`}
          </span>
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="text-[10px] font-black uppercase tracking-wider">
              {fila.documento ? "DNI/CUIT:" : ""}
            </span>
            <span className="text-[11px] font-medium">{fila.documento}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      <DataTable
        id_tabla={`contactos_${entidad?.clave || "general"}`}
        columnas={columnas}
        datos={contactos}
        loading={cargando}
        meta={{
          total,
          paginas,
          paginaActual: filtros.pagina,
          limite: filtros.limite,
        }}
        onPageChange={(pagina) => setFiltros((prev) => ({ ...prev, pagina }))}
        onLimitChange={(limite) =>
          setFiltros((prev) => ({ ...prev, limite, pagina: 1 }))
        }
        mostrarBuscador
        busqueda={busquedaLocal}
        setBusqueda={setBusquedaLocal}
        mostrarAcciones
        acciones={acciones}
        botonAgregar={{
          texto: `Crear`,
          onClick: () => {
            setContactoEditar(null);
            setMostrarFormulario(true);
          },
          tieneAccion: "CREAR_CONTACTO",
        }}
      />

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm   ">
          <div className="bg-[var(--fill)] border border-[var(--fill-secondary)]/20 rounded-md max-w-md w-full p-6 shadow-2xl   ">
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
                  className="flex-1 py-3 rounded-md bg-[var(--primary)]/30! text-black text-[12px] border border-[var(--primary)]! font-black uppercase tracking-widest hover:bg-[var(--primary)]/10!  disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
