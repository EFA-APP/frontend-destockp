import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import {
  BorrarIcono,
  EditarIcono,
  ErrorIcono,
  AgregarIcono,
  BuscadorIcono,
} from "../../../assets/Icons";

// Componente de tabla reutilizable
function TablaReutilizable({
  columnas,
  datos,
  onEditar,
  onEliminar,
  mostrarAcciones = true,
  botonAgregar = null,
  elementosSuperior = null,
  busqueda = "",
  setBusqueda = null,
  mostrarBuscador = false,
  placeholderBuscador = "Buscar...",
}) {
  const navigate = useNavigate();
  const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

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
      {/* Sección superior con botón agregar, buscador y elementos personalizados */}
      {(botonAgregar || mostrarBuscador || elementosSuperior) && (
        <div className="flex justify-between items-center mb-4 gap-4">
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

          {/* Contenedor derecho con buscador y elementos personalizados */}
          <div className="flex items-center gap-3">
            {/* Buscador controlado desde el padre (busca en backend) */}
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

            {/* Elementos personalizados (filtros, selectores, etc) */}
            {elementosSuperior}
          </div>
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
                    <td className="p-4 align-middle">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuAbiertoId(
                              menuAbiertoId === fila.id ? null : fila.id
                            )
                          }
                          className="p-1 hover:bg-gray-100/10 rounded transition-colors cursor-pointer"
                        >
                          <MoreVertical size={18} className="text-white" />
                        </button>

                        {menuAbiertoId === fila.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuAbiertoId(null)}
                            ></div>
                            <div className="absolute right-10 bottom-0 z-20 w-14 bg-[var(--fill)] rounded-r-md shadow-lg border border-gray-100/10 text-white text-[10px]!">
                              <button
                                onClick={() => {
                                  onEditar && onEditar(fila);
                                  setMenuAbiertoId(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-600/20! flex items-center gap-2 cursor-pointer"
                              >
                                <EditarIcono size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  onEliminar && onEliminar(fila.id);
                                  setMenuAbiertoId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-red-400! bg-red-400/20! hover:bg-red-400/10! flex items-center gap-2 cursor-pointer"
                              >
                                <BorrarIcono size={18} />
                              </button>
                            </div>
                          </>
                        )}
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
