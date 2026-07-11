import React, { useState } from "react";
import { CerrarIcono, VincularRolUsuarioIcono } from "../../../assets/Icons";
import { useObtenerRoles } from "../../../Backend/Autenticacion/queries/Rol/useObtenerRoles.query";
import { useAsignarRol } from "../../../Backend/Autenticacion/queries/Usuario/useAsignarRol.mutation";
import { useRemoverRol } from "../../../Backend/Autenticacion/queries/Usuario/useRemoverRol.mutation";

const ModalVincularRolUsuario = ({ isOpen, onClose, usuarioAEditar, empresa }) => {
  const [rolSeleccionado, setRolSeleccionado] = useState("");

  // Usamos el hook para buscar los roles de esta empresa en tiempo real
  const { data: respuestaApi, isLoading: isLoadingRoles } = useObtenerRoles(
    isOpen ? { codigoEmpresa: empresa?.codigo || empresa?.codigo } : null
  );
  
  const rolesDisponibles = Array.isArray(respuestaApi) ? respuestaApi : respuestaApi?.roles || [];

  const { mutateAsync: asignarRol, isPending: isAsignando } = useAsignarRol();
  const { mutateAsync: removerRol, isPending: isRemoviendo } = useRemoverRol();

  const isPending = isAsignando || isRemoviendo;

  if (!isOpen || !usuarioAEditar) return null;

  const handleAsignarSubmit = async (e) => {
    e.preventDefault();
    if (!rolSeleccionado) return;
    
    try {
      await asignarRol({
        codigoUsuario: Number(usuarioAEditar.codigo),
        codigoRol: Number(rolSeleccionado),
        codigoEmpresa: Number(empresa.codigo || empresa.codigo),
      });
      setRolSeleccionado("");
      // No cerramos el modal, permitimos que asigne/remueva varios sin salir
    } catch (error) {
      console.error("Error al asignar rol", error);
    }
  };

  const handleRemoverRol = async (codigoRol) => {
    try {
      await removerRol({
        codigoUsuario: Number(usuarioAEditar.codigo),
        codigoRol: Number(codigoRol),
        codigoEmpresa: Number(empresa.codigo || empresa.codigo),
      });
    } catch (error) {
      console.error("Error al remover rol", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <VincularRolUsuarioIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Roles y Permisos
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                {usuarioAEditar.nombre} {usuarioAEditar.apellido}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* ROLES ACTUALES */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Roles Vinculados Actualmente
            </label>
            <div className="p-4 rounded-md border border-black/10 bg-black/[0.02] flex flex-wrap gap-2 min-h-[60px]">
              {usuarioAEditar.roles && usuarioAEditar.roles.length > 0 ? (
                usuarioAEditar.roles.map((rol) => (
                  <div key={rol.codigo} className="flex items-center bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2 py-1 gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">
                      {rol.nombre}
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleRemoverRol(rol.codigo)}
                      disabled={isPending}
                      className="ml-1 p-0.5 rounded-sm hover:bg-indigo-500/20 text-indigo-700/60 hover:text-indigo-700 transition-colors disabled:opacity-50"
                      title="Desvincular Rol"
                    >
                      <CerrarIcono size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-[11px] font-bold text-[var(--text-muted)] italic flex items-center justify-center w-full h-full opacity-60">
                  El usuario no tiene roles asignados.
                </span>
              )}
            </div>
          </div>

          <hr className="border-black/5" />

          {/* FORMULARIO ASIGNAR NUEVO */}
          <form onSubmit={handleAsignarSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Añadir Nuevo Rol
              </label>
              <div className="relative">
                <select
                  required
                  value={rolSeleccionado}
                  onChange={(e) => setRolSeleccionado(e.target.value)}
                  disabled={isLoadingRoles || isPending}
                  className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="" disabled>
                    {isLoadingRoles ? "Cargando roles..." : "-- Selecciona un Rol --"}
                  </option>
                  {rolesDisponibles
                    .filter(r => !usuarioAEditar.roles?.some(ur => ur.codigo === r.codigo)) // Comparamos codigo vs codigo
                    .map((rol) => (
                    <option key={rol.codigo} value={rol.codigo}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                {/* Custom Arrow */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-black/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isPending || !rolSeleccionado}
                className="px-6 py-2.5 bg-indigo-600 rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isAsignando ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <VincularRolUsuarioIcono size={14} color="white" />
                )}
                Añadir
              </button>
            </div>
          </form>

        </div>

        {/* PIE DEL MODAL */}
        <div className="flex justify-end p-4 border-t border-black/10 bg-black/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-black rounded-md text-[12px] font-black uppercase tracking-widest text-white hover:bg-black/80 transition-all"
          >
            Cerrar Panel
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalVincularRolUsuario;
