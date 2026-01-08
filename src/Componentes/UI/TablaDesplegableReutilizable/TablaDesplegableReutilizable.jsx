import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import MenuDeAcciones from "../TablaReutilizable/MenuDeAcciones";
import {
  AgregarIcono,
  BuscadorIcono,
  ErrorIcono,
  FiltroIcono,
} from "../../../assets/Icons";
import { useNavigate } from "react-router-dom";

/* =====================================================
   FILA DESPLEGABLE (RECURSIVA)
===================================================== */
function FilaDesplegable({
  fila,
  columnas,
  getChildren,
  nivel = 0,
  accionesProps,
}) {
  const [abierto, setAbierto] = useState(false);

  const gruposHijos = getChildren ? getChildren(fila) : [];
  const tieneHijos = gruposHijos?.some(
    (g) => Array.isArray(g.data) && g.data.length > 0
  );

  return (
    <>
      <tr className="border-b border-gray-400/30 hover:bg-gray-100/5 transition-colors">
        {columnas.map((col, index) => (
          <td
            key={col.key}
            className="p-4 align-middle text-white cursor-pointer"
            onClick={() => setAbierto(!abierto)}
          >
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: index === 0 ? nivel * 20 : 0 }}
            >
              {/* Botón desplegar */}
              {index === 0 && tieneHijos && (
                <button className="text-[var(--primary)] hover:opacity-80">
                  {abierto ? (
                    <ChevronUp
                      size={16}
                      className="text-[var(--primary-light)]"
                    />
                  ) : (
                    <ChevronDown
                      size={16}
                      className="text-[var(--primary-light)]"
                    />
                  )}
                </button>
              )}

              {/* Celda */}
              {col.renderizar ? (
                col.renderizar(fila[col.key], fila)
              ) : (
                <span className="text-sm">{fila[col.key]}</span>
              )}
            </div>
          </td>
        ))}

        {accionesProps && (
          <td className="p-4">
            <MenuDeAcciones {...accionesProps} fila={fila} />
          </td>
        )}
      </tr>

      {/* 🔁 Render recursivo */}
      {abierto &&
        gruposHijos.length > 0 &&
        gruposHijos.map((grupo) =>
          grupo.data.map((subFila) => (
            <FilaDesplegable
              key={subFila.id}
              fila={subFila}
              columnas={columnas}
              getChildren={getChildren}
              nivel={nivel + 1}
              accionesProps={accionesProps}
            />
          ))
        )}
    </>
  );
}

/* =====================================================
   TABLA REUTILIZABLE
===================================================== */
function TablaDesplegableReutilizable({
  columnas,
  datos,
  getChildren,

  onVer,
  onEditar,
  onEliminar,
  onDescargar,

  permisos = { ver: true, editar: true, eliminar: true, descargar: true },
  mostrarAcciones = true,

  botonAgregar = null,
  elementosSuperior = null,

  busqueda = "",
  setBusqueda = null,
  mostrarBuscador = false,
  placeholderBuscador = "Buscar...",

  mostrarFiltros = false,
  filtrosElementos = null,
  textoFiltros = "Filtros",
  filtrosAbiertosInicial = false,
}) {
  const navigate = useNavigate();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(
    filtrosAbiertosInicial
  );

  const manejarAgregarClick = () => {
    if (botonAgregar?.onClick) botonAgregar.onClick();
    if (botonAgregar?.ruta) navigate(botonAgregar.ruta);
  };

  return (
    <>
      {/* ================== HEADER ================== */}
      {(botonAgregar ||
        mostrarBuscador ||
        elementosSuperior ||
        mostrarFiltros) && (
        <div className="mb-4 space-y-3">
          <div className="flex justify-between items-center gap-4">
            {botonAgregar && (
              <button
                onClick={manejarAgregarClick}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer bg-[var(--primary)]! text-white! hover:bg-[var(--primary)]/80! h-10 px-4 shadow-md"
              >
                <AgregarIcono />
                {botonAgregar.texto || "Agregar"}
              </button>
            )}

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

              {elementosSuperior}

              {mostrarFiltros && (
                <button
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md! text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer bg-gray-700/50 text-white! hover:bg-gray-700 h-10 px-4 shadow-md border border-gray-600/30"
                >
                  <FiltroIcono color={"var(--primary)"} />
                  {textoFiltros}
                  {filtrosAbiertos ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
          </div>

          {mostrarFiltros && filtrosAbiertos && (
            <div className="bg-[var(--fill2)] border border-gray-700/30 rounded-md p-4">
              <div className="flex flex-wrap gap-3">{filtrosElementos}</div>
            </div>
          )}
        </div>
      )}

      {/* ================== TABLA ================== */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-400/30 text-white">
            <tr>
              {columnas.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left">
                  {col.etiqueta}
                </th>
              ))}
              {mostrarAcciones && <th className="px-4">Acción</th>}
            </tr>
          </thead>

          <tbody>
            {datos.map((fila) => (
              <FilaDesplegable
                key={fila.id}
                fila={fila}
                columnas={columnas}
                getChildren={getChildren}
                accionesProps={
                  mostrarAcciones
                    ? {
                        permisos,
                        onVer,
                        onEditar,
                        onEliminar,
                        onDescargar,
                      }
                    : null
                }
              />
            ))}
          </tbody>
        </table>

        {datos.length === 0 && (
          <div className="flex justify-center py-12 text-white/75">
            <ErrorIcono size={20} />
            <span className="ml-2">No se encontraron resultados</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-right text-[var(--primary)]">
        Mostrando {datos.length} registros
      </div>
    </>
  );
}

export default TablaDesplegableReutilizable;
