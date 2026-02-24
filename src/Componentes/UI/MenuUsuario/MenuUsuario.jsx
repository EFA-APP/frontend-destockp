import { Link } from "react-router-dom";
import { CerrarSesionIcono, ConfiguracionIcono, CuentaIcono } from "../../../assets/Icons";

const MenuUsuario = () => {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header Info */}
      <div className="px-4 py-4 border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl overflow-hidden border border-[var(--primary)] shadow-sm">
            <CuentaIcono size={24} color="var(--primary)" />
          </div>
          <div className="flex flex-col min-w-0">
            <h5 className="text-[11px] font-bold text-[var(--text-theme)]! truncate leading-tight">
              José Chocobar
            </h5>
            <span className="text-[9px] font-bold text-[var(--secondary)] uppercase tracking-widest mt-0.5">
              Administrador
            </span>
            <p className="text-[9px] text-[var(--text-muted)] truncate mt-1">
              josechocobar@joseguma.com
            </p>
          </div>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-1">
        <Link
          to="/panel/configuracion"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all group"
        >
          <div className=" p-1.5 rounded-md bg-[var(--surface-hover)] group-hover:bg-transparent transition-colors border border-[var(--border-subtle)] group-hover:border-transparent">
            <ConfiguracionIcono size={14} className="group-hover:text-[var(--primary)]" />
          </div>
          <span>Configuración de Cuenta</span>
        </Link>

        <div className="h-px bg-[var(--border-subtle)] my-1 mx-2" />

        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-bold text-red-500 hover:bg-red-500/10 transition-all group"
        >
          <div className="p-1.5 rounded-md bg-red-500/5 group-hover:bg-transparent transition-colors border border-red-500/10 group-hover:border-transparent">
            <CerrarSesionIcono size={14} />
          </div>
          <span>Finalizar Sesión</span>
        </Link>
      </div>

      {/* Footer Info (Optional but professional) */}
      <div className="px-4 py-2 bg-[var(--fill-secondary)]/10 border-t border-[var(--border-subtle)]">
        <p className="text-[8px] text-[var(--text-muted)] uppercase font-bold tracking-tighter text-center">
          Destockp v1.0.4 — © 2026
        </p>
      </div>
    </div>
  );
};

export default MenuUsuario;
