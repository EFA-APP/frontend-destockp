import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import useCargadorStore from "../../../store/useCargadorStore";

const Articulo = React.memo(
  ({
    nombre,
    icono,
    redireccion,
    submenu = [],
    isOpen = false,
    onToggle,
    isCollapsed = false,
  }) => {
    const location = useLocation();
    const setCargando = useCargadorStore((s) => s.setCargando);
    const [isExpanding, setIsExpanding] = useState(false);

    const tieneSubmenu = submenu.length > 0;
    const estaActivado = location.pathname === redireccion;
    const submenuActivo = submenu.some(
      (item) =>
        location.pathname === item.redireccion ||
        location.pathname.startsWith(item.redireccion + "/"),
    );
    const estaActivadoOSubmenu = estaActivado || submenuActivo;

    const handleClick = (e) => {
      if (tieneSubmenu) {
        e.preventDefault();
        setIsExpanding(true);
        onToggle?.();
        setTimeout(() => setIsExpanding(false), 500); 
      }
    };

    return (
      <li className="w-full list-none">
        <div
          onClick={handleClick}
          className={`group relative flex items-center py-0.5 ${
            isCollapsed ? "justify-center" : "px-2"
          }`}
        >
          <Link
            to={tieneSubmenu ? "#" : redireccion}
            className={`flex items-center gap-3 w-full p-2.5 rounded-[12px] transition-all duration-200 ${
              estaActivadoOSubmenu
                ? "bg-[var(--color-brand-primary)] text-white shadow-sm"
                : "text-[var(--color-neutral-text-muted)] hover:bg-[var(--color-neutral-bg)] hover:text-[var(--color-neutral-text-main)]"
            }`}
          >
            {/* Contenedor del Icono */}
            <div
              className={`flex items-center justify-center transition-colors [&>svg]:w-[20px] [&>svg]:h-[20px] [&>svg]:stroke-[1.5px] ${
                estaActivadoOSubmenu
                  ? "text-white"
                  : "text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-neutral-text-main)]"
              }`}
            >
              {icono}
            </div>

            {/* Texto de la Sección */}
            {!isCollapsed && (
              <span
                className={`flex-1 text-[14px] font-semibold tracking-wide transition-colors ${
                  estaActivadoOSubmenu
                    ? "text-white"
                    : "text-[var(--color-neutral-text-muted)] group-hover:text-[var(--color-neutral-text-main)]"
                }`}
              >
                {nombre}
              </span>
            )}

            {/* Flecha indicadora o Loader */}
            {tieneSubmenu && !isCollapsed && (
              <span
                className={`transition-all duration-300 ${
                  isOpen 
                    ? `rotate-90 ${estaActivadoOSubmenu ? "text-white" : "text-[var(--color-brand-primary)]"}` 
                    : `${estaActivadoOSubmenu ? "text-white" : "text-[var(--color-neutral-placeholder)]"}`
                }`}
              >
                {isExpanding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ChevronRight size={16} strokeWidth={2} />
                )}
              </span>
            )}
          </Link>
        </div>

        {/* Submenú desplegable */}
        {tieneSubmenu && !isCollapsed && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isOpen
                ? "max-h-[500px] opacity-100 mt-1 mb-2"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-[28px] mr-2 p-1 relative">
              {/* Guía Vertical Principal */}
              <div className="absolute left-[8px] top-[-10px] bottom-[22px] w-[2px] bg-[var(--color-neutral-border)] rounded-full" />

              <ul className="space-y-1 relative">
                {submenu.map((item, index) => {
                  const submenuItemActivo =
                    location.pathname === item.redireccion ||
                    location.pathname.startsWith(item.redireccion + "/");

                  return (
                    <li key={index} className="relative group/sub pl-5">
                      {/* Guía Horizontal */}
                      <div
                        className={`absolute left-[8px] top-[19px] w-[12px] h-[2px] transition-colors rounded-full ${
                          submenuItemActivo
                            ? "bg-[var(--color-brand-primary)]"
                            : "bg-[var(--color-neutral-border)] group-hover/sub:bg-[var(--color-brand-primary)]"
                        }`}
                      />

                      <Link
                        to={item.redireccion}
                        className={`flex items-center px-4 py-2.5 rounded-[10px] text-[13px] font-medium tracking-wide transition-all ${
                          submenuItemActivo
                            ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-soft)]"
                            : "text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-[var(--color-neutral-bg)]"
                        }`}
                      >
                        <span className="truncate">{item.nombre}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </li>
    );
  },
);

export default Articulo;
