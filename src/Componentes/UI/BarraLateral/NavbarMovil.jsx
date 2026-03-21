import { useState, useMemo } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { Link, useLocation } from "react-router-dom";
import { useUserPermissions } from "../../../Backend/Autenticacion/hooks/useUserPermissions";
import { useSeccionesUI } from "../../../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";
import * as Icons from "../../../assets/Icons";
import { ChevronRight, PanelRightClose, LayoutGrid } from "lucide-react";
import useCargadorStore from "../../../store/useCargadorStore";

// Función para parsear el string del icono que viene del backend
const parseIcono = (iconStr, size = 20) => {
    if (!iconStr || typeof iconStr !== "string") return iconStr;
    const match = iconStr.match(/<(\w+)/);
    if (match && match[1]) {
        const IconComponent = Icons[match[1]];
        return IconComponent ? <IconComponent size={size} /> : null;
    }
    return iconStr;
};

const NavbarMovil = () => {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const location = useLocation();
    const { secciones: seccionesApi } = useSeccionesUI();
    const { codigosSeccionPermitidos } = useUserPermissions();
    const setCargando = useCargadorStore(estado => estado.setCargando);

    const manejarNavegacion = (ruta) => {
        if (ruta && ruta !== "#" && location.pathname !== ruta) {
            setCargando(true);
        }
        cerrarMenu();
    };

    const menuFiltrado = useMemo(() => {
        const inicioItem = {
            id: "inicio",
            nombre: "Inicio",
            icono: <Icons.InicioIcono size={20} />,
            redireccion: "/panel/",
            subMenus: []
        };

        const seccionesFiltradas = seccionesApi
            .filter(seccion => seccion.activo && codigosSeccionPermitidos.includes(seccion.permisoRequerido))
            .map(seccion => ({
                id: seccion.id_seccion,
                nombre: seccion.nombre,
                icono: parseIcono(seccion.icono) || <Icons.InicioIcono size={20} />,
                redireccion: seccion.redireccion,
                subMenus: seccion.subMenus?.filter(sm => sm.activo) || []
            }));

        return [inicioItem, ...seccionesFiltradas];
    }, [seccionesApi, codigosSeccionPermitidos]);

    const toggleMenu = (menuId) => {
        setMenuAbierto(menuAbierto === menuId ? null : menuId);
    };

    const cerrarMenu = () => {
        setMenuAbierto(null);
    };

    const esRutaActiva = (ruta) => {
        if (ruta === "/panel/" || ruta === "/panel") {
            return location.pathname === "/panel" || location.pathname === "/panel/";
        }
        return location.pathname.startsWith(ruta);
    };

    const esSeccionActiva = (item) => {
        if (esRutaActiva(item.redireccion)) return true;
        return item.subMenus?.some(sm => location.pathname.startsWith(sm.redireccion));
    };

    // Dividimos el menú: 3 principales + el resto en "Más"
    const itemsPrincipales = menuFiltrado.slice(0, 3);
    const itemsExtras = menuFiltrado.slice(3);
    const tieneExtras = itemsExtras.length > 0;

    return (
        <>
            {/* Overlay para cerrar menú al hacer clic fuera */}
            {menuAbierto && (
                <div
                    className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200 md:hidden"
                    onClick={cerrarMenu}
                />
            )}

            {/* Popover de Submenús o Más Opciones (Estilo GUMA) */}
            {menuAbierto && (
                <div className="fixed bottom-[90px] left-4 right-4 bg-[var(--surface)]/90 backdrop-blur-xl rounded-2xl shadow-2xl z-[9999] max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 md:hidden border border-[var(--border-subtle)]">
                    {menuAbierto === "mas_opciones" ? (
                        /* LISTA DE ITEMS EXTRAS */
                        <div>
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] font-bold text-base text-[var(--primary)] bg-[var(--primary-subtle)] rounded-t-2xl">
                                <LayoutGrid size={20} />
                                <span>Más Opciones</span>
                            </div>
                            <div className="py-2">
                                {itemsExtras.map((item) => (
                                    <div key={item.id} className="flex flex-col">
                                        <Link
                                            to={item.subMenus?.length > 0 ? "#" : item.redireccion}
                                            className={`flex items-center justify-between px-5 py-3 transition-all duration-200 border-l-4 ${esSeccionActiva(item)
                                                ? "bg-[var(--primary)]/10 border-l-[var(--primary)] text-[var(--primary)] font-bold"
                                                : "border-l-transparent text-[var(--text-muted)] active:bg-[var(--surface-hover)]"
                                                }`}
                                            onClick={(e) => {
                                                if (item.subMenus?.length > 0) {
                                                    e.preventDefault();
                                                    toggleMenu(item.id);
                                                } else {
                                                    manejarNavegacion(item.redireccion);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icono}
                                                <span>{item.nombre}</span>
                                            </div>
                                            <ChevronRight size={16} className="opacity-50" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* SUBMENÚ DE UNA SECCIÓN ESPECÍFICA */
                        menuFiltrado.filter(item => item.id === menuAbierto).map(item => (
                            <div key={item.id}>
                                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)] font-bold text-base text-[var(--primary)] bg-[var(--primary-subtle)] rounded-t-2xl">
                                    {item.icono}
                                    <span>{item.nombre}</span>
                                </div>
                                <div className="py-2">
                                    {item.subMenus.map((sm, index) => (
                                        <Link
                                            key={index}
                                            to={sm.redireccion}
                                            className={`flex items-center justify-between px-5 py-3 transition-all duration-200 border-l-4 ${location.pathname === sm.redireccion
                                                ? "bg-[var(--primary)]/10 border-l-[var(--primary)] text-[var(--primary)] font-bold"
                                                : "border-l-transparent text-[var(--text-muted)] active:bg-[var(--surface-hover)]"
                                                }`}
                                            onClick={() => manejarNavegacion(sm.redireccion)}
                                        >
                                            <span>{sm.nombre}</span>
                                            <ChevronRight size={16} className="opacity-50" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Barra de navegación móvil (Estilo GUMA) */}
            <header className="fixed w-full bottom-0 left-0 right-0 z-[9999] px-4 pb-6 pt-2 pointer-events-none md:hidden">
                <nav className="mx-auto max-w-md h-16 pointer-events-auto flex justify-around items-center bg-[var(--surface)] shadow-xl shadow-[var(--primary)]/20 border border-[var(--primary)]/50 rounded-full px-2 backdrop-blur-md">
                    {/* PRIMEROS 3 ITEMS */}
                    {itemsPrincipales.map((item) => {
                        const isActive = esSeccionActiva(item) || menuAbierto === item.id;
                        const hasSubmenu = item.subMenus?.length > 0;

                        if (hasSubmenu) {
                            return (
                                <button
                                    key={item.id}
                                    className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 relative group bg-transparent border-none cursor-pointer active:scale-90 ${isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
                                    onClick={() => toggleMenu(item.id)}
                                >
                                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-[var(--primary)]/15 scale-110 shadow-[0_0_8px_var(--primary-subtle)]" : "group-hover:bg-[var(--surface-hover)]"}`}>
                                        {item.icono}
                                    </div>
                                    <span className={`text-[9px] uppercase tracking-tighter transition-all duration-300 ${isActive ? "font-black opacity-100" : "font-medium opacity-60"}`}>
                                        {item.nombre}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.id}
                                to={item.redireccion}
                                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 relative group active:scale-90 ${isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}
                                onClick={() => manejarNavegacion(item.redireccion)}
                            >
                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-[var(--primary)]/15 scale-110 shadow-[0_0_8px_var(--primary-subtle)]" : "group-hover:bg-[var(--surface-hover)]"}`}>
                                    {item.icono}
                                </div>
                                <span className={`text-[9px] uppercase tracking-tighter transition-all duration-300 ${isActive ? "font-black opacity-100" : "font-medium opacity-60"}`}>
                                    {item.nombre}
                                </span>
                            </Link>
                        );
                    })}

                    {/* BOTÓN MÁS OPCIONES */}
                    {tieneExtras && (
                        <button
                            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all duration-300 relative group bg-transparent border-none cursor-pointer active:scale-90 ${menuAbierto === "mas_opciones" || itemsExtras.some(esSeccionActiva)
                                ? "text-[var(--primary)]"
                                : "text-[var(--text-muted)]"
                                }`}
                            onClick={() => toggleMenu("mas_opciones")}
                        >
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${menuAbierto === "mas_opciones" || itemsExtras.some(esSeccionActiva) ? "bg-[var(--primary)]/15 scale-110 shadow-[0_0_8px_var(--primary-subtle)]" : "group-hover:bg-[var(--surface-hover)]"}`}>
                                <LayoutGrid size={20} />
                            </div>
                            <span className={`text-[9px] uppercase tracking-tighter transition-all duration-300 ${menuAbierto === "mas_opciones" || itemsExtras.some(esSeccionActiva) ? "font-black opacity-100" : "font-medium opacity-60"}`}>
                                Más
                            </span>
                        </button>
                    )}
                </nav>
            </header>
        </>
    );
};

export default NavbarMovil;
