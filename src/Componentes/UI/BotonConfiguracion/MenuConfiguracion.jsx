import { Link } from "react-router-dom";
import {
    ConfiguracionIcono,
    CuentaIcono,
    UsuarioIcono
} from "../../../assets/Icons";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";

const MenuConfiguracion = ({ onClose, onOpenVisual }) => {
    const usuario = useAuthStore((state) => state.usuario);
    return (
        <div className="absolute right-0 top-full mt-3 z-50 w-72 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-5 border-b border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-hover)] to-[var(--fill)]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--primary-subtle)] border border-[var(--primary)]/10 shadow-inner">
                        <ConfiguracionIcono size={18} color="var(--primary)" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-widest">Configuración</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mt-0.5">Ajustes y Perfil</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-1">
                <Link
                    to="/panel/configuracion"
                    onClick={onClose}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-[var(--primary-subtle)] group border border-transparent hover:border-[var(--primary)]/10"
                >
                    <div className="p-2 rounded-lg bg-[var(--fill-secondary)] border border-[var(--border-subtle)] group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-colors">
                        <CuentaIcono size={16} className="text-[var(--text-secondary)] group-hover:text-white transition-colors" color="currentColor" />
                    </div>
                    <div className="flex flex-col flex-1">
                        <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">Mi Perfil</span>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pt-0.5">Gestionar cuenta</span>
                    </div>
                </Link>

                {usuario?.roles?.some(r => r.nombre === 'ADMINISTRADOR') && (
                    <button
                        onClick={() => {
                            onClose();
                            onOpenVisual();
                        }}
                        className="flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-[var(--primary-subtle)] group border border-transparent hover:border-[var(--primary)]/10 w-full text-left bg-transparent cursor-pointer"
                    >
                        <div className="p-2 rounded-lg bg-[var(--fill-secondary)] border border-[var(--border-subtle)] group-hover:bg-[var(--primary)] group-hover:border-[var(--primary)] transition-colors">
                            <ConfiguracionIcono size={16} className="text-[var(--text-secondary)] group-hover:text-white transition-colors" color="currentColor" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">Diseño Empresa</span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider pt-0.5">Logo y Colores</span>
                        </div>
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[var(--fill)] border-t border-[var(--border-subtle)] flex justify-between items-center">
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    Sistema Premium
                </p>
                <span className="text-[9px] text-[var(--primary)] font-black bg-[var(--primary-subtle)] px-2 py-0.5 rounded-full uppercase tracking-wider">v1.0.4</span>
            </div>
        </div>
    );
};

export default MenuConfiguracion;
