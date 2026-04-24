import { useState, useEffect, useRef } from "react";
import { ConfiguracionIcono } from "../../../assets/Icons";
import MenuConfiguracion from "./MenuConfiguracion";
import ModalConfiguracionVisual from "../../Modales/Empresa/ModalConfiguracionVisual";

const BotonConfiguracion = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [modalVisualAbierto, setModalVisualAbierto] = useState(false);
    const menuRef = useRef(null);

    // Cerrar al hacer clic afuera
    useEffect(() => {
        const handleClickAfuera = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuAbierto(false);
            }
        };
        if (menuAbierto) {
            document.addEventListener("mousedown", handleClickAfuera);
        }
        return () => document.removeEventListener("mousedown", handleClickAfuera);
    }, [menuAbierto]);

    return (
        <div className="relative" ref={menuRef}>
            {/* BOTON DE ACCESO */}
            <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="group relative cursor-pointer"
                title="Configuración"
            >
                <div className={`
                    relative flex items-center justify-center 
                    w-7 h-7
                    bg-[var(--surface-hover)]
                    border border-[var(--border-subtle)] 
                    rounded-lg shadow-sm
                    hover:border-[var(--primary)]/40 
                    hover:bg-[var(--primary-subtle)]/30
                      
                    ${menuAbierto ? 'scale-90 opacity-80' : 'hover:-translate-y-0.5'}
                `}>
                    <div className="absolute inset-0 rounded-lg bg-[var(--primary)]/0 group-hover:bg-[var(--primary)]/5  " />
                    <ConfiguracionIcono
                        size={16}
                        color={menuAbierto ? "var(--primary)" : "var(--text-muted)"}
                        className={`  ${menuAbierto ? 'rotate-180' : 'group-hover:rotate-90 group-hover:text-[var(--primary)]'}`}
                    />
                </div>
            </button>

            {/* MENU DESPLEGABLE */}
            {menuAbierto && (
                <MenuConfiguracion 
                    onClose={() => setMenuAbierto(false)} 
                    onOpenVisual={() => setModalVisualAbierto(true)}
                />
            )}

            {/* MODAL CONFIGURACION VISUAL */}
            <ModalConfiguracionVisual 
                isOpen={modalVisualAbierto} 
                onClose={() => setModalVisualAbierto(false)} 
            />
        </div>
    );
}

export default BotonConfiguracion;
