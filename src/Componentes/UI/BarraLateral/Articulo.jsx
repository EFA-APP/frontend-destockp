import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

const Articulo = ({
  nombre,
  icono,
  redireccion,
  submenu = [],
  isOpen = false,
  onToggle,
  isCollapsed = false
}) => {
  const location = useLocation();

  const tieneSubmenu = submenu.length > 0;
  const estaActivado = location.pathname === redireccion;
  // Verificar si algún submenú está activo
  const submenuActivo = submenu.some((item) =>
    location.pathname === item.redireccion || location.pathname.startsWith(item.redireccion + "/")
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
    <li className="w-full list-none">
      {/* Item principal */}
      <div
        onClick={handleClick}
        className={`group relative flex items-center transition-all duration-300 ease-out py-0.1 ${isCollapsed ? "justify-center" : "px-2"
          }`}
      >
        {/* Indicador Vertical Activado */}
        <div
          className={`absolute left-0 w-[2px] h-2/3 bg-[var(--primary)] rounded-full transition-all duration-300 ${estaActivadoOSubmenu ? "opacity-100" : "opacity-0"
            }`}
        />

        <Link
          to={tieneSubmenu ? "#" : redireccion}
          className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-200 ${estaActivadoOSubmenu
            ? "bg-[var(--primary-subtle)] text-[var(--text-primary)] shadow-[0_2px_10px_-4px_rgba(var(--primary-rgb),0.3)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            }`}
        >
          {/* Contenedor del Icono */}
          <div
            className={`flex items-center justify-center p-1 rounded-full transition-all duration-300 ${estaActivadoOSubmenu
              ? "bg-[var(--primary)] text-white scale-110 shadow-md"
              : "bg-[var(--surface-hover)] text-[var(--text-muted)] group-hover:bg-[var(--primary-subtle)] group-hover:text-[var(--primary)] group-hover:scale-105"
              }`}
          >
            {icono}
          </div>

          {/* Texto de la Sección */}
          {!isCollapsed && (
            <span
              className={`flex-1 text-[12px] font-semibold tracking-wide transition-colors ${estaActivadoOSubmenu ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-primary)]"
                }`}
            >
              {nombre}
            </span>
          )}

          {/* Flecha indicadora */}
          {tieneSubmenu && !isCollapsed && (
            <span className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--primary)]"}`}>
              <ChevronRight size={14} />
            </span>
          )}
        </Link>
      </div>

      {/* Submenú desplegable */}
      {tieneSubmenu && !isCollapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[400px] opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}
        >
          <ul className="ml-9 space-y-1 relative">
            {/* Línea vertical de conexión */}
            <div className="absolute left-[-15px] top-0 bottom-2 w-px bg-[var(--border-subtle)] opacity-50 transition-all" />

            {submenu.map((item, index) => {
              const submenuItemActivo =
                location.pathname === item.redireccion ||
                location.pathname.startsWith(item.redireccion + "/");

              return (
                <li key={index} className="relative group/sub">
                  {/* Punto de conexión */}
                  <div className={`absolute left-[-15px] top-1/2 -translate-y-1/2 w-1.5 h-[1.5px] transition-colors ${submenuItemActivo ? "bg-[var(--primary)]" : "bg-[var(--border-subtle)] group-hover/sub:bg-[var(--primary)]"
                    }`} />

                  <Link
                    to={item.redireccion}
                    className={`flex items-center px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${submenuItemActivo
                      ? "text-[var(--primary)] bg-[var(--primary-subtle)] font-bold shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                      }`}
                  >
                    <span className="truncate">{item.nombre}</span>

                    {submenuItemActivo && (
                      <div className="ml-auto w-1 h-1 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]" />
                    )}
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
