import React, { useState } from "react";
import { useUsuariosPorEmpresa } from "../../../../Backend/Autenticacion/queries/Usuario/useUsuariosPorEmpresa.query";
import TablaUsuarios from "../../../Tablas/Sistema/TablaUsuarios";
import { CerrarIcono } from "../../../../assets/Icons";
import { useActualizarEstadoUsuario } from "../../../../Backend/Autenticacion/queries/Usuario/useActualizarEstadoUsuario.mutation";
import ModalEditarUsuario from "../../../Modales/Sistema/ModalEditarUsuario";
import ModalCrearUsuario from "../../../Modales/Sistema/ModalCrearUsuario";
import ModalVincularRolUsuario from "../../../Modales/Sistema/ModalVincularRolUsuario";
import ModalVincularUnidadesUsuario from "../../../Modales/Sistema/ModalVincularUnidadesUsuario";

const VistaUsuariosEmpresa = ({ empresa, onClose }) => {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState([]);
  
  // Estados para modales
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [isModalVincularRolOpen, setIsModalVincularRolOpen] = useState(false);
  const [isModalVincularUnidadesOpen, setIsModalVincularUnidadesOpen] = useState(false);

  const { data: respuestaApi, isLoading, refetch } = useUsuariosPorEmpresa(empresa.codigo || empresa.codigo);
  const { mutateAsync: actualizarEstado } = useActualizarEstadoUsuario();

  // Extraemos el arreglo de usuarios de la respuesta (respuestaApi.usuarios)
  const usuariosEmpresa = Array.isArray(respuestaApi)
    ? respuestaApi
    : respuestaApi?.usuarios || [];

  // --- MANEJADORES DE ACCIONES ---
  const handleEditarUsuario = (fila) => {
    setUsuarioAEditar(fila);
    setIsModalEditarOpen(true);
  };

  const handleVincularRolUsuarioClick = (fila) => {
    setUsuarioAEditar(fila);
    setIsModalVincularRolOpen(true);
  };

  const handleVincularUnidadesClick = (fila) => {
    setUsuarioAEditar(fila);
    setIsModalVincularUnidadesOpen(true);
  };

  const handleEliminarUsuario = async (fila) => {
    try {
      await actualizarEstado({
        codigo: fila.codigo,
        codigoEmpresa: empresa.codigo || empresa.codigo,
        activo: !fila.activo,
      });
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleCrearUsuario = () => {
    setIsModalCrearOpen(true);
  };

  const handleBloqueoMasivo = async () => {
    try {
      // Bloqueamos a todos los seleccionados secuencialmente (se podría hacer un endpoint masivo si el backend lo permite)
      for (const usuario of seleccionados) {
        await actualizarEstado({
          codigo: usuario.codigo,
          codigoEmpresa: empresa.codigo || empresa.codigo,
          activo: false, // Forzamos a bloqueado
        });
      }
      // Limpiamos la selección
      setSeleccionados([]);
    } catch (error) {
      console.error("Error en bloqueo masivo:", error);
    }
  };

  return (
    <div className="bg-white rounded-md border border-black/10 shadow-lg animate-in slide-in-from-top-4 duration-300 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-black/5 bg-black/[0.02]">
        <div>
          <h2 className="text-lg font-black tracking-tighter text-black uppercase">
            Usuarios de {empresa.nombre}
          </h2>
          <p className="text-[12px] text-[var(--text-muted)] font-medium">
            Gestionando los usuarios asignados a esta organización.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-black/10 rounded-md transition-colors"
        >
          <CerrarIcono size={20} />
        </button>
      </div>

      <div className="p-4 bg-black/[0.01]">
        {/* Barra de Herramientas: Buscador y Botón Crear */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--text-muted)] group-focus-within:text-black transition-colors"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="BUSCAR USUARIOS..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-black/10 rounded-md text-[13px] font-bold placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-black/30 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            {seleccionados.length > 0 && (
              <button 
                onClick={handleBloqueoMasivo}
                className="px-4 py-2.5 bg-red-600/10 text-red-600 border border-red-600/20 rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap animate-in fade-in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Suspender ({seleccionados.length})
              </button>
            )}
            <button 
              onClick={handleCrearUsuario}
              className="px-4 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>

        <TablaUsuarios
          usuarios={usuariosEmpresa}
          cargando={isLoading}
          busqueda={busqueda}
          onRefrescar={refetch}
          handleEditarClick={handleEditarUsuario}
          handleEliminarClick={handleEliminarUsuario}
          handleVincularRolUsuarioClick={handleVincularRolUsuarioClick}
          handleVincularUnidadesClick={handleVincularUnidadesClick}
          onSeleccionCambio={setSeleccionados}
        />
      </div>

      <ModalEditarUsuario 
        isOpen={isModalEditarOpen}
        onClose={() => setIsModalEditarOpen(false)}
        usuarioAEditar={usuariosEmpresa.find(u => u.codigo === usuarioAEditar?.codigo) || usuarioAEditar}
        empresa={empresa}
      />

      <ModalCrearUsuario 
        isOpen={isModalCrearOpen}
        onClose={() => setIsModalCrearOpen(false)}
        empresa={empresa}
      />

      <ModalVincularRolUsuario 
        isOpen={isModalVincularRolOpen}
        onClose={() => setIsModalVincularRolOpen(false)}
        usuarioAEditar={usuariosEmpresa.find(u => u.codigo === usuarioAEditar?.codigo) || usuarioAEditar}
        empresa={empresa}
      />

      <ModalVincularUnidadesUsuario 
        isOpen={isModalVincularUnidadesOpen}
        onClose={() => setIsModalVincularUnidadesOpen(false)}
        usuario={usuariosEmpresa.find(u => u.codigo === usuarioAEditar?.codigo) || usuarioAEditar}
        empresa={empresa}
      />
    </div>
  );
};

export default VistaUsuariosEmpresa;
