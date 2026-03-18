import React, { useState } from "react";
import {
    AgregarIcono,
    BuscadorIcono,
    ConfiguracionIcono,
    ErrorIcono,
    FiltroIcono,
} from "../../../assets/Icons";
import { ChevronDown, ChevronUp, MoreHorizontal, Eye, Edit, Trash2, Download, X, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =====================================================
   SUBCOMPONENTES INTERNOS
===================================================== */

// 1. Menu de Acciones Adaptado
const ActionMenu = ({ fila, acciones, onVer, onEditar, onEliminar, onDescargar, permisos }) => {
    // Si se pasan acciones personalizadas, usarlas
    if (acciones) {
        return (
            <div className="flex items-center justify-end gap-1">
                {acciones.map((accion, i) => {
                    const cargando = typeof accion.isLoading === 'function' ? accion.isLoading(fila) : false;
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
                            ) : (
                                accion.icono && React.isValidElement(accion.icono) ? React.cloneElement(accion.icono, { size: 14 }) : accion.icono
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    // Si no, usar el set estándar de acciones
    return (
        <div className="flex items-center justify-end gap-1">
            {permisos?.ver && onVer && (
                <button
                    onClick={() => onVer(fila)}
                    className="p-1.5 rounded-md hover:bg-[var(--primary-subtle)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all cursor-pointer border border-transparent hover:border-[var(--primary)]/20"
                    title="Ver"
                >
                    <Eye size={14} />
                </button>
            )}
            {permisos?.editar && onEditar && (
                <button
                    onClick={() => onEditar(fila)}
                    className="p-1.5 rounded-md hover:bg-amber-500/10 text-[var(--text-muted)] hover:text-amber-500 transition-all cursor-pointer border border-transparent hover:border-amber-500/20"
                    title="Editar"
                >
                    <Edit size={14} />
                </button>
            )}
            {permisos?.descargar && onDescargar && (
                <button
                    onClick={() => onDescargar(fila)}
                    className="p-1.5 rounded-md hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-500 transition-all cursor-pointer border border-transparent hover:border-blue-500/20"
                    title="Descargar"
                >
                    <Download size={14} />
                </button>
            )}
            {permisos?.eliminar && onEliminar && (
                <button
                    onClick={() => onEliminar(fila)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                    title="Eliminar"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
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
    onToggleExpansion
}) => {
    const [abiertoInterno, setAbiertoInterno] = useState(false);

    // Modo Jerárquico
    const gruposHijos = getChildren ? getChildren(fila) : [];
    const tieneHijos = gruposHijos?.some(g => Array.isArray(g.data) && g.data.length > 0);

    // Modo Expandible Detalle
    const esExpandible = !!renderDetalle;

    const manejarClick = () => {
        if (tieneHijos) setAbiertoInterno(!abiertoInterno);
        if (esExpandible) onToggleExpansion();
    };

    return (
        <>
            <tr className={`border-b border-[var(--border-subtle)] transition-all duration-200 group ${estaExpandida ? 'bg-[var(--primary-subtle)]/30' : 'hover:bg-[var(--surface-hover)]'}`}>
                {columnas.map((col, index) => (
                    <td
                        key={col.key}
                        className={`px-4 py-2.5 text-[13px] text-[var(--text-primary)] transition-colors ${index === 0 ? 'font-medium' : ''}`}
                        onClick={manejarClick}
                    >
                        <div
                            className="flex items-center gap-2"
                            style={{ paddingLeft: index === 0 ? nivel * 16 : 0 }}
                        >
                            {/* Icono de Toggle (Jerárquico) */}
                            {index === 0 && tieneHijos && (
                                <button className="text-[var(--primary)] transition-transform duration-200">
                                    {abiertoInterno ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            )}

                            {/* Icono de Toggle (Expandible Detalle) */}
                            {index === 0 && esExpandible && !tieneHijos && (
                                <button className="text-[var(--text-muted)] group-hover:text-[var(--primary)]">
                                    {estaExpandida ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            )}

                            <div className="truncate">
                                {col.renderizar ? col.renderizar(fila[col.key], fila) : fila[col.key]}
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
            {abiertoInterno && tieneHijos && gruposHijos.map((grupo, gIndex) =>
                grupo.data.map((subFila, fIndex) => (
                    <DataRow
                        key={`${subFila.id || gIndex}-${fIndex}`}
                        fila={subFila}
                        columnas={columnas}
                        getChildren={getChildren}
                        nivel={nivel + 1}
                        accionesProps={accionesProps}
                    />
                ))
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
    onToggleExpansion
}) => {
    const [actionSheetOpen, setActionSheetOpen] = useState(false);

    // Extraer propiedades para crear botones en el sheet
    const { acciones, onVer, onEditar, onEliminar, onDescargar, permisos } = accionesProps || {};

    return (
        <>
            <div className={`p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm flex flex-col gap-4 animate-in fade-in duration-300 ${estaExpandida ? 'ring-1 ring-[var(--primary)]/30' : ''}`}>
                {/* Header de la Tarjeta (Primera Columna + Acciones) */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{columnas[0]?.etiqueta}</span>
                        <div className="text-[14px] font-bold text-[var(--text-primary)]">
                            {columnas[0]?.renderizar ? columnas[0].renderizar(fila[columnas[0].key], fila) : fila[columnas[0]?.key]}
                        </div>
                    </div>
                    {accionesProps && (
                        <button
                            onClick={() => setActionSheetOpen(true)}
                            className="p-2 -mr-1 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10 transition-all active:scale-95 flex-shrink-0"
                            title="Ver Acciones"
                        >
                            <MoreHorizontal size={18} />
                        </button>
                    )}
                </div>

                {/* Cuerpo de la Tarjeta (Resto de Columnas) */}
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-[var(--border-subtle)]/50">
                    {columnas.slice(1).map((col) => (
                        <div key={col.key} className="flex flex-col gap-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider truncate">{col.etiqueta}</span>
                            <div className="text-[12px] text-[var(--text-primary)] truncate">
                                {col.renderizar ? col.renderizar(fila[col.key], fila) : fila[col.key]}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Expansión (Si aplica) */}
                {renderDetalle && (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onToggleExpansion}
                            className="flex items-center gap-2 text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider py-1"
                        >
                            {estaExpandida ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {estaExpandida ? 'Cerrar Detalles' : 'Ver Detalles'}
                        </button>
                        {estaExpandida && (
                            <div className="p-3 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] animate-in slide-in-from-top-2 duration-300">
                                {renderDetalle(fila)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ACTION SHEET MOBILE NATIVO (Bottom Sheet) */}
            {actionSheetOpen && accionesProps && (
                <div className="fixed inset-0 z-[99999] flex flex-col justify-end pointer-events-auto">
                    {/* Overlay oscuro para fondo */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActionSheetOpen(false)}></div>

                    {/* Drawer Content */}
                    <div className="relative bg-[#161616] w-full rounded-t-[32px] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-bottom duration-300 pb-safe pb-6">

                        {/* Píldora de arrastre superior */}
                        <div className="w-full flex justify-center pt-4 pb-3" onClick={() => setActionSheetOpen(false)}>
                            <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                        </div>

                        <div className="px-6 pb-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-white/50 text-[11px] font-bold uppercase tracking-widest">Opciones de Registro</h3>
                                <button onClick={() => setActionSheetOpen(false)} className="p-1.5 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {acciones ? (
                                    // Acciones personalizadas (Ej: Tabla de Usuarios con Bloquear/Desbloquear)
                                    acciones.map((accion, i) => {
                                        const cargando = typeof accion.isLoading === 'function' ? accion.isLoading(fila) : false;
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
                                                className={`w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-5 gap-4 text-white hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                                    {cargando ? <div className="w-5 h-5 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /> : (accion.icono && React.isValidElement(accion.icono) ? React.cloneElement(accion.icono, { size: 18 }) : accion.icono)}
                                                </div>
                                                <span className="font-semibold text-sm tracking-wide">{accion.etiqueta || accion.label || "Acción"}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    // Set estándar (CRUD Básico)
                                    <>
                                        {permisos?.ver && onVer && (
                                            <button onClick={() => { setActionSheetOpen(false); onVer(fila); }} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-5 gap-4 text-white hover:bg-white/10 active:scale-[0.98] transition-all">
                                                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                                    <Eye size={18} className="text-white/60" />
                                                </div>
                                                <span className="font-semibold text-sm tracking-wide">Ver Resumen</span>
                                            </button>
                                        )}
                                        {permisos?.editar && onEditar && (
                                            <button onClick={() => { setActionSheetOpen(false); onEditar(fila); }} className="w-full h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center px-5 gap-4 text-amber-500 hover:bg-amber-500/20 active:scale-[0.98] transition-all">
                                                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                                    <Edit size={18} />
                                                </div>
                                                <span className="font-semibold text-sm tracking-wide">Editar Registro</span>
                                            </button>
                                        )}
                                        {permisos?.descargar && onDescargar && (
                                            <button onClick={() => { setActionSheetOpen(false); onDescargar(fila); }} className="w-full h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center px-5 gap-4 text-blue-500 hover:bg-blue-500/20 active:scale-[0.98] transition-all">
                                                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                                    <Download size={18} />
                                                </div>
                                                <span className="font-semibold text-sm tracking-wide">Descargar XML/PDF</span>
                                            </button>
                                        )}
                                        {permisos?.eliminar && onEliminar && (
                                            <button onClick={() => { setActionSheetOpen(false); onEliminar(fila); }} className="w-full h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center px-5 gap-4 text-red-500 hover:bg-red-500/20 active:scale-[0.98] transition-all">
                                                <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center flex-shrink-0">
                                                    <Trash2 size={18} />
                                                </div>
                                                <span className="font-semibold text-sm tracking-wide">Eliminar Registro</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>

                            <button onClick={() => setActionSheetOpen(false)} className="w-full h-12 mt-4 bg-white/5 border border-white/10 rounded-[14px] flex items-center justify-center text-white/50 font-bold uppercase text-[12px] tracking-widest hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all">
                                Cancelar
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
    onVer, onEditar, onEliminar, onDescargar,
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

    // Filtros
    mostrarFiltros = false,
    filtrosElementos = null,
    textoFiltros = "Opciones de Filtro",
    filtrosAbiertosInicial = false,

    // Otras props
    emptyMessage = "No se encontraron registros en este módulo",
    loading = false,
    className = "",
    onRefresh = null // <- Nuevo prop para Pull to Refresh
}) => {
    const navigate = useNavigate();
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(filtrosAbiertosInicial);
    const [columnasVisibles, setColumnasVisibles] = useState(() => 
         columnas.map((c) => ({ ...c, visible: true }))
    );
    const [menuColumnasAbierto, setMenuColumnasAbierto] = useState(false);

    React.useEffect(() => {
         setColumnasVisibles(prev => {
              return columnas.map((c) => {
                   const guardado = prev.find(p => p.key === c.key);
                   return { ...c, visible: guardado ? guardado.visible : true };
              });
         });
    }, [columnas]);
    const [filaExpandidaId, setFilaExpandidaId] = useState(null);
    const [pullStart, setPullStart] = useState(null);
    const [pullOffset, setPullOffset] = useState(0);
    const [isRefreshingState, setIsRefreshingState] = useState(false);

    const manejarAgregarClick = () => {
        if (botonAgregar?.onClick) botonAgregar.onClick();
        if (botonAgregar?.ruta) navigate(botonAgregar.ruta);
    };

    const toggleFilaExpansion = (id) => {
        setFilaExpandidaId(prev => prev === id ? null : id);
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
                            className={`text-white ${isRefreshingState ? 'animate-spin' : ''}`}
                            style={{ transform: !isRefreshingState ? `rotate(${pullOffset * 4}deg)` : undefined }}
                        >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <polyline points="21 3 21 8 16 8" />
                        </svg>
                    </div>
                </div>
            )}
            {/* TOOLBAR SUPERIOR */}
            {(botonAgregar || mostrarBuscador || elementosSuperior || mostrarFiltros) && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {botonAgregar && (
                                <button
                                    onClick={manejarAgregarClick}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)]! text-white! rounded-md! hover:-translate-y-0.5! transition-all! duration-300! shadow-lg! shadow-[var(--primary)]/25! hover:shadow-[var(--primary)]/40! font-bold! text-[11px]! uppercase! tracking-wider! cursor-pointer! w-full md:w-auto justify-center md:justify-start"
                                >
                                    <AgregarIcono size={14} />
                                    {botonAgregar.texto || "Nuevo Registro"}
                                </button>
                            )}

                            {mostrarFiltros && (
                                <button
                                    onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                                    className={`flex items-center! gap-2! px-4! py-2! rounded-lg! border! transition-all! text-[11px]! font-bold! uppercase! tracking-wider! cursor-pointer! ${filtrosAbiertos
                                        ? 'bg-[var(--primary-subtle)]! text-[var(--primary)]! border-[var(--primary)]/30'
                                        : 'bg-[var(--surface)]! text-[var(--text-secondary)]! border-[var(--border-subtle)]! hover:bg-[var(--surface-hover)]!'
                                        }`}
                                >
                                    <FiltroIcono color={filtrosAbiertos ? "var(--primary)" : "currentColor"} size={14} />
                                    {textoFiltros}
                                </button>
                            )}

                            {/* CONFIGURADOR DE COLUMNAS */}
                            <div className="relative">
                                <button
                                    onClick={() => setMenuColumnasAbierto(!menuColumnasAbierto)}
                                    className={`flex items-center! gap-2! px-4! py-2! rounded-lg! border! transition-all! text-[11px]! font-bold! uppercase! tracking-wider! cursor-pointer! ${menuColumnasAbierto
                                        ? 'bg-[var(--primary-subtle)]! text-[var(--primary)]! border-[var(--primary)]/30'
                                        : 'bg-[var(--surface)]! text-[var(--text-secondary)]! border-[var(--border-subtle)]! hover:bg-[var(--surface-hover)]!'
                                        }`}
                                >
                                    <ConfiguracionIcono size={14} color={menuColumnasAbierto ? "var(--primary)" : "currentColor"} />
                                    Columnas
                                </button>

                                {menuColumnasAbierto && (
                                    <div className="absolute top-11 left-0 md:left-auto md:right-0 z-[100] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border-medium)]/30 rounded-md shadow-lg p-3 w-64 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[var(--border-subtle)]/50">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Configurar Columnas</span>
                                            </div>
                                            <button onClick={() => setMenuColumnasAbierto(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded-md hover:bg-[var(--surface-hover)] transition-all"><X size={12} /></button>
                                        </div>
                                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto no-scrollbar pr-0.5">
                                            {columnasVisibles.map((col, index) => (
                                                <div key={col.key || index} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[var(--surface-hover)]/30 border border-transparent hover:border-[var(--border-subtle)]/10 transition-all duration-150">
                                                    <div className="flex items-center gap-2 max-w-[70%]">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={col.visible !== false} 
                                                            onChange={() => {
                                                                const nuevas = [...columnasVisibles];
                                                                nuevas[index].visible = !nuevas[index].visible;
                                                                setColumnasVisibles(nuevas);
                                                            }}
                                                            className="rounded-sm border-[var(--border-medium)] text-[var(--primary)] focus:ring-[var(--primary)]/10 cursor-pointer w-3.5 h-3.5"
                                                        />
                                                        <span className="text-[12px] text-[var(--text-primary)] font-medium truncate">{col.etiqueta}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        <button 
                                                            disabled={index === 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const nuevas = [...columnasVisibles];
                                                                [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
                                                                setColumnasVisibles(nuevas);
                                                            }}
                                                            className="p-1 hover:bg-[var(--primary-subtle)] rounded-md text-[var(--text-muted)] hover:text-[var(--primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                            title="Subir"
                                                        >
                                                            <ChevronUp size={12} />
                                                        </button>
                                                        <button 
                                                            disabled={index === columnasVisibles.length - 1}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const nuevas = [...columnasVisibles];
                                                                [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
                                                                setColumnasVisibles(nuevas);
                                                            }}
                                                            className="p-1 hover:bg-[var(--primary-subtle)] rounded-md text-[var(--text-muted)] hover:text-[var(--primary)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                            title="Bajar"
                                                        >
                                                            <ChevronDown size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-3 ml-auto w-full md:w-auto">
                            {elementosSuperior}

                            {mostrarBuscador && setBusqueda && (
                                <div className="relative group/search w-full md:w-auto">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--primary)]! group-focus-within/search:text-[var(--primary)]! transition-colors duration-300 z-[25]">
                                        <BuscadorIcono size={14} color={"var(--primary)"} />
                                    </div>
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-full md:w-72 h-10 pl-10 rounded-md! bg-[var(--surface)]/40! backdrop-blur-md! border! border-[var(--border-medium)]/50! focus:border-[var(--primary)]! focus:ring-8! focus:ring-[var(--primary)]/5! transition-all! duration-300! text-[13px]! placeholder:text-[var(--text-muted)]/50! text-[var(--text-primary)]! hover:border-[var(--border-medium)]! shadow-sm!"
                                        placeholder={placeholderBuscador}
                                    />
                                    {busqueda && (
                                        <button
                                            onClick={() => setBusqueda("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--surface-hover)] rounded-md! text-[var(--text-muted)] hover:text-[var(--primary)] transition-all cursor-pointer"
                                            title="Limpiar búsqueda"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
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
                        <div className="
                            relative overflow-hidden
                            bg-[var(--surface)]/60 backdrop-blur-xl 
                            border border-[var(--border-subtle)] 
                            rounded-xl shadow-2xl shadow-[var(--primary)]/5
                            animate-in slide-in-from-top-4 fade-in duration-500
                        ">
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
                            columnas={columnasVisibles.filter(c => c.visible !== false)}
                            renderDetalle={renderDetalle}
                            estaExpandida={filaExpandidaId === (fila.id || index)}
                            onToggleExpansion={() => toggleFilaExpansion(fila.id || index)}
                            accionesProps={mostrarAcciones ? {
                                acciones,
                                permisos,
                                onVer, onEditar, onEliminar, onDescargar
                            } : null}
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
            <div className="hidden md:block w-full overflow-x-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative min-h-[200px]">
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
                                <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-[0.2em]">Cargando Información</p>
                                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1 opacity-70">Sincronizando con el servidor...</p>
                            </div>
                        </div>
                    </div>
                )}

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--fill-secondary)]/30 border-b border-[var(--border-subtle)]">
                            {columnasVisibles.filter(c => c.visible !== false).map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap"
                                >
                                    {col.etiqueta}
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
                                    columnas={columnasVisibles.filter(c => c.visible !== false)}
                                    getChildren={getChildren}
                                    renderDetalle={renderDetalle}
                                    estaExpandida={filaExpandidaId === (fila.id || index)}
                                    onToggleExpansion={() => toggleFilaExpansion(fila.id || index)}
                                    accionesProps={mostrarAcciones ? {
                                        acciones,
                                        permisos,
                                        onVer, onEditar, onEliminar, onDescargar
                                    } : null}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columnasVisibles.filter(c => c.visible !== false).length + (mostrarAcciones ? 1 : 0)} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3" >
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

            {/* FOOTER INFO */}
            <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    Total: {datos.length} registros
                </p>
            </div>
        </div>
    );
};

export default DataTable;
