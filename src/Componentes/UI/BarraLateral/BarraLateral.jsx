import Articulo from "./Articulo";
import { useTamañoBarraLateral } from "../../../store/useTamanoBarraLateral";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import * as Icons from "../../../assets/Icons";
import { useSeccionesUI } from "../../../Backend/Autenticacion/hooks/Secciones/useSeccionesUI";
import { useUserPermissions } from "../../../Backend/Autenticacion/hooks/useUserPermissions";

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
  const { isExpanded, setIsExpanded } = useTamañoBarraLateral();
  const usuario = useAuthStore((state) => state.usuario);
  const [openItem, setOpenItem] = useState(null);

  const { secciones: seccionesApi } = useSeccionesUI();
  const { codigosSeccionPermitidos } = useUserPermissions();


  // Transformamos y filtramos el menú según los datos de la API y permisos
  const menuFiltrado = useMemo(() => {
    // Siempre incluimos Inicio
    const inicioItem = {
      id: "inicio",
      nombre: "Inicio",
      icono: <Icons.InicioIcono size={16} />,
      redireccion: "/panel/",
      submenu: []
    };

    const seccionesFiltradas = seccionesApi
      .filter(seccion => seccion.activo && codigosSeccionPermitidos.includes(seccion.permisoRequerido))
      .map(seccion => {
        const submenu = seccion.subMenus?.filter(sm => sm.activo).map(sm => ({
          nombre: sm.nombre,
          redireccion: sm.redireccion
        })) || [];

        return {
          id: seccion.id_seccion,
          nombre: seccion.nombre,
          icono: parseIcono(seccion.icono) || <Icons.InicioIcono size={18} />, // Fallback icon
          redireccion: seccion.redireccion,
          submenu
        };
      });

    return [inicioItem, ...seccionesFiltradas];
  }, [seccionesApi, codigosSeccionPermitidos]);

  const handleArticuloClick = (e, itemId) => {
    if (!isExpanded) {
      // Si está colapsado, expande y abre el submenú
      e.preventDefault();
      e.stopPropagation();
      setIsExpanded(true);
    }
  };

  const toggleItem = (id) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setOpenItem(id);
    } else {
      setOpenItem(openItem === id ? null : id);
    }
  };

  return (
    <div className="relative">
      <aside
        className={`hidden md:flex bg-[var(--surface)]/80 backdrop-blur-xl border-r border-[var(--border-subtle)] fixed h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[99999] flex-col ${isExpanded ? "w-54" : "w-18"
          }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setOpenItem(null);
        }}
      >
        {/* LOGO SECTION */}
        <div className={`flex items-center py-6 px-4 transition-all duration-300 ${isExpanded ? "justify-start" : "justify-center"
          }`}>
          <Link to="/" className="relative group/logo">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--primary)] to-[var(--primary-subtle)] rounded-full blur opacity-25 group-hover/logo:opacity-50 transition duration-300" />
            <img
              alt="logo"
              className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm object-contain bg-white"
              src="/efa-logo.png"
            />
          </Link>
          {isExpanded && (
            <div className="ml-3 flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-[14px] font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
                SISTEMA
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">
                Panel de Control
              </span>
            </div>
          )}
        </div>

        {/* NAVIGATION ITEMS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
          <nav className="px-3">
            {menuFiltrado.map((item) => (
              <div key={item.id} onClick={(e) => handleArticuloClick(e, item.id)}>
                <Articulo
                  nombre={item.nombre}
                  icono={item.icono}
                  redireccion={item.redireccion}
                  submenu={item.submenu}
                  isOpen={openItem === item.id}
                  onToggle={() => toggleItem(item.id)}
                  isCollapsed={!isExpanded}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER / USER INFO SNEAK PEEK (Optional but premium) */}
        {isExpanded && (
          <div className="p-4 border-t border-[var(--border-subtle)] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[var(--surface-hover)] p-3 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs">
                {usuario?.usuario?.split(" ")[0][0] || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                  {usuario?.correoElectronico || "Usuario"}
                </span>
                <span className="text-[9px] text-[var(--text-muted)] truncate capitalize">
                  {usuario?.roles?.[0]?.nombre || "Colaborador"}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default BarraLateral;
