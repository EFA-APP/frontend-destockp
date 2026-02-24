import { useState, useEffect } from "react";
import {
  BuscadorIcono,
  DesplegadorIcono,
  NotificacionesIcono,
  RefrescarIcono,
} from "../../../assets/Icons";
import { Sun, Moon } from "lucide-react";

import MenuUsuario from "../MenuUsuario/MenuUsuario";
import { Link } from "react-router-dom";
import MenuNotificacion from "../MenuNotificacion/MenuNotificacion";

const BarraNavegacion = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuAbiertoNotificacion, setMenuAbiertoNotificacion] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-[50]">
      <nav className="px-5 bg-[var(--surface)] border-b border-[var(--border-subtle)] shadow-sm h-14 flex items-center justify-between transition-all duration-300">
        <div className="flex-1 flex items-center">
          {/* Lado izquierdo reservado para buscador o breadcrumb si es necesario */}
        </div>

        <div className="flex items-center gap-3">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg! bg-[var(--surface-hover)] text-[var(--text-theme)]! hover:text-[var(--primary)] transition-all border border-[var(--border-subtle)] cursor-pointer"
            title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* DEMO */}
          <Link to={"/panel/demo"} className="text-[10px] font-bold px-2.5 py-1 bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20 rounded-lg uppercase tracking-wider">
            Demo
          </Link>

          {/* ARCA STATUS */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border-subtle)] group cursor-help">
            <RefrescarIcono size={16} color="var(--text-muted)" className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Arca:</span>
            <div className="relative flex items-center">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
          </div>

          {/* NOTIFICACIONES */}
          <div className="relative">
            <button
              onClick={() => setMenuAbiertoNotificacion(!menuAbiertoNotificacion)}
              className="p-2 rounded-lg text-[var(--text-theme)]! hover:text-[var(--primary)]! hover:bg-[var(--primary-subtle)] transition-all relative cursor-pointer"
            >
              <NotificacionesIcono size={18} />
              <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-[9px] font-bold h-4 w-4 flex items-center justify-center text-white rounded-full border-2 border-[var(--surface)]">
                5
              </span>
            </button>
            {menuAbiertoNotificacion && <MenuNotificacion />}
          </div>

          <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

          {/* PERFIL */}
          <div className="relative flex items-center gap-2">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[11px] font-bold text-[var(--text-primary)] leading-none">Admin Usuario</span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">Administrador</span>
            </div>
            <button
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-theme)]! hover:text-[var(--primary)]! transition-all cursor-pointer"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              <DesplegadorIcono size={14} className={` transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`} />
            </button>
            {menuAbierto && <MenuUsuario />}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default BarraNavegacion;
