import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAsignarRol } from '../../../../Backend/Autenticacion/queries/Usuario/useAsignarRol.mutation';
import { useRolesUI } from '../../../../Backend/Autenticacion/hooks/Rol/useRolesUI';

const ModalAsignarRolUsuario = ({ isOpen, onClose, usuario }) => {
    const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
    const { roles, cargandoRol: cargandoRoles } = useRolesUI();
    const asignarRolMutation = useAsignarRol();

    // Reset fields when opened with a new user
    useEffect(() => {
        if (isOpen && usuario) {
            // Según el objeto del usuario, los roles vienen en usuario.roles 
            // y el identificador que coincide con la lista global es r.codigo
            const userRoles = Array.isArray(usuario?.roles)
                ? usuario.roles.map(r => r.codigo || r.codigoSecuencial).filter(Boolean)
                : usuario?.rol ? [usuario.rol.codigo || usuario.rol.codigoSecuencial].filter(Boolean) : [];
            setRolesSeleccionados(userRoles);
        } else {
            setRolesSeleccionados([]);
        }
    }, [isOpen, usuario]);

    if (!isOpen || !usuario) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rolesSeleccionados.length === 0 || !usuario.codigoSecuencial) return;

        try {
            // Ejecutamos las peticiones individualmente ya que el backend espera un rol por petición
            const peticiones = rolesSeleccionados.map(cod =>
                asignarRolMutation.mutateAsync({
                    codigoRol: Number(cod),
                    codigoUsuario: Number(usuario.codigoSecuencial)
                })
            );

            await Promise.all(peticiones);
            onClose();
        } catch (error) {
            console.error("Error en submit:", error);
        }
    };

    const toggleRol = (codigo) => {
        setRolesSeleccionados(prev =>
            prev.includes(codigo)
                ? prev.filter(c => c !== codigo)
                : [...prev, codigo]
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--surface)] w-full max-w-[400px] rounded-md shadow-2xl border border-[var(--border-subtle)] overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {/* Overlay de Carga */}
                {asignarRolMutation.isPending && (
                    <div className="absolute inset-0 z-[110] bg-[var(--surface)]/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[13px] font-bold text-[var(--text-primary)] uppercase tracking-widest">Sincronizando</p>
                                <p className="text-[10px] text-[var(--text-secondary)]">Asignando nuevos roles al sistema...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]/30">
                    <div>
                        <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Gestión de Rol Múltiple</h2>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Asigne o modifique los permisos del usuario</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* User Context Card */}
                    <div className="bg-[var(--surface-hover)]/50 p-4 rounded-md border border-[var(--border-subtle)] mb-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-subtle)]/20 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
                            <span className="text-[var(--primary)] font-bold text-sm tracking-widest uppercase">
                                {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[13px] font-bold text-[var(--text-primary)]">{usuario.nombre} {usuario.apellido}</p>
                            <p className="text-[12px] text-[var(--text-secondary)] truncate max-w-[220px]">{usuario.correoElectronico}</p>
                            <div className="pt-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                                <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Cuenta Activa</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center justify-between">
                            <span>Roles del Sistema a Asignar</span>
                            <span className="text-[10px] font-medium bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-sm">
                                {rolesSeleccionados.length} Seleccionado{rolesSeleccionados.length !== 1 ? 's' : ''}
                            </span>
                        </label>

                        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {cargandoRoles ? (
                                <p className="text-xs text-[var(--text-muted)] italic py-2">Cargando roles...</p>
                            ) : roles.map(r => {
                                // Aquí nos aseguramos de tomar el ID correcto que devuelva el backend
                                const id = r.codigoSecuencial;
                                const isSelected = rolesSeleccionados.includes(id);
                                return (
                                    <div
                                        key={id}
                                        onClick={() => toggleRol(id)}
                                        className={`flex items-center gap-3 p-3 rounded-md border text-left cursor-pointer transition-all ${isSelected
                                            ? 'bg-[var(--primary-subtle)]/30 border-[var(--primary)] shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]'
                                            : 'bg-[#111111] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${isSelected
                                            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                            : 'bg-[var(--surface-hover)] border-[var(--border-medium)]'
                                            }`}>
                                            {isSelected && <X size={12} className="rotate-45" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] font-bold truncate ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                                                {r.nombre}
                                            </p>
                                            {r.descripcion && (
                                                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                                                    {r.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-[var(--border-subtle)]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-md transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={asignarRolMutation.isPending || rolesSeleccionados.length === 0}
                            className={`px-6 py-2.5 flex items-center gap-2 cursor-pointer bg-gradient-to-r from-[var(--primary)] to-[var(--primary-active)] hover:opacity-90 text-white text-[12px] font-bold uppercase tracking-wider rounded-md shadow-lg shadow-[var(--primary)]/20 transition-all transform active:scale-95 ${asignarRolMutation.isPending ? 'opacity-70 cursor-wait' : 'disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            {asignarRolMutation.isPending && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {asignarRolMutation.isPending ? "Guardando Cambios..." : "Confirmar Asignación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAsignarRolUsuario;
