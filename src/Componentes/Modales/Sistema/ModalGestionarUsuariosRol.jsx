import React, { useState, useMemo } from "react";
import { CerrarIcono, UsuarioIcono } from "../../../assets/Icons";
import { useUsuariosPorEmpresa } from "../../../Backend/Autenticacion/queries/Usuario/useUsuariosPorEmpresa.query";
import { useAsignarRol } from "../../../Backend/Autenticacion/queries/Usuario/useAsignarRol.mutation";
import { useRemoverRol } from "../../../Backend/Autenticacion/queries/Usuario/useRemoverRol.mutation";

const ModalGestionarUsuariosRol = ({ isOpen, onClose, rol, empresa }) => {
  const [busqueda, setBusqueda] = useState("");

  // Obtener todos los usuarios de la empresa
  const { data: respuestaUsuarios, isLoading: isLoadingUsuarios, refetch } = useUsuariosPorEmpresa(
    empresa?.codigo || empresa?.codigo
  );

  const usuariosEmpresa = useMemo(() => {
    return Array.isArray(respuestaUsuarios) 
      ? respuestaUsuarios 
      : respuestaUsuarios?.usuarios || respuestaUsuarios?.data || [];
  }, [respuestaUsuarios]);

  const { mutateAsync: asignarRol, isPending: isAsignando } = useAsignarRol();
  const { mutateAsync: removerRol, isPending: isRemoviendo } = useRemoverRol();

  const isPending = isAsignando || isRemoviendo;

  if (!isOpen || !rol) return null;

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuariosEmpresa.filter(u => {
    const nombreCompleto = `${u.nombre} ${u.apellido}`.toUpperCase();
    return nombreCompleto.includes(busqueda.toUpperCase()) || u.email?.toUpperCase().includes(busqueda.toUpperCase());
  });

  const handleToggleUsuario = async (usuario) => {
    const tieneRol = usuario.roles?.some(r => r.codigo === rol.codigo);
    
    try {
      if (tieneRol) {
        await removerRol({
          codigoUsuario: Number(usuario.codigo),
          codigoRol: Number(rol.codigo),
          codigoEmpresa: Number(empresa.codigo || empresa.codigo),
        });
      } else {
        await asignarRol({
          codigoUsuario: Number(usuario.codigo),
          codigoRol: Number(rol.codigo),
          codigoEmpresa: Number(empresa.codigo || empresa.codigo),
        });
      }
      // Refrescamos la lista para ver el cambio reflejado en el objeto usuario.roles
      refetch();
    } catch (error) {
      console.error("Error al gestionar rol del usuario", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center shadow-md">
              <UsuarioIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Usuarios con el Rol: {rol.nombre}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Vincula o desvincula usuarios directamente a este perfil
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="p-4 border-b border-black/5 bg-black/[0.01]">
          <div className="relative">
            <input
              type="text"
              placeholder="BUSCAR USUARIO POR NOMBRE O EMAIL..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-black/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
        </div>

        {/* LISTADO DE USUARIOS */}
        <div className="flex-1 overflow-y-auto p-2 bg-black/[0.01]">
          {isLoadingUsuarios ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
               <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Cargando Usuarios...</span>
             </div>
          ) : usuariosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {usuariosFiltrados.map((usuario) => {
                const tieneRol = usuario.roles?.some(r => r.codigo === rol.codigo);
                
                return (
                  <div 
                    key={usuario.codigo}
                    className={`p-3 rounded-md border transition-all flex items-center justify-between gap-3 ${
                      tieneRol 
                        ? "bg-indigo-500/5 border-indigo-500/20 ring-1 ring-indigo-500/10" 
                        : "bg-white border-black/5 hover:border-black/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                        tieneRol ? "bg-indigo-500 text-white" : "bg-black/10 text-black/40"
                      }`}>
                        {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[12px] font-black truncate ${tieneRol ? "text-indigo-700" : "text-black"}`}>
                          {usuario.nombre} {usuario.apellido}
                        </span>
                        <span className="text-[10px] font-bold text-black/40 truncate uppercase">
                          {usuario.email}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleUsuario(usuario)}
                      disabled={isPending}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${
                        tieneRol 
                          ? "bg-red-500 text-white hover:bg-red-600 shadow-sm" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      }`}
                    >
                      {tieneRol ? "Quitar" : "Asignar"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <UsuarioIcono size={40} />
              <span className="text-[11px] font-black uppercase tracking-widest mt-2">No se encontraron usuarios</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-black/10 bg-black/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all"
          >
            Cerrar Gestión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionarUsuariosRol;
