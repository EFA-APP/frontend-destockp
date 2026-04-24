import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import useCargadorStore from "../../../store/useCargadorStore";

const Articulo = React.memo(({
  nombre,
  icono,
  redireccion,
  submenu = [],
  isOpen = false,
  onToggle,
  isCollapsed = false,
}) => {
  const location = useLocation();
  const setCargando = useCargadorStore(s => s.setCargando);
  const [isExpanding, setIsExpanding] = useState(false);

  const tieneSubmenu = submenu.length > 0;
  const estaActivado = location.pathname === redireccion;
  // Verificar si algún submenú está activo
  const submenuActivo = submenu.some(
    (item) =>
      location.pathname === item.redireccion ||
      location.pathname.startsWith(item.redireccion + "/"),
  );
  const estaActivadoOSubmenu = estaActivado || submenuActivo;

  // Si tiene submenú, manejar el toggle
  const handleClick = (e) => {
    if (tieneSubmenu) {
      e.preventDefault();
      setIsExpanding(true);
      onToggle?.();
      setTimeout(() => setIsExpanding(false), 500); // Demora visual para el loader
    } else if (redireccion && redireccion !== "#" && location.pathname !== redireccion) {
      setCargando(true);
    }
  };

  return (
    <li className="w-full list-none">
      {/* Item principal */}
      <div
        onClick={handleClick}
        className={`group relative flex items-center    py-0.1 ${
          isCollapsed ? "justify-center" : "px-2"
        }`}
      >
        {/* Indicador Vertical Activado */}
        <div
          className={`absolute left-0 w-1 h-3/4 bg-[var(--primary)] rounded-r-full transition-opacity duration-300 ${
            estaActivadoOSubmenu ? "opacity-100" : "opacity-0"
          }`}
        />

        <Link
          to={tieneSubmenu ? "#" : redireccion}
          className={`flex items-center gap-3 w-full p-2.5 rounded-[16px] transition-all duration-200 ${
            estaActivadoOSubmenu
              ? "bg-[var(--surface)] text-[var(--primary)] shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[var(--border-subtle)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] hover:shadow-sm"
          }`}
        >
          {/* Contenedor del Icono */}
          <div
            className={`flex items-center justify-center p-2 rounded-[12px] transition-colors ${
              estaActivadoOSubmenu
                ? "bg-[var(--primary-subtle)] text-[var(--primary)]"
                : "bg-transparent text-[var(--text-muted)] group-hover:text-[var(--primary)]"
            }`}
          >
            {icono}
          </div>

          {/* Texto de la Sección */}
          {!isCollapsed && (
            <span
              className={`flex-1 text-[13px] font-bold tracking-wide transition-colors ${
                estaActivadoOSubmenu
                  ? "text-[var(--primary)]"
                  : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
              }`}
            >
              {nombre}
            </span>
          )}

          {/* Flecha indicadora o Loader */}
          {tieneSubmenu && !isCollapsed && (
            <span
              className={`transition-all duration-300 ${isOpen ? "rotate-90 text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--primary)]"}`}
            >
              {isExpanding ? (
                <Loader2 size={14} className="animate-spin text-[var(--primary)]" />
              ) : (
                <ChevronRight size={14} />
              )}
            </span>
          )}
        </Link>
      </div>

      {/* Submenú desplegable */}
      {tieneSubmenu && !isCollapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-[34px] mr-2 p-1 relative">
            {/* Guía Vertical Principal (Línea que baja del padre) */}
            <div className="absolute left-[18px] top-[-10px] bottom-[22px] w-[1.5px] bg-[var(--primary)]/10 rounded-full" />

            <ul className="space-y-1 relative">
              {submenu.map((item, index) => {
                const submenuItemActivo =
                  location.pathname === item.redireccion ||
                  location.pathname.startsWith(item.redireccion + "/");

                return (
                  <li key={index} className="relative group/sub pl-7">
                    {/* Guía Horizontal (Codo/Rama) */}
                    <div
                      className={`absolute left-[18px] top-[19px] w-[12px] h-[1.5px] transition-colors rounded-full ${
                        submenuItemActivo
                          ? "bg-[var(--primary)]/30"
                          : "bg-[var(--primary)]/10 group-hover/sub:bg-[var(--primary)]/30"
                      }`}
                    />

                    <Link
                      to={item.redireccion}
                      className={`flex items-center px-4 py-2.5 rounded-[14px] text-[12px] font-bold tracking-wide transition-all ${
                        submenuItemActivo
                          ? "text-[var(--primary)] bg-[var(--surface)] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-[var(--border-subtle)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/80"
                      }`}
                    >
                      <span className="truncate">{item.nombre}</span>

                      {submenuItemActivo && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                      )}
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
});

export default Articulo;
