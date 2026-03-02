import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useObtenerUsuarios } from '../../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query';
import { useAsignarRol } from '../../../../Backend/Autenticacion/queries/Usuario/useAsignarRol.mutation';
import { useRegistrarUsuario } from '../../../../Backend/Autenticacion/queries/Usuario/useRegistrarUsuario.mutation';
import { useRolesUI } from '../../../../Backend/Autenticacion/queries/Rol/useRolesUI';

const ModalAsignarRolUsuario = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState('existente'); // 'existente' | 'nuevo'
    const [formData, setFormData] = useState({
        codigoUsuario: '',
        codigoRol: '',
        nombre: '',
        apellido: '',
        correoElectronico: '',
        contrasena: ''
    });

    const { data: usuariosResponse, isLoading: cargandoUsuarios } = useObtenerUsuarios();
    // Safely destructure or provide default array for usuarios mapping
    const usuarios = Array.isArray(usuariosResponse) ? usuariosResponse : (usuariosResponse?.usuarios || []);

    const { roles, cargandoRol: cargandoRoles } = useRolesUI();

    const asignarRolMutation = useAsignarRol();
    const registrarUsuarioMutation = useRegistrarUsuario();

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (tab === 'existente') {
                if (!formData.codigoUsuario || !formData.codigoRol) return;

                await asignarRolMutation.mutateAsync({
                    codigoRol: Number(formData.codigoRol),
                    codigoUsuario: Number(formData.codigoUsuario)
                });
                onClose();
            } else {
                if (!formData.correoElectronico || !formData.contrasena || !formData.nombre || !formData.apellido || !formData.codigoRol) return;

                // 1. Registrar usuario
                const nuevoUser = await registrarUsuarioMutation.mutateAsync({
                    correoElectronico: formData.correoElectronico,
                    contrasena: formData.contrasena,
                    nombre: formData.nombre,
                    apellido: formData.apellido
                });

                // 2. Asignar rol al usuario nuevo
                // Asumimos que el backend retorna el ID del nuevo usuario creado
                if (nuevoUser && (nuevoUser.id || nuevoUser.codigoUsuario)) {
                    await asignarRolMutation.mutateAsync({
                        codigoRol: Number(formData.codigoRol),
                        codigoUsuario: Number(nuevoUser.id || nuevoUser.codigoUsuario)
                    });
                }
                onClose();
            }
        } catch (error) {
            console.error("Error en submit:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--surface)] w-full max-w-lg rounded-xl shadow-xl border border-[var(--border-subtle)] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-[14px] font-bold text-[var(--text-primary)]">Asignar Rol a Usuario</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--border-subtle)] bg-[var(--surface-hover)]/30">
                    <button
                        onClick={() => setTab('existente')}
                        className={`flex-1 py-3 text-[12px] font-semibold transition-colors ${tab === 'existente' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Usuario Existente
                    </button>
                    <button
                        onClick={() => setTab('nuevo')}
                        className={`flex-1 py-3 text-[12px] font-semibold transition-colors ${tab === 'nuevo' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        Usuario Nuevo
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {tab === 'existente' ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Seleccionar Usuario</label>
                                <select
                                    name="codigoUsuario"
                                    value={formData.codigoUsuario}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                                    required
                                >
                                    <option value="">-- Seleccione un usuario --</option>
                                    {!cargandoUsuarios && usuarios.map(u => (
                                        <option key={u.id || u.codigoUsuario} value={u.id || u.codigoUsuario}>
                                            {u.nombre} {u.apellido} ({u.correoElectronico})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Apellido</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="correoElectronico"
                                    value={formData.correoElectronico}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contraseña</label>
                                <input
                                    type="password"
                                    name="contrasena"
                                    value={formData.contrasena}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-all"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="space-y-1.5 border-t border-[var(--border-subtle)] pt-4 mt-4">
                        <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rol a Asignar</label>
                        <select
                            name="codigoRol"
                            value={formData.codigoRol}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 bg-[#111111] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all flex items-center"
                            required
                        >
                            <option value="">-- Seleccione un rol --</option>
                            {!cargandoRoles && roles.map(r => (
                                <option key={r.id || r.codigoRol} value={r.id || r.codigoRol}>
                                    {r.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 !mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={asignarRolMutation.isPending || registrarUsuarioMutation.isPending}
                            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-semibold rounded-md shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {(asignarRolMutation.isPending || registrarUsuarioMutation.isPending) ? "Procesando..." : "Guardar Asignación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAsignarRolUsuario;
