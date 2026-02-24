import React, { useState } from "react";
import {
    AgregarIcono,
    BuscadorIcono,
    ErrorIcono,
    FiltroIcono,
} from "../../../assets/Icons";
import { ChevronDown, ChevronUp, MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react";
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
                {acciones.map((accion, i) => (
                    <button
                        key={i}
                        onClick={() => accion.onClick(fila)}
                        title={accion.etiqueta}
                    >
                        {accion.icono && React.isValidElement(accion.icono) ? React.cloneElement(accion.icono, { size: 14 }) : accion.icono}
                    </button>
                ))}
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
                        className={`px-4 py-1 text-[13px] text-[var(--text-primary)] transition-colors ${index === 0 ? 'font-medium' : ''}`}
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
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {botonAgregar && (
                                <button
                                    onClick={manejarAgregarClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]! text-white! rounded-md! hover:bg-[var(--primary-hover)]! transition-all! shadow-sm! font-bold! text-[11px]! uppercase! tracking-wider! cursor-pointer!"
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

                        <div className="flex items-center gap-3 ml-auto">
                            {elementosSuperior}

                            {mostrarBuscador && setBusqueda && (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        className="w-64 h-9 pl-9 pr-4 rounded-lg bg-[var(--surface)]! border! border-[var(--border-subtle)]! focus:border-[var(--primary)]! focus:ring-1! focus:ring-[var(--primary)]! transition-all! text-[11px]! placeholder:text-[var(--text-muted)]! text-[var(--text-primary)]!"
                                        placeholder={placeholderBuscador}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                        <BuscadorIcono size={14} color="currentColor" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PANEL DE FILTROS */}
                    {mostrarFiltros && filtrosAbiertos && (
                        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
                            <div className="flex flex-wrap gap-4 items-end">{filtrosElementos}</div>
                        </div>
                    )}
                </div>
            )}

            {/* TABLA PRINCIPAL */}
            <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm">
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
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 rounded-full bg-red-500/5 text-red-400">
                                            <ErrorIcono size={24} />
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
