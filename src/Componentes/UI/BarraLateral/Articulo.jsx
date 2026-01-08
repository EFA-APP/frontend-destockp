import { useState } from "react";
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
        className={`group relative rounded-md transition-all duration-200 ease-in-out w-full cursor-pointer ${
          estaActivadoOSubmenu ? "translate-x-1" : "hover:translate-x-1"
        }`}
      >
        <Link
          href={tieneSubmenu ? "#" : redireccion}
          className={`flex items-center gap-2 text-xs text-white rounded-md w-full py-2 transition-all hover:text-white!`}
        >
          <span className={`group-hover:text-[var(--primary)]! border border-gray-300/15 rounded-md p-1 ${
                        estaActivadoOSubmenu
              ? "text-[var(--primary)]! bg-[var(--primary)]/20"
              : ""
          }`}>{icono}</span>
          <span className="truncate flex-1">{nombre}</span>

          {/* Flecha indicadora si tiene submenú */}
          {tieneSubmenu && (
            <span className="transition-transform duration-200 ml-auto">
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </Link>
      </div>

      {/* Submenú desplegable */}
      {tieneSubmenu && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="ml-6 space-y-1 border-l-2 border-gray-100/10 pl-3">
            {submenu.map((item, index) => {
              const submenuItemActivo =
                location.pathname === item.redireccion ||
                location.pathname.startsWith(item.redireccion + "/");

              return (
                <li
                  key={index}
                  className={`group relative rounded-md transition-all duration-200 ease-in-out cursor-pointer ${
                    submenuItemActivo === index
                      ? "translate-x-1"
                      : "hover:translate-x-1"
                  }`}
                >
                  <Link
                    to={item.redireccion}
                    className={`flex items-center gap-2 text-xs p-2 rounded-md transition-all hover:text-white! hover:bg-[#7a79783a] ${
                      submenuItemActivo
                        ? "text-[var(--primary)]! bg-[var(--primary)]/10 font-medium"
                        : "text-gray-100/70"
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
