import React, { useState } from "react";
import {
  AgregarIcono,
  BuscadorIcono,
  ConfiguracionIcono,
  ErrorIcono,
  FiltroIcono,
} from "../../../assets/Icons";
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
              className={`p-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all cursor-pointer border border-transparent hover:border-[var(--primary)]/20 disabled:opacity-50`}
            >
              {cargando ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
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
        className={`border-b border-[var(--border-subtle)] transition-all duration-200 group ${estaExpandida ? "bg-[var(--primary-subtle)]/30" : "hover:bg-[var(--surface-hover)]"}`}
      >
        {columnas.map((col, index) => (
          <td
            key={col.key}
            className={`px-4 py-3 text-[13px] text-[var(--text-primary)] transition-colors ${index === 0 ? "font-medium" : ""}`}
            onClick={manejarClick}
          >
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: index === 0 ? nivel * 16 : 0 }}
            >
              {/* Icono de Toggle (Jerárquico) */}
              {index === 0 && tieneHijos && (
                <button className="text-[var(--primary)] transition-transform duration-200">
                  {abiertoInterno ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                </button>
              )}

              {/* Icono de Toggle (Expandible Detalle) */}
              {index === 0 && esExpandible && !tieneHijos && (
                <button className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-all">
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
        <tr className="bg-[var(--fill-secondary)]/10 animate-in fade-in duration-300">
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
}) => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  // Encontrar la columna que servirá de título
  const columnaTitulo = llaveTituloMobile
    ? columnas.find((c) => c.key === llaveTituloMobile) ||
      columnas.find((c) => c.visible !== false)
    : columnas.find((c) => c.visible !== false);

  const { acciones, onVer, onEditar, onEliminar, onDescargar, permisos } =
    accionesProps || {};

  const availableStandardActions = [
    {
      key: "ver",
      show: permisos?.ver !== false && onVer,
      icon: <Eye size={20} className="text-blue-400" />,
      onClick: onVer,
    },
    {
      key: "editar",
      show: permisos?.editar !== false && onEditar,
      icon: <Edit size={20} className="text-amber-500" />,
      onClick: onEditar,
    },
    {
      key: "descargar",
      show: permisos?.descargar !== false && onDescargar,
      icon: <Download size={20} className="text-emerald-500" />,
      onClick: onDescargar,
    },
    {
      key: "eliminar",
      show: permisos?.eliminar !== false && onEliminar,
      icon: <Trash2 size={20} className="text-red-500" />,
      onClick: onEliminar,
    },
  ].filter((a) => a.show);

  return (
    <>
      <div
        onClick={() => setActionSheetOpen(true)}
        className={`
                relative overflow-hidden
                p-5 rounded-2xl 
                border-t border-l border-white/10
                bg-gradient-to-br from-[var(--surface)]/80 to-[var(--surface)]/40
                backdrop-blur-xl shadow-2xl
                flex flex-col gap-5 
                animate-in fade-in slide-in-from-bottom-5 duration-500
                cursor-pointer hover:bg-gradient-to-br hover:from-[var(--primary-subtle)]/10 active:scale-[0.98] transition-all
                ${estaExpandida ? "ring-2 ring-[var(--primary)]/40 border-white/20" : "border-[var(--border-subtle)]/30"}
            `}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10 w-full">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                {columnaTitulo?.etiqueta}
              </span>
            </div>
            <div className="text-[16px] font-black text-[var(--text-primary)] leading-tight break-words">
              {columnaTitulo?.renderizar
                ? columnaTitulo.renderizar(fila[columnaTitulo.key], fila)
                : formatVal(fila[columnaTitulo?.key])}
            </div>
          </div>
          <div className="text-[var(--primary)] text-right">
            <MoreHorizontal size={20} />
          </div>
        </div>
      </div>

      {actionSheetOpen && accionesProps && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end pointer-events-auto">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setActionSheetOpen(false)}
          ></div>
          <div className="relative bg-[#111111] w-full rounded-t-[40px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] flex flex-col animate-in slide-in-from-bottom duration-500 pb-safe pb-8">
            <div
              className="w-full flex justify-center pt-5 pb-4"
              onClick={() => setActionSheetOpen(false)}
            >
              <div className="w-14 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>

            <div className="px-7">
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--primary)] font-bold">
                    Detalles de Registro
                  </span>
                  <h3 className="text-white font-black text-xl tracking-tight leading-tight">
                    {columnas[0]?.renderizar
                      ? columnas[0].renderizar(fila[columnas[0].key], fila)
                      : formatVal(fila[columnas[0]?.key])}
                  </h3>
                </div>
                <button
                  onClick={() => setActionSheetOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-white/5 mb-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                {columnas.map((col) => {
                  if (col.key === columnaTitulo?.key || col.visible === false)
                    return null;
                  return (
                    <div
                      key={col.key}
                      className="flex flex-col gap-1 overflow-hidden"
                    >
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {col.etiqueta}
                      </span>
                      <div className="text-[14px] font-medium text-white break-words">
                        {col.renderizar
                          ? col.renderizar(fila[col.key], fila)
                          : formatVal(fila[col.key])}
                      </div>
                    </div>
                  );
                })}
              </div>

              {renderDetalle && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 mb-6 text-sm overflow-y-auto max-h-[30vh] border-dashed">
                  {renderDetalle(fila)}
                </div>
              )}

              <div className="mb-4 pt-2 border-t border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-black">
                  Acciones Disponibles
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
                {acciones ? (
                  acciones.map((accion, i) => {
                    const cargando =
                      typeof accion.isLoading === "function"
                        ? accion.isLoading(fila)
                        : false;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (!cargando) {
                            setActionSheetOpen(false);
                            accion.onClick(fila);
                          }
                        }}
                        disabled={cargando}
                        className="group relative w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 gap-5 text-white hover:bg-white/10 active:scale-[0.97] transition-all disabled:opacity-50"
                      >
                        <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          {cargando ? (
                            <div className="w-5 h-5 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
                          ) : accion.icono &&
                            React.isValidElement(accion.icono) ? (
                            React.cloneElement(accion.icono, {
                              size: 20,
                              className: "text-[var(--primary)]",
                            })
                          ) : (
                            accion.icono
                          )}
                        </div>
                        <span className="font-bold text-sm tracking-wide">
                          {accion.etiqueta || accion.label || "Acción"}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <>
                    {availableStandardActions.map((accion) => (
                      <button
                        key={accion.key}
                        onClick={() => {
                          setActionSheetOpen(false);
                          accion.onClick(fila);
                        }}
                        className={`w-full h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 gap-5 text-white hover:bg-white/10 active:scale-[0.97] transition-all group`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-white/5`}
                        >
                          {React.cloneElement(accion.icon, { size: 20 })}
                        </div>
                        <span className="font-bold text-sm tracking-wide">
                          {accion.key === "ver" && "Visualizar Registro"}
                          {accion.key === "editar" && "Editar Información"}
                          {accion.key === "descargar" && "Descargar Documentos"}
                          {accion.key === "eliminar" &&
                            "Eliminar permanentemente"}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>

              <button
                onClick={() => setActionSheetOpen(false)}
                className="w-full h-14 mt-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/50 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/10 hover:text-white active:scale-[0.97] transition-all mb-4"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
    <tr className="border-b border-white/5 animate-pulse bg-white/[0.01]">
      {columnasVisibles
        .filter((c) => c.visible !== false)
        .map((_, i) => (
          <td key={i} className="px-4 py-4.5">
            <div className="h-2.5 bg-white/10 rounded-full w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            </div>
          </td>
        ))}
      {mostrarAcciones && (
        <td className="px-4 py-4.5">
          <div className="flex justify-end pr-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </td>
      )}
    </tr>
  );

  const TopProgressBar = () => (
    <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden z-[60] bg-transparent">
      <div className="h-full bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent w-1/2 animate-loading-bar shadow-[0_0_15px_var(--primary)]" />
    </div>
  );

  const { usuario } = useAuthStore();
  const { mutate: actualizarPreferencias } = useActualizarPreferencias();
  const { tieneAccion } = usePermisosDeUsuario();

  const inicializadoRef = React.useRef(false);
  const interaccionUsuarioRef = React.useRef(false);

  const mostrarSkeleton = loading && datos.length === 0;
  const mostrarTopBar = isFetching && datos.length > 0;

  // 1. Sincronizar columnas y cargar preferencias
  React.useEffect(() => {
    setColumnasVisibles((prev) => {
      const pref = id_tabla && usuario?.preferenciasTabla?.[id_tabla];
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
      if (inicializadoRef.current && prev.length > 0) {
        const actualizadas = prev
          .map((p) => {
            const nuevaInfo = columnas.find((c) => c.key === p.key);
            return nuevaInfo ? { ...nuevaInfo, visible: p.visible } : p;
          })
          .filter((p) => columnas.some((c) => c.key === p.key));
        columnas.forEach((col) => {
          if (!actualizadas.some((a) => a.key === col.key))
            actualizadas.push({ ...col, visible: true });
        });
        return actualizadas;
      }
      return prev.length > 0
        ? prev
        : columnas.map((c) => ({ ...c, visible: true }));
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

  return (
    <div className={`flex flex-col gap-4 ${className} relative`}>
      <style>{`
        @keyframes loading-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-loading-bar { animation: loading-bar 1.5s infinite linear; }
        .animate-shimmer { animation: shimmer 1.5s infinite linear; }
      `}</style>

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
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)]! text-white! rounded-md! font-bold! text-[11px]! uppercase! tracking-wider! cursor-pointer!"
                  >
                    <AgregarIcono size={14} /> {botonAgregar.texto}
                  </button>
                </TieneAccion>
              )}
              {mostrarFiltros && (
                <button
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className={`flex items-center! gap-2! px-4! py-2! rounded-lg! border! text-[11px]! font-bold! uppercase! ${filtrosAbiertos ? "bg-[var(--primary-subtle)]! text-[var(--primary)]!" : "bg-[var(--surface)]!"}`}
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
                <div className="flex bg-[var(--surface)]/40 backdrop-blur-md border border-[var(--border-medium)]/50 rounded-xl md:rounded-md w-full lg:w-96 focus-within:border-[var(--primary)] transition-all">
                  {opcionesBusqueda && setBusquedaClave && (
                    <select
                      value={busquedaClave}
                      onChange={(e) => setBusquedaClave(e.target.value)}
                      className="bg-transparent border-r text-white! border-[var(--border-medium)] px-3 text-[12px] font-bold outline-none cursor-pointer"
                    >
                      {opcionesBusqueda.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)]">
                      <BuscadorIcono size={14} />
                    </div>
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full h-10 pl-10 pr-10 bg-transparent outline-none text-[13px] text-[var(--text-primary)]"
                      placeholder={placeholderBuscador}
                    />
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {mostrarFiltros && filtrosAbiertos && (
            <div className="relative bg-[var(--surface)]/60 backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--primary)]/5">
                <FiltroIcono size={14} />{" "}
                <h4 className="text-[11px] font-bold uppercase tracking-wider">
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
            <div
              key={i}
              className="h-32 bg-white/5 rounded-2xl animate-pulse"
            />
          ))
        ) : datos.length > 0 ? (
          datos.map((fila, index) => (
            <DataCard
              key={fila.id || index}
              fila={fila}
              columnas={columnasVisibles}
              llaveTituloMobile={llaveTituloMobile}
              estaExpandida={filaExpandidaId === (fila.id || index)}
              onToggleExpansion={() => toggleFilaExpansion(fila.id || index)}
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
          <div className="py-10 text-center opacity-40">
            <Package size={30} className="mx-auto" /> {emptyMessage}
          </div>
        )}
      </div>

      {/* VISTA ESCRITORIO */}
      <div
        ref={tableRef}
        className="hidden md:block w-full overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative min-h-[200px]"
      >
        {mostrarTopBar && <TopProgressBar />}
        {loading && !mostrarSkeleton && (
          <div className="absolute inset-0 z-[50] bg-[var(--surface)]/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--fill-secondary)]/30 border-b border-[var(--border-subtle)]">
              {columnasVisibles
                .filter((c) => c.visible !== false)
                .map((col, idx) => (
                  <th
                    key={col.key}
                    onClick={(e) => handleHeaderClick(e, col)}
                    className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest cursor-pointer hover:bg-[var(--surface-hover)] group/th relative"
                  >
                    <div className="flex items-center gap-1.5 transition-colors">
                      {col.etiqueta}{" "}
                      {tieneAccion("COLUMNAS") && (
                        <ChevronDown
                          size={12}
                          className={`
                            transition-all duration-300
                            ${
                              columnaMenuAbierta?.key === col.key
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
                          className="fixed z-[9999] bg-[var(--surface)] border border-[var(--border-medium)]/50 rounded-lg shadow-2xl py-1.5 w-44 animate-in fade-in zoom-in-95 duration-150 text-left"
                          style={{
                            left: `${columnaMenuAbierta.x}px`,
                            top: `${columnaMenuAbierta.y + 4}px`,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-1 border-b border-[var(--border-subtle)] mb-1">
                            <p className="text-[9px] font-black text-[var(--text-primary)] uppercase tracking-wider truncate">
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
                            className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
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
                            className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
                            className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
                            className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
                            className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
                <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="animate-in fade-in duration-700">
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
                  className="py-20 text-center opacity-30"
                >
                  <Package size={40} className="mx-auto mb-2" /> {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Total: {meta?.total || datos.length} registros
        </p>
        {meta && (
          <div className="flex items-center gap-4">
            <select
              value={meta.perPage || 10}
              onChange={(e) =>
                onLimitChange && onLimitChange(Number(e.target.value))
              }
              className="bg-transparent border border-[var(--border-subtle)] text-[11px] font-bold rounded px-2 py-1"
            >
              {[10, 20, 50, 100].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg p-1">
              <button
                disabled={!meta.prev}
                onClick={() => onPageChange && onPageChange(meta.prev)}
                className="px-3 py-1 text-[11px] font-bold disabled:opacity-30"
              >
                Anterior
              </button>
              <span className="text-[11px] font-black">
                {meta.currentPage} / {meta.lastPage || 1}
              </span>
              <button
                disabled={!meta.next}
                onClick={() => onPageChange && onPageChange(meta.next)}
                className="px-3 py-1 text-[11px] font-bold disabled:opacity-30"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
