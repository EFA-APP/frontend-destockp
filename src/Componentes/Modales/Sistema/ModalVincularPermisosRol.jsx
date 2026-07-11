import React, { useState, useMemo, useEffect } from "react";
import { CerrarIcono, RolIcono } from "../../../assets/Icons";
import { useObtenerPermisos } from "../../../Backend/Autenticacion/queries/Permiso/useObtenerPermisos.query";
import { useActualizarRol } from "../../../Backend/Autenticacion/queries/Rol/useActualizarRol.mutation";

const ModalVincularPermisosRol = ({ isOpen, onClose, rol, empresa }) => {
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Obtener todos los permisos disponibles en la empresa
  const { data: respuestaPermisos, isLoading: isLoadingPermisos } = useObtenerPermisos(
    isOpen ? { codigoEmpresa: empresa?.codigo || empresa?.codigo } : null
  );

  const permisosDisponibles = useMemo(() => {
    return Array.isArray(respuestaPermisos) 
      ? respuestaPermisos 
      : respuestaPermisos?.data || [];
  }, [respuestaPermisos]);

  const { mutateAsync: actualizarRol, isPending: isGuardando } = useActualizarRol();

  // Inicializar permisos seleccionados cuando se abre el modal o cambia el rol
  useEffect(() => {
    if (isOpen && rol) {
      // El backend devuelve rol.permisos como un array de nombres (strings)
      setPermisosSeleccionados(rol.permisos || []);
    }
  }, [isOpen, rol]);

  if (!isOpen || !rol) return null;

  const handleTogglePermiso = (nombrePermiso) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(nombrePermiso)
        ? prev.filter((p) => p !== nombrePermiso)
        : [...prev, nombrePermiso]
    );
  };

  const handleGuardar = async () => {
    try {
      // Construimos el array de objetos que espera el backend (PermisosPorRolDto)
      const permisosPayload = permisosSeleccionados.map(nombre => {
        const pOriginal = permisosDisponibles.find(p => p.nombre === nombre);
        return {
          nombre: nombre,
          descripcion: pOriginal?.descripcion || "",
        };
      });

      await actualizarRol({
        codigo: rol.codigo,
        codigoEmpresa: Number(empresa.codigo || empresa.codigo),
        data: {
          permisos: permisosPayload
        }
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar permisos del rol", error);
    }
  };

  const permisosFiltrados = permisosDisponibles.filter(p => 
    p.nombre.toUpperCase().includes(busqueda.toUpperCase()) ||
    p.descripcion?.toUpperCase().includes(busqueda.toUpperCase())
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center shadow-md">
              <RolIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Permisos del Rol: {rol.nombre}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Selecciona las secciones y módulos a los que este rol tiene acceso
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
              placeholder="BUSCAR PERMISO O SECCIÓN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all shadow-sm"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-black/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
        </div>

        {/* LISTADO DE PERMISOS */}
        <div className="flex-1 overflow-y-auto p-4 bg-black/[0.01]">
          {isLoadingPermisos ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
               <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Cargando Permisos...</span>
             </div>
          ) : permisosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permisosFiltrados.map((permiso) => {
                const isSelected = permisosSeleccionados.includes(permiso.nombre);
                
                return (
                  <div 
                    key={permiso.codigo}
                    onClick={() => handleTogglePermiso(permiso.nombre)}
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3 group ${
                      isSelected 
                        ? "bg-indigo-500/5 border-indigo-500/30 ring-1 ring-indigo-500/10 shadow-sm" 
                        : "bg-white border-black/5 hover:border-black/20"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-black/20 group-hover:border-black/40"
                    }`}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[12px] font-black uppercase tracking-tight truncate ${isSelected ? "text-indigo-700" : "text-black"}`}>
                        {permiso.nombre}
                      </span>
                      {permiso.descripcion && (
                        <span className="text-[10px] font-medium text-black/40 line-clamp-2 mt-0.5 leading-tight">
                          {permiso.descripcion}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <RolIcono size={40} />
              <span className="text-[11px] font-black uppercase tracking-widest mt-2">No hay permisos disponibles</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-black/10 bg-black/[0.02] flex items-center justify-between">
          <div className="text-[11px] font-black uppercase tracking-widest text-black/40 ml-2">
            {permisosSeleccionados.length} Permisos Seleccionados
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-black/10 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isGuardando}
              className="px-8 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGuardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalVincularPermisosRol;
