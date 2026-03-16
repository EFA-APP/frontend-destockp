import React, { useState } from 'react';
import { X, Mail, Lock, UserPlus, Shield } from 'lucide-react';
import { useRegistrarUsuario } from '../../../../../Backend/Autenticacion/queries/Usuario/useRegistrarUsuario.mutation';
import { useObtenerRoles } from '../../../../../Backend/Autenticacion/queries/Rol/useObtenerRoles.query';
import { useAsignarRol } from '../../../../../Backend/Autenticacion/queries/Usuario/useAsignarRol.mutation';

const ModalCrearUsuario = ({ isOpen, onClose }) => {
    const [form, setForm] = useState({ nombre: '', apellido: '', correoElectronico: '', contrasena: '', codigoRol: '' });
    const [errores, setErrores] = useState({ correoElectronico: '', contrasena: '' });
    
    // Mutations & Queries
    const { mutate: registrarUsuario, isPending: isPendingRegistrar } = useRegistrarUsuario();
    const { mutate: asignarRol, isPending: isPendingAsignar } = useAsignarRol();
    const { data: rolesResponse, isLoading: cargandoRoles } = useObtenerRoles();

    const roles = Array.isArray(rolesResponse) ? rolesResponse : (rolesResponse?.data || []);
    const isPending = isPendingRegistrar || isPendingAsignar;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Validaciones Reactivas
        let errorMsg = '';
        if (name === 'correoElectronico') {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !regex.test(value)) {
                errorMsg = 'Formato de email inválido';
            }
        }
        if (name === 'contrasena') {
            if (value && value.length < 6) {
                errorMsg = 'Mínimo 6 caracteres';
            }
        }

        setErrores(prev => ({ ...prev, [name]: errorMsg }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const tieneErrores = errores.correoElectronico || errores.contrasena;
        if (!form.nombre.trim() || !form.apellido.trim() || !form.correoElectronico.trim() || !form.contrasena.trim() || !form.codigoRol || tieneErrores) return;

        // 📝 1. Registrar el usuario
        registrarUsuario(
            {
                nombre: form.nombre,
                apellido: form.apellido,
                correoElectronico: form.correoElectronico,
                contrasena: form.contrasena
            },
            {
                onSuccess: (nuevoUsuario) => {
                    // 📝 2. Si se registró bien, asignar el rol con el codigoSecuencial que ahora retorna el backend
                    if (nuevoUsuario && nuevoUsuario.codigoSecuencial) {
                        asignarRol({
                            codigoUsuario: Number(nuevoUsuario.codigoSecuencial),
                            codigoRol: Number(form.codigoRol)
                        }, {
                            onSuccess: () => {
                                setForm({ nombre: '', apellido: '', correoElectronico: '', contrasena: '', codigoRol: '' });
                                onClose();
                            }
                        });
                    } else {
                        // Respaldo por si no devolvía el código (no debería pasar con la fix del backend)
                        onClose();
                    }
                }
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={!isPending ? onClose : undefined} />

            {/* Content */}
            <div className="relative w-full max-w-md bg-[#121212] border border-white/5 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <UserPlus size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-[16px] font-black text-white uppercase tracking-tight">Nuevo Usuario</h2>
                            <p className="text-[11px] text-white/40 font-medium">Registrar y asignar rol en el sistema</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isPending}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Campos de Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange} required disabled={isPending} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Apellido</label>
                            <input name="apellido" value={form.apellido} onChange={handleChange} required disabled={isPending} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Mail size={12} className="text-white/30" /> Email</label>
                        <input type="email" name="correoElectronico" value={form.correoElectronico} onChange={handleChange} required disabled={isPending} className={`w-full bg-black/40 border ${errores.correoElectronico ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none transition-all`} />
                        {errores.correoElectronico && <p className="text-[10px] text-red-400 font-medium ml-1">{errores.correoElectronico}</p>}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Lock size={12} className="text-white/30" /> Contraseña</label>
                        <input type="password" name="contrasena" value={form.contrasena} onChange={handleChange} required disabled={isPending} className={`w-full bg-black/40 border ${errores.contrasena ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-amber-500/50'} rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none transition-all`} />
                        {errores.contrasena && <p className="text-[10px] text-red-400 font-medium ml-1">{errores.contrasena}</p>}
                    </div>

                    {/* Asignación de Rol */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Shield size={13} className="text-amber-500/60" /> Asignar Rol</label>
                        <div className="relative">
                            <select 
                                name="codigoRol" 
                                value={form.codigoRol} 
                                onChange={handleChange} 
                                required 
                                disabled={isPending || cargandoRoles} 
                                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none transition-all"
                            >
                                <option value="" disabled className="bg-[#121212] text-white/50">Seleccione un rol...</option>
                                {roles?.map(rol => (
                                    <option key={rol.codigoSecuencial} value={rol.codigoSecuencial} className="bg-[#121212] text-white">
                                        {rol.nombre}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={16} className="text-white/30" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isPending || !form.nombre.trim() || !form.apellido.trim() || !form.correoElectronico.trim() || !form.contrasena.trim() || !form.codigoRol || errores.correoElectronico || errores.contrasena} className={`w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl font-black text-[12px] uppercase tracking-wider text-white hover:to-amber-400 border border-amber-500/30 shadow-xl mt-3 flex items-center justify-center gap-2 transition-all ${isPending || !form.nombre.trim() || !form.apellido.trim() || !form.correoElectronico.trim() || !form.contrasena.trim() || !form.codigoRol || errores.correoElectronico || errores.contrasena ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
                        {isPending ? "Procesando..." : "Crear Usuario"}
                    </button>
                </form>
            </div>
        </div>
    );
};

function ChevronDown(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>
    );
}

export default ModalCrearUsuario;
