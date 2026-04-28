import React, { useState } from "react";
import { AgregarIcono, BuscadorIcono, CajaIcono, FiltroIcono } from "../../../assets/Icons";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  X,
  Package,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useActualizarPreferencias } from "../../../Backend/Autenticacion/queries/Usuario/useActualizarPreferencias.mutation";
import { TieneAccion } from "../TieneAccion/TieneAccion";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

/* =====================================================
   SUBCOMPONENTES INTERNOS
===================================================== */

// Helper para formatear valores numéricos con separadores de miles
const formatVal = (val) => {
  if (val === null || val === undefined) return "";

  // Si es un string, intentar convertirlo a número para ver si es de tipo numérico
  const parsed =
    typeof val === "string" && val.trim() !== "" && !isNaN(val)
      ? Number(val)
      : val;

  if (typeof parsed === "number" && !isNaN(parsed)) {
    return new Intl.NumberFormat("es-AR").format(parsed);
  }
  return val;
};

// 1. Menu de Acciones Adaptado
const ActionMenu = ({
  fila,
  acciones,
  onVer,
  onEditar,
  onEliminar,
  onDescargar,
  permisos,
}) => {
  // Si se pasan acciones personalizadas, usarlas
  if (acciones) {
    return (
      <div className="flex items-center justify-end gap-1">
        {acciones.map((accion, i) => {
          const debeMostrar = typeof accion.mostrar === 'function' ? accion.mostrar(fila) : (accion.mostrar ?? true);
          if (!debeMostrar) return null;

          const cargando =
            typeof accion.isLoading === "function"
              ? accion.isLoading(fila)
              : false;
          return (
            <button
              key={i}
              onClick={() => !cargando && accion.onClick(fila)}
              disabled={cargando}
              title={accion.label || accion.etiqueta}
              className={`p-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer border border-transparent hover:border-[var(--primary)]/20 disabled:opacity-50`}
            >
              {cargando ? (
                <Loader2 size={14} className="animate-spin text-amber-700" />
              ) : accion.icono && React.isValidElement(accion.icono) ? (
                React.cloneElement(accion.icono, { size: 14 })
              ) : (
                accion.icono
              )}
            </button>
          );
        })}
      </div>
    );
  }
  return null;
};

