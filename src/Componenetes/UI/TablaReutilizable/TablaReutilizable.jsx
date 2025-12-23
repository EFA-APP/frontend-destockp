import React, { useState, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import { BorrarIcono, EditarIcono, ErrorIcono } from "../../../assets/Icons";

// Componente de tabla reutilizable
function TablaReutilizable({
  columnas,
  datos,
  onEditar,
  onEliminar,
  mostrarAcciones = true,
}) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [filasSeleccionadas, setFilasSeleccionadas] = useState([]);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Filtrado y búsqueda
  const datosFiltrados = useMemo(() => {
    return datos.filter((fila) => {
      // Búsqueda por texto
      const coincideBusqueda = columnas.some((col) => {
        const valor = fila[col.key];
        return valor
          ?.toString()
          .toLowerCase()
          .includes(terminoBusqueda.toLowerCase());
      });

      // Filtros por columna
      const coincideFiltros = Object.entries(filtros).every(
        ([key, valorFiltro]) => {
          if (!valorFiltro) return true;
          return fila[key]
            ?.toString()
            .toLowerCase()
            .includes(valorFiltro.toLowerCase());
        }
      );

      return coincideBusqueda && coincideFiltros;
    });
  }, [datos, terminoBusqueda, filtros, columnas]);

  return (
    <>
      {/* Filtros avanzados */}
      {mostrarFiltros && (
        <div className="mb-4 px-6 py-4 border-[.5px] border-gray-100/10 rounded-md bg-[var(--fill)] dark:bg-darkgray">
          <div className="grid grid-cols-4 gap-4">
            {columnas
              .filter((col) => col.filtrable)
              .map((col) => (
                <div key={col.key}>
                  <label className="block text-xs text-white! mb-2">
                    {/* {col.etiqueta} */}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filtrar por ${col.etiqueta.toLowerCase()}`}
                    value={filtros[col.key] || ""}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        [col.key]: e.target.value,
                      }))
                    }
                    className="border-[.5px] border-gray-100/10 flex h-8 rounded-md py-2 px-3 w-full placeholder:text-gray-100/50 placeholder:text-xs text-[var(--primary)] focus:outline-none focus:border-2 focus:border-[var(--primary)]"
                  />
                </div>
              ))}
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
            <thead className="border-[.5px] border-gray-400/30 rounded-2xl!">
              <tr className=" transition-colors data-[state=selected]:bg-neutral-100  text-white">
                {columnas.map((col) => (
                  <th
                    key={col.key}
                    className="h-12 px-4 text-left align-middle text-md  font-semibold py-3 whitespace-nowrap"
                  >
                    {col.etiqueta}
                  </th>
                ))}
                {mostrarAcciones && (
                  <th className="h-12 px-4 text-left align-middle text-md  font-semibold py-3 whitespace-nowrap">
                    Acción
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {datosFiltrados.map((fila) => (
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
                            <div className="absolute left-5 bottom-0 z-20 w-14 bg-[var(--fill)] rounded-r-md shadow-lg border border-gray-100/10  text-white text-[10px]!">
                              <button
                                onClick={() => {
                                  onEditar && onEditar(fila);
                                  setMenuAbiertoId(null);
                                }}
                                className="w-full px-4 py-2  text-left hover:bg-gray-600/20! flex items-center gap-2 cursor-pointer"
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

          {datosFiltrados.length === 0 && (
            <div className="w-full flex  justify-center py-12 text-white/75">
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
        Mostrando {datosFiltrados.length} de {datos.length} productos
        {filasSeleccionadas.length > 0 &&
          ` • ${filasSeleccionadas.length} seleccionados`}
      </div>
    </>
  );
}

export default TablaReutilizable;
