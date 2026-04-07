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
            className={`px-4 py-2.5 text-[13px] text-[var(--text-primary)] transition-colors ${index === 0 ? "font-medium" : ""}`}
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
                <button className="text-[var(--text-muted)] group-hover:text-[var(--primary)]">
                  {estaExpandida ? (
                    <ChevronUp size={12} />
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
          <td className="px-4 py-[.5px]">
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
  llaveTituloMobile = null, // <- Nuevo prop
}) => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  // Encontrar la columna que servirá de título
  // Prioridad: 1. llaveTituloMobile (incluso si está oculta), 2. primera columna visible
  const columnaTitulo = llaveTituloMobile 
    ? columnas.find(c => c.key === llaveTituloMobile) || columnas.find(c => c.visible !== false)
    : columnas.find(c => c.visible !== false);

  // Columnas para el cuerpo: Las que son VISIBLES y NO son la del título
  const columnasCuerpo = columnas.filter(c => c.visible !== false && c.key !== columnaTitulo?.key);

  // Extraer propiedades para crear botones en el sheet
  const { acciones, onVer, onEditar, onEliminar, onDescargar, permisos } =
    accionesProps || {};

  // Determinar qué acciones están disponibles para decidir si mostrar 3 puntos o botón directo
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

  const totalActionsCount = acciones
    ? acciones.length
    : availableStandardActions.length;
  const isSingleAction = totalActionsCount === 1;
  const singleAction = isSingleAction
    ? acciones
      ? acciones[0]
      : availableStandardActions[0]
    : null;

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
        {/* Fondo decorativo (Efecto Glass) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header: Título Principal */}
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


      {/* ACTION SHEET MOBILE NATIVO (Bottom Sheet) */}
      {actionSheetOpen && accionesProps && (
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end pointer-events-auto">
          {/* Overlay Ultra-Blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setActionSheetOpen(false)}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none"></div>

          {/* Drawer Content Premium */}
          <div className="relative bg-[#111111] w-full rounded-t-[40px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] flex flex-col animate-in slide-in-from-bottom duration-500 pb-safe pb-8">
            {/* Indicador de Arrastre Estilizado */}
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
                  <span className="text-[10px] uppercase tracking-wider text-[var(--primary)] font-bold">Detalles de Registro</span>
                  <h3 className="text-white font-black text-xl tracking-tight leading-tight">
                    {columnas[0]?.renderizar ? columnas[0].renderizar(fila[columnas[0].key], fila) : formatVal(fila[columnas[0]?.key])}
                  </h3>
                </div>
                <button
                  onClick={() => setActionSheetOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ----- NUEVA SECCION DETALLES ----- */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-white/5 mb-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                {/* Mostramos todas las columnas VISIBLES excepto el título en el cuerpo del drawer */}
                {columnas.map((col) => {
                  if (col.key === columnaTitulo?.key || col.visible === false) return null;
                  return (
                    <div key={col.key} className="flex flex-col gap-1 overflow-hidden">
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

              {/* ----- TITULO ACCIONES ----- */}
              <div className="mb-4 pt-2 border-t border-white/5">
                 <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-black">Acciones Disponibles</span>
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

  // Modos
  getChildren = null, // Habilita modo Jerárquico
  renderDetalle = null, // Habilita modo Expandible Detalle

  // Acciones
  acciones = null, // Acciones personalizadas (MenuDeAccionesGenerico)
  onVer,
  onEditar,
  onEliminar,
  onDescargar,
  permisos = { ver: true, editar: true, eliminar: true, descargar: true },
  mostrarAcciones = true,

  // Header / Toolbar
  botonAgregar = null,
  elementosSuperior = null,
  mobileFab = null, // <- Nuevo prop para FAB

  // Buscador
  busqueda = "",
  setBusqueda = null,
  mostrarBuscador = false,
  placeholderBuscador = "Filtrar por nombre, fecha...",
  opcionesBusqueda = null,
  busquedaClave = null,
  setBusquedaClave = null,

  // Paginación API (Metadata)
  meta = null,
  onPageChange = null,
  onLimitChange = null,

  // Filtros
  mostrarFiltros = false,
  filtrosElementos = null,
  textoFiltros = "Opciones de Filtro",
  filtrosAbiertosInicial = false,

  // Otras props
  emptyMessage = "No se encontraron registros en este módulo",
  loading = false,
  className = "",
  onRefresh = null, // <- Nuevo prop para Pull to Refresh
  id_tabla = null,
  llaveTituloMobile = null, // <- Nuevo prop
}) => {
  const navigate = useNavigate();
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(
    filtrosAbiertosInicial,
  );
  const [columnasVisibles, setColumnasVisibles] = useState(() =>
    columnas.map((c) => ({ ...c, visible: true })),
  );
  const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);
  const [columnaMenuAbierta, setColumnaMenuAbierta] = useState(null); // { key: string, x: number, y: number }
  const tableRef = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = () => {
      if (columnaMenuAbierta) {
        setColumnaMenuAbierta(null);
      }
    };

    const container = tableRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll, true); // capture phase helps with nested scrolls

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [columnaMenuAbierta]);

  const { usuario } = useAuthStore();
  const { mutate: actualizarPreferencias } = useActualizarPreferencias();
  const { tieneAccion } = usePermisosDeUsuario();
  const esAdmin = usuario?.roles?.some((r) => r.nombre === "ADMINISTRADOR");

  // Ref para evitar guardar en el primer render or antes de cargar preferencias
  const inicializadoRef = React.useRef(false);

  // 1. Cargar preferencias o columnas del prop
  React.useEffect(() => {
    setColumnasVisibles((prev) => {
      const pref = id_tabla && usuario?.preferenciasTabla?.[id_tabla];
      
      // Si tenemos preferencias en el usuario, aplicarlas
      if (pref && pref.orden && pref.visibles) {
        const nuevas = [];
        pref.orden.forEach((key) => {
          const col = columnas.find((c) => c.key === key);
          if (col)
            nuevas.push({ ...col, visible: pref.visibles.includes(key) });
        });
        // Agregar columnas que no estaban en las preferencias (nuevas columnas de código)
        columnas.forEach((col) => {
          if (!nuevas.some((n) => n.key === col.key))
            nuevas.push({ ...col, visible: true });
        });
        
        inicializadoRef.current = true;
        return nuevas;
      }

      // Si no hay preferencias pero ya tenemos columnas previas, intentar mantenerlas
      if (prev.length > 0) {
        return columnas.map((c) => {
          const guardado = prev.find((p) => p.key === c.key);
          return { ...c, visible: guardado ? guardado.visible : true };
        });
      }

      // Por defecto, todo visible
      return columnas.map((c) => ({ ...c, visible: true }));
    });
    
    // Marcar como inicializado si no hay preferencias pero ha cargado el usuario
    if (usuario && !usuario.preferenciasTabla?.[id_tabla]) {
        inicializadoRef.current = true;
    }
  }, [columnas, id_tabla, usuario?.preferenciasTabla]);

  // 2. Guardar preferencias si es Administrador (Debounced)
  React.useEffect(() => {
    // CONDICIONES CRÍTICAS PARA GUARDAR:
    // - Debe haber id_tabla
    // - Debe ser Admin
    // - La tabla DEBE haber sido inicializada desde las preferencias (o marcado como listo)
    // - NO guardar si columnasVisibles está vacío (evita borrar config por error)
    if (!id_tabla || !esAdmin || !inicializadoRef.current || columnasVisibles.length === 0) return;

    const timeout = setTimeout(() => {
      const config = {
        visibles: columnasVisibles
          .filter((c) => c.visible !== false)
          .map((c) => c.key),
        orden: columnasVisibles.map((c) => c.key),
      };

      const guardado = usuario?.preferenciasTabla?.[id_tabla];
      
      // Solo disparar la petición si realmente hubo un cambio
      if (JSON.stringify(guardado) !== JSON.stringify(config)) {
        actualizarPreferencias({
          ...usuario?.preferenciasTabla,
          [id_tabla]: config,
        });
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [columnasVisibles, id_tabla, esAdmin]);
  const [filaExpandidaId, setFilaExpandidaId] = useState(null);
  const [pullStart, setPullStart] = useState(null);
  const [pullOffset, setPullOffset] = useState(0);
  const [isRefreshingState, setIsRefreshingState] = useState(false);

  const manejarAgregarClick = () => {
    if (botonAgregar?.onClick) botonAgregar.onClick();
    if (botonAgregar?.ruta) navigate(botonAgregar.ruta);
  };

  const toggleFilaExpansion = (id) => {
    setFilaExpandidaId((prev) => (prev === id ? null : id));
  };

  const handleHeaderClick = (e, col) => {
    e.preventDefault();
    e.stopPropagation();

    // Validar permiso antes de abrir el menú de columnas
    if (!tieneAccion("COLUMNAS")) return;

    if (columnaMenuAbierta?.key === col.key) {
      setColumnaMenuAbierta(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setColumnaMenuAbierta({
      key: col.key,
      x: rect.left,
      y: rect.bottom, // <- Removed window.scrollY as element uses fixed positioning
      etiqueta: col.etiqueta,
    });
  };

  const moverColumna = (key, direccion) => {
    const index = columnasVisibles.findIndex((c) => c.key === key);
    if (index === -1) return;

    const nuevas = [...columnasVisibles];
    if (direccion === "izquierda" && index > 0) {
      [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    } else if (
      direccion === "derecha" &&
      index < columnasVisibles.length - 1
    ) {
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    }
    setColumnasVisibles(nuevas);
  };

  const handleTouchStart = (e) => {
    if (window.scrollY === 0 && !isRefreshingState && onRefresh) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (pullStart === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStart;
    if (diff > 0) {
      setPullOffset(Math.min(diff * 0.4, 80)); // Escalar fuerza
    }
  };

  const handleTouchEnd = () => {
    if (pullOffset > 50 && onRefresh) {
      setIsRefreshingState(true);
      setPullOffset(50);
      onRefresh().finally(() => {
        setIsRefreshingState(false);
        setPullOffset(0);
        setPullStart(null);
      });
    } else {
      setPullOffset(0);
      setPullStart(null);
    }
  };

  return (
    <div
      className={`flex flex-col gap-4 ${className} relative`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* INDICADOR PULL TO REFRESH */}
      {pullOffset > 0 && (
        <div
          className="md:hidden absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-[100] transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${pullOffset - 50}px)` }}
        >
          <div className="bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-dark)] w-11 h-11 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center border border-white/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-white ${isRefreshingState ? "animate-spin" : ""}`}
              style={{
                transform: !isRefreshingState
                  ? `rotate(${pullOffset * 4}deg)`
                  : undefined,
              }}
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <polyline points="21 3 21 8 16 8" />
            </svg>
          </div>
        </div>
      )}
      {/* TOOLBAR SUPERIOR */}
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
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)]! text-white! rounded-md! hover:-translate-y-0.5! transition-all! duration-300! shadow-lg! shadow-[var(--primary)]/25! hover:shadow-[var(--primary)]/40! font-bold! text-[11px]! uppercase! tracking-wider! cursor-pointer! w-full md:w-auto justify-center md:justify-start"
                  >
                    <AgregarIcono size={14} />
                    {botonAgregar.texto || "Nuevo Registro"}
                  </button>
                </TieneAccion>
              )}

              {mostrarFiltros && (
                <button
                  onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                  className={`flex items-center! gap-2! px-4! py-2! rounded-lg! border! transition-all! text-[11px]! font-bold! uppercase! tracking-wider! cursor-pointer! ${
                    filtrosAbiertos
                      ? "bg-[var(--primary-subtle)]! text-[var(--primary)]! border-[var(--primary)]/30"
                      : "bg-[var(--surface)]! text-[var(--text-secondary)]! border-[var(--border-subtle)]! hover:bg-[var(--surface-hover)]!"
                  }`}
                >
                  <FiltroIcono
                    color={filtrosAbiertos ? "var(--primary)" : "currentColor"}
                    size={14}
                  />
                  {textoFiltros}
                </button>
              )}

            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
              {elementosSuperior && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {elementosSuperior}
                </div>
              )}

              {mostrarBuscador && setBusqueda && (
                <div className="flex bg-[var(--surface)]/40 backdrop-blur-md border border-[var(--border-medium)]/50 rounded-xl md:rounded-md shadow-sm w-full sm:flex-1 md:max-w-md lg:w-96 focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all duration-300">
                  {opcionesBusqueda && setBusquedaClave && busquedaClave && (
                    <select
                      value={busquedaClave}
                      onChange={(e) => setBusquedaClave(e.target.value)}
                      className="bg-transparent border-r border-[var(--border-medium)]/50 text-[12px] font-bold text-[var(--text-secondary)] px-3 outline-none cursor-pointer appearance-none min-w-[100px]"
                    >
                      {opcionesBusqueda.map((op) => (
                        <option
                          key={op.value}
                          value={op.value}
                          className="bg-[var(--surface)] text-[var(--text-primary)]"
                        >
                          {op.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="relative group/search flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)] group-focus-within/search:text-[var(--primary)] transition-colors duration-300 z-[25]">
                      <BuscadorIcono size={14} color={"var(--primary)"} />
                    </div>
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full h-11 md:h-10 pl-10 pr-10 bg-transparent outline-none text-[13px] placeholder:text-[var(--text-muted)]/50 text-[var(--text-primary)] rounded-r-xl md:rounded-r-md"
                      placeholder={placeholderBuscador}
                    />
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--surface-hover)] rounded-md text-[var(--text-muted)] hover:text-[var(--primary)] transition-all cursor-pointer"
                        title="Limpiar búsqueda"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTÓN FLOTANTE MOBILE (FAB) */}
          {mobileFab && (
            <button
              onClick={mobileFab.onClick}
              className="md:hidden fixed bottom-25 right-5 z-[90] w-[56px] h-[56px] rounded-full bg-gradient-to-tr from-[var(--primary-dark)] to-[var(--primary)] hover:to-[var(--primary-subtle)] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex items-center justify-center text-white/90 cursor-pointer active:scale-90 transition-all border border-white/10"
            >
              {mobileFab.icono}
            </button>
          )}
          {/* PANEL DE FILTROS */}
          {mostrarFiltros && filtrosAbiertos && (
            <div
              className="
                            relative overflow-hidden
                            bg-[var(--surface)]/60 backdrop-blur-xl 
                            border border-[var(--border-subtle)] 
                            rounded-xl shadow-2xl shadow-[var(--primary)]/5
                            animate-in slide-in-from-top-4 fade-in duration-500
                        "
            >
              {/* Header del Panel */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--primary)]/5">
                <div className="p-1.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)]">
                  <FiltroIcono size={14} />
                </div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
                  Filtros Avanzados
                </h4>
              </div>

              {/* Contenedor de Filtros */}
              <div className="p-5">
                <div className="flex flex-wrap gap-x-6 gap-y-4 items-end">
                  {filtrosElementos}
                </div>
              </div>

              {/* Decoración Inferior */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent opacity-30" />
            </div>
          )}
        </div>
      )}

      {/* VISTA MÓVIL (TARJETAS) */}
      <div className="md:hidden grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
        {datos.length > 0 ? (
          datos.map((fila, index) => (
            <DataCard
              key={fila.id || index}
              fila={fila}
              columnas={columnasVisibles} // Pasamos todas para que DataCard decida
              renderDetalle={renderDetalle}
              estaExpandida={filaExpandidaId === (fila.id || index)}
              onToggleExpansion={() => toggleFilaExpansion(fila.id || index)}
              llaveTituloMobile={llaveTituloMobile} // <- Pasar prop
              accionesProps={
                mostrarAcciones
                  ? {
                      acciones,
                      permisos,
                      onVer,
                      onEditar,
                      onEliminar,
                      onDescargar,
                    }
                  : null
              }
            />
          ))
        ) : (
          <div className="py-10 text-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-[var(--surface-hover)] text-[var(--text-muted)] opacity-50">
                <Package size={30} />
              </div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                {emptyMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* TABLA PRINCIPAL (ESCRITORIO) */}
      <div
        ref={tableRef}
        className="hidden md:block w-full overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative min-h-[200px]"
      >
        {/* Overlay de Carga Premium */}
        {loading && (
          <div className="absolute inset-0 z-[50] bg-[var(--surface)]/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">
                  Cargando Información
                </p>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1 opacity-70">
                  Sincronizando con el servidor...
                </p>
              </div>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--fill-secondary)]/30 border-b border-[var(--border-subtle)]">
              {columnasVisibles
                .filter((c) => c.visible !== false)
                .map((col, index) => (
                  <th
                    key={col.key}
                    onClick={(e) => handleHeaderClick(e, col)}
                    className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap cursor-pointer hover:bg-[var(--surface-hover)]/40 transition-colors group/th relative"
                  >
                    <div className="flex items-center gap-1.5 select-none">
                      {col.etiqueta}
                      {tieneAccion("COLUMNAS") && (
                        <ChevronDown
                          size={12}
                          className={`opacity-0 group-hover/th:opacity-100 transition-all ${columnaMenuAbierta?.key === col.key ? "rotate-180 opacity-100 text-[var(--primary)]" : ""}`}
                        />
                      )}
                    </div>

                    {/* Menú Contextual de Columna */}
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
                            setColumnasVisibles((prev) =>
                              prev.map((c) =>
                                c.key === col.key ? { ...c, visible: false } : c
                              )
                            );
                            setColumnaMenuAbierta(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <X size={12} />
                          Ocultar Columna
                        </button>
                        <button
                          onClick={() => {
                            moverColumna(col.key, "izquierda");
                            setColumnaMenuAbierta(null);
                          }}
                          disabled={index === 0}
                          className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={12} className="-rotate-90" />
                          Mover Izquierda
                        </button>
                        <button
                          onClick={() => {
                            moverColumna(col.key, "derecha");
                            setColumnaMenuAbierta(null);
                          }}
                          disabled={
                            index ===
                            columnasVisibles.filter((c) => c.visible !== false)
                              .length -
                              1
                          }
                          className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={12} className="rotate-90" />
                          Mover Derecha
                        </button>

                        <div className="border-t border-[var(--border-subtle)] my-1" />

                        <button
                          onClick={() => {
                            const nuevas = [...columnasVisibles];
                            const colItem = nuevas.find((c) => c.key === col.key);
                            const filtradas = nuevas.filter((c) => c.key !== col.key);
                            setColumnasVisibles([colItem, ...filtradas]);
                            setColumnaMenuAbierta(null);
                          }}
                          disabled={index === 0}
                          className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={12} className="rotate-0 text-[var(--primary)]" />
                          Mover al Inicio (Tope)
                        </button>

                        <button
                          onClick={() => {
                            const nuevas = [...columnasVisibles];
                            const colItem = nuevas.find((c) => c.key === col.key);
                            const filtradas = nuevas.filter((c) => c.key !== col.key);
                            setColumnasVisibles([...filtradas, colItem]);
                            setColumnaMenuAbierta(null);
                          }}
                          disabled={
                            index ===
                            columnasVisibles.filter((c) => c.visible !== false)
                              .length -
                              1
                          }
                          className="w-full px-3 py-1.5 text-left text-[11px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <ChevronUp size={12} className="rotate-180 text-[var(--primary)]" />
                          Mover al Final (Tope)
                        </button>
                      </div>
                      </>
                    )}
                  </th>
                ))}
              {mostrarAcciones && (
                <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {datos.length > 0 ? (
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
                          permisos,
                          onVer,
                          onEditar,
                          onEliminar,
                          onDescargar,
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
                    (mostrarAcciones ? 1 : 0)
                  }
                  className="py-20 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-[var(--surface-hover)] text-[var(--text-muted)] opacity-50">
                      <Package size={30} />
                    </div>
                    <p className="text-[11px] font-medium text-[var(--text-muted)]">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER INFO Y PAGINACIÓN */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1 py-1">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Total: {meta?.total || datos.length} registros
        </p>

        {meta && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Mostrar
              </span>
              <select
                value={meta.perPage || 10}
                onChange={(e) =>
                  onLimitChange && onLimitChange(Number(e.target.value))
                }
                className="bg-[var(--surface)] border border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-primary)] rounded-md px-2 py-1 outline-none cursor-pointer hover:border-[var(--primary)]/50 transition-colors"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-lg p-1">
              <button
                disabled={!meta.prev}
                onClick={() => onPageChange && onPageChange(meta.prev)}
                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] disabled:opacity-30 transition-all font-bold text-[11px] px-3 cursor-pointer"
              >
                Anterior
              </button>
              <span className="text-[11px] font-black text-[var(--text-primary)] px-2">
                {meta.currentPage} / {meta.lastPage || 1}
              </span>
              <button
                disabled={!meta.next}
                onClick={() => onPageChange && onPageChange(meta.next)}
                className="p-1 rounded text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] hover:text-[var(--primary)] disabled:opacity-30 transition-all font-bold text-[11px] px-3 cursor-pointer"
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