// 2. Fila de Datos (Soporta Simple, Jerárquico y Expandible)
const DataRow = ({
  fila,
  columnas,
  getChildren,
  renderDetalle,
  nivel = 0,
  accionesProps,
  estaExpandida = false,
  onToggleExpansion,
}) => {
  const [abiertoInterno, setAbiertoInterno] = useState(false);

  // Modo Jerárquico
  const gruposHijos = getChildren ? getChildren(fila) : [];
  const tieneHijos = gruposHijos?.some(
    (g) => Array.isArray(g.data) && g.data.length > 0,
  );

  // Modo Expandible Detalle
  const esExpandible = !!renderDetalle;

  const manejarClick = () => {
    if (tieneHijos) setAbiertoInterno(!abiertoInterno);
    if (esExpandible) onToggleExpansion();
  };

  return (
    <>
      <tr
        className={`border-b border-[var(--border-subtle)] group ${estaExpandida ? "bg-[var(--primary-subtle)]/30" : "hover:bg-[var(--surface-hover)]"}`}
      >
        {columnas.map((col, index) => (
          <td
            key={col.key}
            className={`px-4 py-3 text-[15px] text-[var(--text-primary)] ${index === 0 ? "font-medium" : ""}`}
            onClick={manejarClick}
          >
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: index === 0 ? nivel * 16 : 0 }}
            >
              {/* Icono de Toggle (Jerárquico) */}
              {index === 0 && tieneHijos && (
                <button className="text-[var(--primary)]">
                  {abiertoInterno ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
              )}

              {/* Icono de Toggle (Expandible Detalle) */}
              {index === 0 && esExpandible && !tieneHijos && (
                <button className="text-[var(--text-muted)]">
                  {estaExpandida ? (
                    <ChevronUp size={12} className="text-[var(--primary)]" />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
              )}

              <div className="truncate">
                {col.renderizar
                  ? col.renderizar(fila[col.key], fila)
                  : formatVal(fila[col.key])}
              </div>
            </div>
          </td>
        ))}

        {accionesProps && (
          <td className="px-4 py-2">
            <div className="flex justify-end">
              <ActionMenu {...accionesProps} fila={fila} />
            </div>
          </td>
        )}
      </tr>

      {/* Render recursivo (Jerárquico) */}
      {abiertoInterno &&
        tieneHijos &&
        gruposHijos.map((grupo, gIndex) =>
          grupo.data.map((subFila, fIndex) => (
            <DataRow
              key={`${subFila.id || gIndex}-${fIndex}`}
              fila={subFila}
              columnas={columnas}
              getChildren={getChildren}
              nivel={nivel + 1}
              accionesProps={accionesProps}
            />
          )),
        )}

      {/* Render Detalle (Expandible) */}
      {estaExpandida && esExpandible && (
        <tr className="bg-[var(--fill-secondary)]/10">
          <td colSpan={columnas.length + (accionesProps ? 1 : 0)}>
            <div className="p-4 overflow-hidden border-x border-[var(--primary)]/10">
              {renderDetalle(fila)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// 3. Tarjeta de Datos para Vista Móvil
const DataCard = ({
  fila,
  columnas,
  renderDetalle,
  accionesProps,
  estaExpandida,
  onToggleExpansion,
  llaveTituloMobile = null,
  todasExpandidas = false,
}) => {
  // Encontrar la columna que servirá de título
  const columnaTitulo = llaveTituloMobile
    ? columnas.find((c) => c.key === llaveTituloMobile) ||
    columnas.find((c) => c.visible !== false)
    : columnas.find((c) => c.visible !== false);

  const cardRef = React.useRef(null);

  React.useEffect(() => {
    if (estaExpandida && cardRef.current) {
      // Pequeño delay para asegurar que el contenido ya se renderizó
      setTimeout(() => {
        cardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 200);
    }
  }, [estaExpandida]);

  return (
    <div
      ref={cardRef}
      onClick={onToggleExpansion}
      className={`
                relative overflow-hidden
                p-5 rounded-md
                border-l-2 border-[var(--primary)]
                bg-[var(--surface)]
                shadow-2xl
                flex flex-col gap-2
                cursor-pointer hover:bg-[var(--primary-subtle)]/10 active:scale-[0.98]
                transition-all duration-300
                ${estaExpandida ? "ring-2 ring-[var(--primary)]/40 border-[var(--primary)]/20" : "border-[var(--border-subtle)]/30"}
            `}
    >
      <div className="flex items-center justify-between gap-4 relative z-10 w-full">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="text-[18px] font-black text-[var(--text-primary)] leading-tight break-words">
            {columnaTitulo?.renderizar
              ? columnaTitulo.renderizar(fila[columnaTitulo.key], fila)
              : formatVal(fila[columnaTitulo?.key])}
          </div>
        </div>
        {!todasExpandidas && (
          <div className={`text-[var(--primary)] transition-transform duration-300 ${estaExpandida ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} />
          </div>
        )}
      </div>

      {(estaExpandida || todasExpandidas) && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-gray-300">
            {columnas.map((col) => {
              if (col.key === columnaTitulo?.key || col.visible === false)
                return null;
              return (
                <div
                  key={col.key}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  <span className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {col.etiqueta}
                  </span>
                  <div className="text-[16px] font-medium text-[var(--text-primary)] break-words">
                    {col.renderizar
                      ? col.renderizar(fila[col.key], fila)
                      : formatVal(fila[col.key])}
                  </div>
                </div>
              );
            })}
          </div>

          {renderDetalle && (
            <div className="p-4 rounded-xl bg-[var(--primary-subtle)]/10 border border-[var(--primary)]/10 text-sm border-dashed">
              {renderDetalle(fila)}
            </div>
          )}

          {accionesProps && (
            <div className="flex justify-end gap-2">
              <ActionMenu {...accionesProps} fila={fila} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =====================================================
   COMPONENTE PRINCIPAL: DATA TABLE
===================================================== */
const DataTable = ({
  columnas = [],
  datos = [],
  getChildren = null,
  renderDetalle = null,
  acciones = null,
  onVer,
  onEditar,
  onEliminar,
  onDescargar,
  permisos = { ver: true, editar: true, eliminar: true, descargar: true },
  mostrarAcciones = true,
  botonAgregar = null,
  elementosSuperior = null,
  mobileFab = null,
  busqueda = "",
  setBusqueda = null,
  mostrarBuscador = false,
  placeholderBuscador = "Filtrar por nombre, fecha...",
  opcionesBusqueda = null,
  busquedaClave = null,
  setBusquedaClave = null,
  meta = null,
  onPageChange = null,
  onLimitChange = null,
  mostrarFiltros = false,
  filtrosElementos = null,
  textoFiltros = "Opciones de Filtro",
  filtrosAbiertosInicial = false,
  emptyMessage = "No se encontraron registros en este módulo",
  loading = false,
  isFetching = false,
  className = "",
  onRefresh = null,
  id_tabla = null,
  llaveTituloMobile = null,
  todasExpandidas = false,
}) => {
  const navigate = useNavigate();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(
    filtrosAbiertosInicial,
  );
  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    columnas.map((c) => ({ ...c, visible: true })),
  );
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const [columnaMenuAbierta, setColumnaMenuAbierta] = useState(null);
  const tableRef = React.useRef(null);

  // --- SUBCOMPONENTES DE CARGA ---
  const SkeletonRow = () => (
    <tr className="border-b border-black/5 bg-black/[0.01]">
      {columnasVisibles
        .filter((c) => c.visible !== false)
        .map((_, i) => (
          <td key={i} className="px-4 py-4.5">
            <div className="h-2.5 bg-black/10 rounded-full w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </td>
        ))}
      {mostrarAcciones && (
        <td className="px-4 py-4.5">
          <div className="flex justify-end pr-2">
            <div className="w-8 h-8 rounded-lg bg-black/5" />
          </div>
        </td>
      )}
    </tr>
  );

  const { usuario } = useAuthStore();
  const { mutate: actualizarPreferencias } = useActualizarPreferencias();
  const { tieneAccion } = usePermisosDeUsuario();

  const inicializadoRef = React.useRef(false);
  const interaccionUsuarioRef = React.useRef(false);

  const mostrarSkeleton = loading;
  const mostrarTopBar = isFetching && datos.length > 0;

  // 1. Sincronizar columnas y cargar preferencias
  React.useEffect(() => {
    setColumnasVisibles((prev) => {
      const pref = id_tabla && usuario?.preferenciasTabla?.[id_tabla];

      // Caso A: Tenemos preferencias guardadas (solo la primera vez o si no hubo interacción)
      if (
        pref &&
        pref.orden &&
        pref.visibles &&
        !interaccionUsuarioRef.current
      ) {
        const nuevas = [];
        pref.orden.forEach((key) => {
          const col = columnas.find((c) => c.key === key);
          if (col)
            nuevas.push({ ...col, visible: pref.visibles.includes(key) });
        });
        columnas.forEach((col) => {
          if (!nuevas.some((n) => n.key === col.key))
            nuevas.push({ ...col, visible: true });
        });
        inicializadoRef.current = true;
        return nuevas;
      }

      // Caso B: El componente ya tiene columnas (prev.length > 0)
      // Debemos sincronizar con las nuevas 'columnas' para detectar cambios (columnas dinámicas que llegan tarde)
      if (prev.length > 0) {
        const actualizadas = prev
          .map((p) => {
            const nuevaInfo = columnas.find((c) => c.key === p.key);
            // Actualizar info de la columna pero mantener visibilidad previa
            return nuevaInfo ? { ...nuevaInfo, visible: p.visible } : p;
          })
          .filter((p) => columnas.some((c) => c.key === p.key));

        // Agregar columnas nuevas que no estaban en 'prev'
        columnas.forEach((col) => {
          if (!actualizadas.some((a) => a.key === col.key))
            actualizadas.push({ ...col, visible: true });
        });

        inicializadoRef.current = true;
        return actualizadas;
      }

      // Caso C: Primera carga sin columnas previas y sin preferencias
      inicializadoRef.current = true;
      return columnas.map((c) => ({ ...c, visible: true }));
    });
  }, [
    columnas,
    id_tabla,
    JSON.stringify(usuario?.preferenciasTabla?.[id_tabla]),
  ]);

  // 2. Guardar preferencias
  React.useEffect(() => {
    if (
      !id_tabla ||
      !inicializadoRef.current ||
      !interaccionUsuarioRef.current ||
      columnasVisibles.length === 0
    )
      return;
    const timeout = setTimeout(() => {
      const config = {
        visibles: columnasVisibles
          .filter((c) => c.visible !== false)
          .map((c) => c.key),
        orden: columnasVisibles.map((c) => c.key),
      };
      const guardado = usuario?.preferenciasTabla?.[id_tabla];
      if (JSON.stringify(guardado) !== JSON.stringify(config)) {
        actualizarPreferencias({
          ...usuario?.preferenciasTabla,
          [id_tabla]: config,
        });
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [columnasVisibles, id_tabla]);

  const [filaExpandidaId, setFilaExpandidaId] = useState(null);

  // 3. Cerrar menú al scrollear (Fix del "flotado")
  React.useEffect(() => {
    const handleScroll = () => {
      if (columnaMenuAbierta) setColumnaMenuAbierta(null);
    };

    window.addEventListener("scroll", handleScroll, true);
    // También escuchar el scroll del contenedor de la tabla si existe
    const tableContainer = tableRef.current;
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [columnaMenuAbierta]);

  const manejarAgregarClick = () => {
    if (botonAgregar?.onClick) botonAgregar.onClick();
    if (botonAgregar?.ruta) navigate(botonAgregar.ruta);
  };

  const toggleFilaExpansion = (id) =>
    setFilaExpandidaId((prev) => (prev === id ? null : id));

  const handleHeaderClick = (e, col) => {
    if (!tieneAccion("COLUMNAS")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setColumnaMenuAbierta({
      key: col.key,
      x: rect.left,
      y: rect.bottom,
      etiqueta: col.etiqueta,
    });
  };

  const moverColumna = (key, direccion) => {
    const index = columnasVisibles.findIndex((c) => c.key === key);
    if (index === -1) return;
    interaccionUsuarioRef.current = true;
    const nuevas = [...columnasVisibles];
    if (direccion === "izquierda" && index > 0)
      [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    else if (direccion === "derecha" && index < nuevas.length - 1)
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    setColumnasVisibles(nuevas);
  };

  const [buscadorFijo, setBuscadorFijo] = useState(false);
  const buscadorRef = React.useRef(null);
  const placeholderRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (!placeholderRef.current) return;

      const rect = placeholderRef.current.getBoundingClientRect();
      // El navbar mide 56px (h-14). Si el placeholder llega a 56px de arriba, fijamos.
      if (rect.top <= 56) {
        setBuscadorFijo(true);
      } else {
        setBuscadorFijo(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Verificación inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`flex flex-col gap-4 ${className} relative`}>
      {(botonAgregar ||
        mostrarBuscador ||
        elementosSuperior ||
        mostrarFiltros) && (
          <div className="flex flex-col gap-6 mb-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {botonAgregar && (
                  <TieneAccion accion={botonAgregar?.tieneAccion}>
                    <button
                      onClick={manejarAgregarClick}
                      className="hidden md:flex items-center gap-2 px-6 py-2 bg-[var(--primary)]/10 hover:bg-[var(--primary-subtle)] border border-[var(--primary)]/20! rounded-md! font-bold! text-[13px]! uppercase! tracking-wider! cursor-pointer! text-[var(--primary)]!"
                    >
                      <AgregarIcono size={14} /> {botonAgregar.texto}
                    </button>
                  </TieneAccion>
                )}
                {mostrarFiltros && (
                  <button
                    onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                    className={`flex items-center! gap-2! px-4! py-2! rounded-lg! border! text-[13px]! font-bold! uppercase! ${filtrosAbiertos ? "bg-[var(--primary-subtle)]! text-[var(--primary)]!" : "bg-[var(--surface)]!"}`}
                  >
                    <FiltroIcono size={14} /> {textoFiltros}
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
                {elementosSuperior && (
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {elementosSuperior}
                  </div>
                )}
                {mostrarBuscador && setBusqueda && (
                  <div className="w-full lg:w-[480px] relative" ref={placeholderRef}>
                    {/* Placeholder para mantener el espacio en mobile cuando se vuelve fixed */}
                    <div className={`${buscadorFijo ? 'block md:hidden' : 'hidden'} h-[52px]`} />

                    <div className={`
                      ${buscadorFijo
                        ? "fixed top-14 left-0 w-full z-40 bg-[var(--fill)]/95 backdrop-blur-md p-3 px-4 border-b border-black/10 shadow-lg"
                        : "relative w-full"
                      } 
                      md:static md:p-0 md:bg-transparent md:border-none md:shadow-none md:z-auto transition-all duration-300
                    `}>
                      <div className="flex bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl w-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 focus-within:ring-4 focus-within:ring-[var(--primary)]/5 border-[var(--primary)]/40 group overflow-hidden">
                        {opcionesBusqueda && setBusquedaClave && (
                          <div className="relative border-r border-[var(--border-subtle)] flex items-center bg-[var(--fill-secondary)]/30 group-focus-within:bg-[var(--primary)]/5 transition-colors">
                            <select
                              value={busquedaClave}
                              onChange={(e) => setBusquedaClave(e.target.value)}
                              className="bg-transparent text-[var(--text-primary)] font-bold text-[11px] uppercase tracking-widest pl-4 pr-9 py-3 outline-none appearance-none cursor-pointer z-10"
                            >
                              {opcionesBusqueda.map((op) => (
                                <option
                                  key={op.value}
                                  value={op.value}
                                  className="text-black bg-white"
                                >
                                  {op.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={12}
                              className="absolute right-3 text-[var(--text-muted)] pointer-events-none z-0 group-focus-within:text-[var(--primary)] transition-colors"
                            />
                          </div>
                        )}
                        <div className="relative flex-1 flex items-center">
                          <div className="absolute left-4.5 text-[var(--text-theme)] group-focus-within:text-[var(--primary)]">
                            <BuscadorIcono size={18} color={"var(--primary)"} />
                          </div>
                          <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full h-11 md:h-12 pl-13 pr-12 bg-transparent outline-none text-[15px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 placeholder:font-normal"
                            placeholder={placeholderBuscador}
                          />
                          {busqueda && (
                            <button
                              onClick={() => setBusqueda("")}
                              className="absolute right-3.5 p-1.5 rounded-xl text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer active:scale-90"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {mostrarFiltros && filtrosAbiertos && (
              <div className="relative bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--primary)]/5">
                  <FiltroIcono size={14} />{" "}
                  <h4 className="text-[13px] font-bold uppercase tracking-wider">
                    Filtros Avanzados
                  </h4>
                </div>
                <div className="p-5 flex flex-wrap gap-4 items-end">
                  {filtrosElementos}
                </div>
              </div>
            )}
          </div>
        )}

      {/* VISTA MOBILE */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {mostrarSkeleton ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-black/5 rounded-2xl" />
          ))
        ) : datos.length > 0 ? (
          datos.map((fila, index) => (
            <DataCard
              key={fila.id || index}
              fila={fila}
              columnas={columnasVisibles}
              llaveTituloMobile={llaveTituloMobile}
              todasExpandidas={todasExpandidas}
              estaExpandida={filaExpandidaId === (fila.id || index)}
              onToggleExpansion={() => !todasExpandidas && toggleFilaExpansion(fila.id || index)}
              accionesProps={
                mostrarAcciones
                  ? {
                    acciones,
                    onVer,
                    onEditar,
                    onEliminar,
                    onDescargar,
                    permisos,
                  }
                  : null
              }
            />
          ))
        ) : (
          <div className="py-10 text-center opacity-40 text-black!">
            <CajaIcono size={50} className="mx-auto" color="black" />{" "}
            {emptyMessage}
          </div>
        )}
      </div>

      {/* VISTA ESCRITORIO */}
      <div
        ref={tableRef}
        className="hidden md:block w-full overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative min-h-[200px]"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--primary-light)]/20 border-b border-[var(--primary-light)]/50">
              {columnasVisibles
                .filter((c) => c.visible !== false)
                .map((col, idx) => (
                  <th
                    key={col.key}
                    onClick={(e) => handleHeaderClick(e, col)}
                    className="px-4 py-3 text-[12px] font-bold text-[var(--text-theme)] uppercase tracking-widest cursor-pointer hover:bg-[var(--surface-hover)] group/th relative"
                  >
                    <div className="flex items-center gap-1.5 ">
                      {col.etiqueta}{" "}
                      {tieneAccion("COLUMNAS") && (
                        <ChevronDown
                          size={12}
                          className={`
                             
                            ${columnaMenuAbierta?.key === col.key
                              ? "opacity-100 text-[var(--primary)] rotate-180"
                              : "opacity-30 group-hover/th:opacity-100 text-[var(--text-muted)] group-hover/th:text-[var(--primary)]"
                            }
                          `}
                        />
                      )}
                    </div>
                    {columnaMenuAbierta?.key === col.key && (
                      <>
                        <div
                          className="fixed inset-0 z-[9998] bg-transparent cursor-default"
                          onClick={(e) => {
                            e.stopPropagation();
                            setColumnaMenuAbierta(null);
                          }}
                        />
                        <div
                          className="fixed z-[9999] bg-[var(--surface)] border border-[var(--border-medium)]/50 rounded-lg shadow-2xl py-1.5 w-44     text-left"
                          style={{
                            left: `${columnaMenuAbierta.x}px`,
                            top: `${columnaMenuAbierta.y + 4}px`,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1 bg-[var(--primary)]/20 rounded-t-md border-b border-[var(--primary)]">
                            <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-wider truncate">
                              {col.etiqueta}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              interaccionUsuarioRef.current = true;
                              setColumnasVisibles((prev) =>
                                prev.map((c) =>
                                  c.key === col.key
                                    ? { ...c, visible: false }
                                    : c,
                                ),
                              );
                              setColumnaMenuAbierta(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-red-400 hover:bg-red-700/10 flex items-center gap-2 cursor-pointer "
                          >
                            <X size={12} /> Ocultar Columna
                          </button>

                          <div className="border-t border-[var(--border-subtle)] my-1" />

                          <button
                            onClick={() => {
                              moverColumna(col.key, "izquierda");
                              setColumnaMenuAbierta(null);
                            }}
                            disabled={idx === 0}
                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer  disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronUp size={12} className="-rotate-90" /> Mover
                            Izquierda
                          </button>

                          <button
                            onClick={() => {
                              moverColumna(col.key, "derecha");
                              setColumnaMenuAbierta(null);
                            }}
                            disabled={
                              idx ===
                              columnasVisibles.filter(
                                (c) => c.visible !== false,
                              ).length -
                              1
                            }
                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer  disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronUp size={12} className="rotate-90" /> Mover
                            Derecha
                          </button>

                          <div className="border-t border-[var(--border-subtle)] my-1" />

                          <button
                            onClick={() => {
                              interaccionUsuarioRef.current = true;
                              const nuevas = [...columnasVisibles];
                              const colItem = nuevas.find(
                                (c) => c.key === col.key,
                              );
                              const filtradas = nuevas.filter(
                                (c) => c.key !== col.key,
                              );
                              setColumnasVisibles([colItem, ...filtradas]);
                              setColumnaMenuAbierta(null);
                            }}
                            disabled={idx === 0}
                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer  disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronUp
                              size={12}
                              className="text-[var(--primary)]"
                            />{" "}
                            Mover al Inicio
                          </button>

                          <button
                            onClick={() => {
                              interaccionUsuarioRef.current = true;
                              const nuevas = [...columnasVisibles];
                              const colItem = nuevas.find(
                                (c) => c.key === col.key,
                              );
                              const filtradas = nuevas.filter(
                                (c) => c.key !== col.key,
                              );
                              setColumnasVisibles([...filtradas, colItem]);
                              setColumnaMenuAbierta(null);
                            }}
                            disabled={
                              idx ===
                              columnasVisibles.filter(
                                (c) => c.visible !== false,
                              ).length -
                              1
                            }
                            className="w-full px-3 py-1.5 text-left text-[13px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer  disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ChevronUp
                              size={12}
                              className="rotate-180 text-[var(--primary)]"
                            />{" "}
                            Mover al Final
                          </button>
                        </div>
                      </>
                    )}
                  </th>
                ))}
              {mostrarAcciones && (
                <th className="px-4 py-3 text-[12px] font-bold text-[var(--text-theme)] uppercase text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="  ">
            {mostrarSkeleton ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : datos.length > 0 ? (
              datos.map((fila, index) => (
                <DataRow
                  key={fila.id || index}
                  fila={fila}
                  columnas={columnasVisibles.filter((c) => c.visible !== false)}
                  getChildren={getChildren}
                  renderDetalle={renderDetalle}
                  estaExpandida={filaExpandidaId === (fila.id || index)}
                  onToggleExpansion={() =>
                    toggleFilaExpansion(fila.id || index)
                  }
                  accionesProps={
                    mostrarAcciones
                      ? {
                        acciones,
                        onVer,
                        onEditar,
                        onEliminar,
                        onDescargar,
                        permisos,
                      }
                      : null
                  }
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columnasVisibles.filter((c) => c.visible !== false).length +
                    1
                  }
                  className="py-20 text-center opacity-30 text-black"
                >
                  <Package size={40} className="mx-auto mb-2 text-black" />{" "}
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1">
        <p className="text-[12px] font-bold text-[var(--text-theme)] uppercase tracking-widest">
          Total: {meta?.total || datos.length} registros
        </p>
        {meta && (
          <div className="flex items-center gap-4">
            <select
              value={meta.perPage || 10}
              onChange={(e) =>
                onLimitChange && onLimitChange(Number(e.target.value))
              }
              className="bg-[var(--surface)] border border-black/10 text-black text-[13px] font-bold rounded px-2 py-1 outline-none appearance-none"
            >
              {[10, 20, 50, 100].map((v) => (
                <option key={v} value={v} className="text-black">
                  {v} FILAS
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg p-1">
              <button
                disabled={!meta.prev}
                onClick={() => onPageChange && onPageChange(meta.prev)}
                className="px-3 py-1 text-[13px] font-bold text-black hover:text-[var(--primary)]  disabled:opacity-30"
              >
                Anterior
              </button>
              <span className="text-[13px] font-black text-black/90">
                {meta.currentPage} / {meta.lastPage || 1}
              </span>
              <button
                disabled={!meta.next}
                onClick={() => onPageChange && onPageChange(meta.next)}
                className="px-3 py-1 text-[13px] font-bold text-black hover:text-[var(--primary)]  disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VISTA MOBILE: Floating Action Button (FAB) en la esquina inferior derecha */}
      {botonAgregar && (
        <div className="md:hidden fixed bottom-24 right-5 z-[10000]">
          <TieneAccion accion={botonAgregar?.tieneAccion}>
            <div className="relative group">
              <div className="absolute inset-0 bg-[var(--primary)] rounded-full blur-lg opacity-40"></div>
              <button
                onClick={manejarAgregarClick}
                className="relative w-[56px] h-[56px] bg-[var(--primary)] text-[var(--surface)] rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                title={botonAgregar.texto}
              >
                <AgregarIcono size={28} />
              </button>
            </div>
          </TieneAccion>
        </div>
      )}
    </div>
  );
};

export default DataTable;
