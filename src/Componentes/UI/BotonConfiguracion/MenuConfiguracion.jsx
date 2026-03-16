import { Link } from "react-router-dom";
import {
    ConfiguracionIcono,
    CuentaIcono,
    UsuarioIcono
} from "../../../assets/Icons";

const MenuConfiguracion = ({ onClose }) => {
    return (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-[var(--surface)]/90 backdrop-blur-2xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--primary-subtle)]/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                        <ConfiguracionIcono size={16} color="var(--primary)" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Configuración</h3>
                        <p className="text-[8px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Ajustes y Perfil</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-2 space-y-1">
                <Link
                    to="/panel/configuracion"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all group"
                >
                    <div className="p-1.5 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] group-hover:border-[var(--primary)]/20 transition-all">
                        <CuentaIcono size={14} color="white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="uppercase tracking-widest font-normal text-white">Mi Perfil</span>
                        <span className="text-[8px] font-normal text-[var(--text-muted)] group-hover:text-[var(--primary)]/70 uppercase pt-1">Gestionar cuenta</span>
                    </div>
                </Link>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[var(--surface-hover)] border-t border-[var(--border-subtle)]">
                <p className="text-[7px] text-[var(--text-muted)] font-bold uppercase tracking-widest text-center">
                    Sistema v1.0.4 - Premium
                </p>
            </div>
        </div>
    );
};

export default MenuConfiguracion;
