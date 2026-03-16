import React, { useState } from "react";
import {
    AgregarIcono,
    BuscadorIcono,
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
    return (
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
                    <ActionMenu {...accionesProps} fila={fila} />
                )}
            </div>

            {/* Cuerpo de la Tarjeta (Resto de Columnas) */}
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-[var(--border-subtle)]/50">
                {columnas.slice(1).map((col) => (
                    <div key={col.key} className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{col.etiqueta}</span>
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
                        className="flex items-center gap-2 text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider"
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
    className = ""
}) => {
    const navigate = useNavigate();
    const [filtrosAbiertos, setFiltrosAbiertos] = useState(filtrosAbiertosInicial);
    const [filaExpandidaId, setFilaExpandidaId] = useState(null);

    const manejarAgregarClick = () => {
        if (botonAgregar?.onClick) botonAgregar.onClick();
        if (botonAgregar?.ruta) navigate(botonAgregar.ruta);
    };

    const toggleFilaExpansion = (id) => {
        setFilaExpandidaId(prev => prev === id ? null : id);
    };

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
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
                                        className="w-full md:w-72 h-10 pl-10 rounded-md! bg-[var(--surface)]/40! backdrop-blur-md! border! border-[var(--border-medium)]/50! focus:border-[var(--primary)]! focus:ring-8! focus:ring-[var(--primary)]/5! transition-all! duration-300! text-[13px]! placeholder:text-[var(--text-muted)]! text-[var(--text-primary)]! hover:border-[var(--border-medium)]! shadow-sm!"
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
                            columnas={columnas}
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
                            {columnas.map((col) => (
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
                                    columnas={columnas}
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
                                <td colSpan={columnas.length + (mostrarAcciones ? 1 : 0)} className="py-20 text-center">
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
