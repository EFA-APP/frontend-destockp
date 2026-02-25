import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ConfiguracionIcono, CuentaIcono, UsuarioIcono } from "../../../assets/Icons";

const BotonConfiguracionFlotante = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    // Cerrar al hacer clic afuera
    useEffect(() => {
        const handleClickAfuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("mousedown", handleClickAfuera);
        return () => document.removeEventListener("mousedown", handleClickAfuera);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-[999999]" ref={menuRef}>
            {/* MENU DROP-UP */}
            {menuAbierto && (
                <div className="
                    absolute bottom-full right-0 mb-4 w-56 
                    bg-[var(--surface)]/80 backdrop-blur-xl
                    border border-[var(--border-subtle)] 
                    rounded-md! shadow-2xl 
                    overflow-hidden 
                    animate-in fade-in slide-in-from-bottom-4 duration-300
                ">
                    <div className="p-2 space-y-1">
                        <Link
                            to="/panel/configuracion"
                            onClick={() => setMenuAbierto(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md! text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all group"
                        >
                            <div className="p-1.5 rounded-md bg-[var(--surface-hover)] group-hover:bg-transparent border border-[var(--border-subtle)] group-hover:border-transparent transition-colors">
                                <CuentaIcono size={14} />
                            </div>
                            <span className="uppercase tracking-widest">Configurar Perfil</span>
                        </Link>

                        <Link
                            to="/panel/configuracion/roles"
                            onClick={() => setMenuAbierto(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md! text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-subtle)] transition-all group"
                        >
                            <div className="p-1.5 rounded-md bg-[var(--surface-hover)] group-hover:bg-transparent border border-[var(--border-subtle)] group-hover:border-transparent transition-colors">
                                <UsuarioIcono size={14} />
                            </div>
                            <span className="uppercase tracking-widest">Roles y Permisos</span>
                        </Link>
                    </div>

                    <div className="px-4 py-2 bg-[var(--primary-subtle)]/20 border-t border-[var(--border-subtle)]">
                        <p className="text-[8px] text-[var(--text-muted)] uppercase font-bold tracking-widest text-center">
                            Ajustes del Sistema
                        </p>
                    </div>
                </div>
            )}

            {/* BOTON FLOTANTE */}
            <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="group relative"
                title="Configuración Avanzada"
            >
                <div className={`
                    relative flex items-center justify-center 
                    w-9 h-9 
                    bg-[var(--primary)]/40 backdrop-blur-md 
                    border border-[var(--border-subtle)] 
                    rounded-md! shadow-lg 
                    hover:border-[var(--primary)]/50 
                    hover:shadow-[var(--primary)]/20 
                    transition-all duration-300 
                    ${menuAbierto ? 'scale-90 opacity-80' : 'group-hover:-translate-y-1'}
                `}>
                    <div className="absolute inset-0 rounded-md! bg-[var(--primary)]/0! group-hover:bg-[var(--primary)]/5! transition-colors duration-300" />
                    <ConfiguracionIcono
                        size={32}
                        color={"var(--primary)"}
                        className={`transition-all duration-500 ${menuAbierto ? 'rotate-180' : 'group-hover:rotate-90'}`}
                    />
                </div>
            </button>
        </div>
    );
}

export default BotonConfiguracionFlotante;
