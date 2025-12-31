import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import {
  BorrarIcono,
  EditarIcono,
  ErrorIcono,
  AgregarIcono,
  BuscadorIcono,
  FiltroIcono, // 👈 Asegúrate de importar este icono
} from "../../../assets/Icons";
import MenuDeAcciones from "./MenuDeAcciones";

// Componente de tabla reutilizable
function TablaReutilizable({
  columnas,
  datos,
  onVer,
  onDescargar,
  onEditar,
  onEliminar,
  permisos = { ver: true, editar: true, eliminar: true, descargar: true },
  mostrarAcciones = true,
  botonAgregar = null,
  elementosSuperior = null,
  busqueda = "",
  setBusqueda = null,
  mostrarBuscador = false,
  placeholderBuscador = "Buscar...",
  // 👇 NUEVAS PROPS PARA EL SISTEMA DE FILTROS
  mostrarFiltros = false,
  filtrosElementos = null,
  textoFiltros = "Filtros",
  filtrosAbiertosInicial = false,
}) {
  const navigate = useNavigate();
  const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(
    filtrosAbiertosInicial
  );

  const manejarAgregarClick = () => {
    if (botonAgregar?.onClick) {
      botonAgregar.onClick();
    }
    if (botonAgregar?.ruta) {
      navigate(botonAgregar.ruta);
    }
  };

  return (
    <>
      {/* Sección superior con botón agregar, buscador y botón de filtros */}
      {(botonAgregar ||
        mostrarBuscador ||
        elementosSuperior ||
        mostrarFiltros) && (
        <div className="mb-4 space-y-3">
          {/* Primera fila: Botón agregar, buscador y botón de filtros */}
          <div className="flex justify-between items-center gap-4">
            {/* Botón agregar */}
            {botonAgregar && (
              <button
                onClick={manejarAgregarClick}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-10 px-4 shadow-md"
              >
                <AgregarIcono />
                {botonAgregar.texto || "Agregar"}
              </button>
            )}

            {/* Contenedor derecho con buscador, elementos y botón filtros */}
            <div className="flex items-center gap-3">
              {/* Buscador */}
              {mostrarBuscador && setBusqueda && (
                <div className="relative w-[220px]">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border-[.5px]! border-gray-100/10! flex h-10 rounded-md! disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-0 border-ld placeholder:text-gray-100/50! focus-visible:ring-0 z-10 w-full pl-8 placeholder:text-xs text-[var(--primary)]! focus:outline-none focus:border-2 focus:border-[var(--primary)]! shadow-md"
                    placeholder={placeholderBuscador}
                  />
                  <div className="absolute top-2 left-2">
                    <BuscadorIcono />
                  </div>
                </div>
              )}

              {/* Elementos personalizados (que no sean filtros) */}
              {elementosSuperior}

              {/* Botón para abrir/cerrar filtros */}
              {mostrarFiltros && (
                <button
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer bg-gray-700/50 text-white! hover:bg-gray-700 h-10 px-4 shadow-md border border-gray-600/30"
                >
                  <FiltroIcono color={"var(--primary)"} />
                  {textoFiltros}
                  {filtrosAbiertos ? (
                    <ChevronUp size={16} className="text-white" />
                  ) : (
                    <ChevronDown size={16} className="text-white" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Segunda fila: Panel de filtros (colapsable) */}
          {mostrarFiltros && filtrosAbiertos && (
            <div className="bg-[var(--fill2)]! border border-gray-700/30 rounded-md p-4 shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap gap-3">{filtrosElementos}</div>
            </div>
          )}
        </div>
      )}

      {/* Tabla */}
      <div
        className="overflow-x-auto"
        style={{ opacity: 1, transform: "none" }}
      >
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-[.5px] border-gray-400/30">
              <tr className="transition-colors data-[state=selected]:bg-neutral-100 text-white">
                {columnas.map((col) => (
                  <th
                    key={col.key}
                    className="h-12 px-4 text-left align-middle text-md font-semibold py-3 whitespace-nowrap"
                  >
                    {col.etiqueta}
                  </th>
                ))}
                {mostrarAcciones && (
                  <th className="h-12 px-4 text-left align-middle text-md font-semibold py-3 whitespace-nowrap">
                    Acción
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {datos.map((fila) => (
                <tr
                  key={fila.id}
                  className="border-b border-gray-400/30 transition-colors hover:bg-gray-100/5 data-[state=selected]:bg-neutral-100"
                >
                  {columnas.map((col) => (
                    <td key={col.key} className="p-4 align-middle text-white">
                      {col.renderizar ? (
                        col.renderizar(fila[col.key], fila)
                      ) : (
                        <span className="text-sm">{fila[col.key]}</span>
                      )}
                    </td>
                  ))}
                  {mostrarAcciones && (
                    <td className="p-4">
                      <div className="w-auto">
                        {
                          <>
                            <MenuDeAcciones
                              permisos={permisos}
                              onDescargar={onDescargar}
                              onVer={onVer}
                              onEditar={onEditar}
                              onEliminar={onEliminar}
                              fila={fila}
                              setMenuAbiertoId={setMenuAbiertoId}
                            />
                          </>
                        }
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {datos.length === 0 && (
            <div className="w-full flex justify-center py-12 text-white/75">
              <p className="flex justify-center items-center gap-2">
                <span className="text-red-400">
                  <ErrorIcono size={20} />
                </span>
                No se encontraron resultados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 text-xs w-full flex justify-end text-[var(--primary)]">
        Mostrando {datos.length} registros
        {filasSeleccionadas.length > 0 &&
          ` • ${filasSeleccionadas.length} seleccionados`}
      </div>
    </>
  );
}

export default TablaReutilizable;
