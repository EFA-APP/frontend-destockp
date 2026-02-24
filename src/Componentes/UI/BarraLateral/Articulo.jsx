import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

const Articulo = ({
  nombre,
  icono,
  redireccion,
  submenu = [],
  isOpen = false,
  onToggle,
}) => {
  const location = useLocation();

  const tieneSubmenu = submenu.length > 0;
  const estaActivado = location.pathname === redireccion;
  // Verificar si algún submenú está activo
  const submenuActivo = submenu.some((item) =>
    location.pathname.startsWith(item.redireccion)
  );
  const estaActivadoOSubmenu = estaActivado || submenuActivo;

  // Si tiene submenú, manejar el toggle
  const handleClick = (e) => {
    if (tieneSubmenu) {
      e.preventDefault();
      onToggle?.();
    }
  };

  return (
    <li className="w-full">
      {/* Item principal */}
      <div
        onClick={handleClick}
        className={`group relative rounded-md transition-all duration-200 ease-in-out w-full cursor-pointer ${estaActivadoOSubmenu ? "translate-x-1" : "hover:translate-x-1"
          }`}
      >
        <Link
          to={tieneSubmenu ? "#" : redireccion}
          className={`flex items-center gap-2 text-[11px] text-[var(--text-secondary)] rounded-md w-full py-2 transition-all hover:text-[var(--text-primary)]!`}
        >
          <span className={`group-hover:text-[var(--primary)]! border border-[var(--border-subtle)] rounded-lg p-1.5 transition-colors ${estaActivadoOSubmenu
            ? "text-[var(--primary)]! bg-[var(--primary-subtle)] border-[var(--primary)]/20 shadow-sm"
            : "bg-[var(--surface-hover)]/30"
            }`}>{React.isValidElement(icono) ? React.cloneElement(icono, { size: 14 }) : icono}</span>
          <span className={`truncate flex-1 font-semibold ${estaActivadoOSubmenu ? "text-[var(--text-primary)]" : ""}`}>{nombre}</span>

          {/* Flecha indicadora si tiene submenú */}
          {tieneSubmenu && (
            <span className={`transition-transform duration-200 ml-auto ${estaActivadoOSubmenu ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>
              {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
        </Link>
      </div>

      {/* Submenú desplegable */}
      {tieneSubmenu && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <ul className="ml-5 space-y-0.5 border-l border-[var(--border-subtle)] pl-2.5">
            {submenu.map((item, index) => {
              const submenuItemActivo =
                location.pathname === item.redireccion ||
                location.pathname.startsWith(item.redireccion + "/");

              return (
                <li
                  key={index}
                  className={`group relative rounded-md transition-all duration-200 ease-in-out cursor-pointer ${submenuItemActivo
                    ? "translate-x-1"
                    : "hover:translate-x-1"
                    }`}
                >
                  <Link
                    to={item.redireccion}
                    className={`flex items-center gap-2 text-[10px] p-2 rounded-lg transition-all hover:text-[var(--text-primary)]! hover:bg-[var(--surface-hover)] ${submenuItemActivo
                      ? "text-[var(--primary)]! bg-[var(--primary-subtle)] font-bold border border-[var(--primary)]/10"
                      : "text-[var(--text-muted)] font-medium"
                      }`}
                  >
                    <span className="truncate">{item.nombre}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

export default Articulo;
