import Articulo from "./Articulo";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { cerrarSesion } from "../../../Backend/Autenticacion/store/cerrarSesion";

import * as Icons from "../../../assets/Icons";
import { useSeccionesUI } from "../../../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";
import { usePermisosDeUsuario } from "../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";

// Función para parsear el string del icono que viene del backend (ej: "<InventarioIcono size={20} />")
const parseIcono = (iconStr) => {
  if (!iconStr || typeof iconStr !== "string") return iconStr;

  // Extraemos el nombre del componente del tag (ej: "InventarioIcono")
  const match = iconStr.match(/<(\w+)/);
  if (match && match[1]) {
    const IconComponent = Icons[match[1]];
    // Retornamos el componente con un tamaño por defecto
    return IconComponent ? <IconComponent size={18} /> : null;
  }

  return iconStr;
};

const BarraLateral = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const [openItem, setOpenItem] = useState(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  const { secciones: seccionesApi } = useSeccionesUI();
  const { codigosSeccionPermitidos } = usePermisosDeUsuario();

  // Transformamos y filtramos el menú según los datos de la API y permisos
  const menuFiltrado = useMemo(() => {
    const seccionesFiltradas = seccionesApi
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
          icono: parseIcono(seccion.icono) || <Icons.InicioIcono size={18} />, // Fallback icon
          redireccion: seccion.redireccion,
          submenu,
        };
      });

    return [...seccionesFiltradas];
  }, [seccionesApi, codigosSeccionPermitidos]);

  // Abrir el primer item con submenú por defecto al cargar
  useEffect(() => {
    if (menuFiltrado.length > 0 && !hasAutoOpened) {
      const firstWithSub = menuFiltrado.find(
        (item) => item.submenu && item.submenu.length > 0,
      );
      if (firstWithSub) {
        setOpenItem(firstWithSub.id);
        setHasAutoOpened(true);
      }
    }
  }, [menuFiltrado, hasAutoOpened]);

  return (
    <div className="relative z-50">
      {/* Sidebar contenedor principal */}
      <aside className="hidden md:flex bg-[var(--fill)] border-r border-[var(--border-subtle)] h-screen fixed top-0 flex-col w-64 flex-shrink-0 transition-all duration-300">
        {/* LOGO SECTION */}
        <div className="flex items-center pt-8 pb-6 px-6 justify-start">
          <Link to="/" className="relative group/logo flex items-center gap-3">
            {usuario?.configuracionVisual?.logoUrl ? (
              <img
                alt="logo"
                className="w-12 h-12 rounded-2xl border border-[var(--border-subtle)] shadow-md object-contain bg-[var(--surface)] p-1 group-hover/logo:scale-105 transition-transform"
                src={usuario?.configuracionVisual?.logoUrl}
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-[var(--primary)]/20 shadow-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-emphasis)] text-white group-hover/logo:scale-105 transition-transform">
                <Icons.ConsolaIcono size={22} color="white" />
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-black text-[var(--text-primary)] leading-none tracking-tight">
                  {usuario?.nombreEmpresa || "SISTEMA"}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
          <nav className="px-4 space-y-1">
            {menuFiltrado.map((item) => (
              <div key={item.id}>
                <Articulo
                  nombre={item.nombre}
                  icono={item.icono}
                  redireccion={item.redireccion}
                  submenu={item.submenu}
                  isOpen={openItem === item.id}
                  onToggle={() =>
                    setOpenItem(openItem === item.id ? null : item.id)
                  }
                  isCollapsed={false}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER / USER INFO SNEAK PEEK */}
        <div className="p-5 mt-auto">
          <div
            onClick={() => cerrarSesion()}
            className="bg-red-700/10 border border-red-700/20 p-3 rounded-xl flex justify-center items-center gap-3 cursor-pointer hover:bg-red-700/20 hover:border-red-700 transition-all active:scale-[0.98] group"
          >
            <div className="shrink-0 flex items-center justify-center text-red-700 font-bold text-[13px] uppercase tracking-wider">
              Cerrar Sesión
            </div>
            <div className="shrink-0 text-red-700/70 group-hover:text-red-700 transition-colors">
              <Icons.CerrarSesionIcono size={18} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BarraLateral;
