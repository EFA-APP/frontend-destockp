import Articulo from "./Articulo";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { cerrarSesion } from "../../../Backend/Autenticacion/store/cerrarSesion";
import { useUIStore } from "../../../Backend/Config/ui.store";
import { Lock, Unlock, LogOut } from "lucide-react";

import * as Icons from "../../../assets/Icons";
import { useSeccionesUI } from "../../../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

// Función para parsear el string del icono que viene del backend (ej: "<InventarioIcono size={20} />")
const parseIcono = (iconStr) => {
  if (!iconStr || typeof iconStr !== "string") return iconStr;

  const match = iconStr.match(/<(\w+)/);
  if (match && match[1]) {
    const IconComponent = Icons[match[1]];
    return IconComponent ? <IconComponent size={20} /> : null;
  }

  return iconStr;
};

const BarraLateral = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const {
    sidebarLocked,
    sidebarHovered,
    toggleSidebarLock,
    setSidebarHovered,
  } = useUIStore();
  const [openItem, setOpenItem] = useState(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const { secciones: seccionesApi } = useSeccionesUI();
  const { codigosSeccionPermitidos } = usePermisosDeUsuario();

  const isExpanded = sidebarLocked || sidebarHovered;

  // Transformamos y filtramos el menú según los datos de la API y permisos
  const menuFiltrado = useMemo(() => {
    const menu = seccionesApi
      .filter(
        (seccion) =>
          seccion.activo &&
          codigosSeccionPermitidos.includes(seccion.permisoRequerido),
      )
      .map((seccion) => {
        const submenu =
          seccion.subMenus
            ?.filter((sm) => sm.activo)
            .map((sm) => ({
              nombre: sm.nombre,
              redireccion: sm.redireccion,
            })) || [];

        return {
          id: seccion.id_seccion,
          nombre: seccion.nombre,
          icono: parseIcono(seccion.icono) || <Icons.InicioIcono size={20} />,
          redireccion: seccion.redireccion,
          submenu,
        };
      });

    return menu;
  }, [seccionesApi, codigosSeccionPermitidos]);

  // Abrir el primer item con submenú por defecto al cargar
  useEffect(() => {
    if (menuFiltrado.length > 0 && !hasAutoOpened && isExpanded) {
      const firstWithSub = menuFiltrado.find(
        (item) => item.submenu && item.submenu.length > 0,
      );
      if (firstWithSub) {
        setOpenItem(firstWithSub.id);
        setHasAutoOpened(true);
      }
    }
  }, [menuFiltrado, hasAutoOpened, isExpanded]);

  return (
    <div className="relative z-[100]">
      {/* Sidebar contenedor principal */}
      <aside
        onMouseEnter={() => !sidebarLocked && setSidebarHovered(true)}
        onMouseLeave={() => !sidebarLocked && setSidebarHovered(false)}
        className={`hidden md:flex bg-white border-r border-[var(--border-subtle)] h-screen fixed top-0 flex-col flex-shrink-0 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl ${
          isExpanded ? "w-64" : "w-[88px]"
        }`}
      >
        {/* LOGO SECTION */}
        <div
          className={`flex items-center pt-2 pb-4 relative transition-all duration-300 ${isExpanded ? "px-6 justify-between" : "px-0 justify-center"}`}
        >
          <Link to="/" className="relative group/logo flex items-center gap-3">
            <div className="relative">
              {usuario?.configuracionVisual?.logoUrl ? (
                <img
                  alt="logo"
                  className="w-12 h-12 min-w-[48px] rounded-2xl border border-[var(--border-subtle)] shadow-lg object-contain bg-[var(--surface)] p-1.5 group-hover/logo:scale-110 transition-all duration-500 ease-out"
                  src={usuario?.configuracionVisual?.logoUrl}
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 min-w-[48px] rounded-2xl border border-[var(--primary)]/20 shadow-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-emphasis)] text-white group-hover/logo:scale-110 transition-all duration-500 ease-out">
                  <Icons.ConsolaIcono size={24} color="white" />
                </div>
              )}
              {/* Brillo animado en el logo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-700 -translate-x-full group-hover/logo:translate-x-full" />
            </div>

            {isExpanded && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 ease-out">
                <span className="text-[16px] font-black text-[var(--text-primary)] leading-none tracking-tight whitespace-nowrap">
                  {usuario?.nombreEmpresa || "SISTEMA"}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.15em] whitespace-nowrap">
                    En Línea
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* TOGGLE BUTTON */}
          {isExpanded && (
            <button
              onClick={toggleSidebarLock}
              className="p-2 rounded-md bg-[var(--surface)] border border-[var(--border-subtle)] hover:bg-[var(--primary)]/10 text-[var(--text-muted)] hover:text-[var(--primary)] transition-all duration-300 shadow-sm active:scale-90 animate-in zoom-in duration-500"
              title={
                sidebarLocked ? "Desfijar barra lateral" : "Fijar barra lateral"
              }
            >
              {sidebarLocked ? (
                <Icons.FijarBarraLateralIcono size={15} strokeWidth={2.5} />
              ) : (
                <Unlock size={15} strokeWidth={2.5} />
              )}
            </button>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
          <nav
            className={`space-y-2 transition-all duration-300 ${isExpanded ? "px-4" : "px-3"}`}
          >
            {menuFiltrado.map((item, idx) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <Articulo
                  nombre={item.nombre}
                  icono={item.icono}
                  redireccion={item.redireccion}
                  submenu={item.submenu}
                  isOpen={openItem === item.id && isExpanded}
                  onToggle={() =>
                    isExpanded &&
                    setOpenItem(openItem === item.id ? null : item.id)
                  }
                  isCollapsed={!isExpanded}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER / USER INFO */}
        <div
          className={`p-6 mt-auto transition-all duration-500 ${isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 invisible h-0"}`}
        >
          <button
            onClick={() => cerrarSesion()}
            className="w-full bg-rose-500/20 border border-rose-500 hover:bg-rose-500 hover:text-white p-3.5 rounded-2xl flex justify-center items-center gap-3 cursor-pointer transition-all duration-300 group shadow-sm active:scale-95"
          >
            <span className="text-rose-500 group-hover:text-white font-black text-[12px] uppercase tracking-widest transition-colors">
              Salir
            </span>
            <LogOut
              size={18}
              className="text-rose-500 group-hover:text-white group-hover:translate-x-1 transition-all"
            />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default BarraLateral;
