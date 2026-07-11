import React, { useState } from "react";
import { useObtenerRoles } from "../../../../Backend/Autenticacion/queries/Rol/useObtenerRoles.query";
import { useObtenerPermisos } from "../../../../Backend/Autenticacion/queries/Permiso/useObtenerPermisos.query";
import { useObtenerSeccionesQuery } from "../../../../Backend/Autenticacion/queries/Secciones/useObtenerSecciones.query";
import { useEliminarSeccion } from "../../../../Backend/Autenticacion/queries/Secciones/useEliminarSeccion.mutation";

import TablaRoles from "../../../Tablas/Sistema/TablaRoles";
import TablaPermisos from "../../../Tablas/Sistema/TablaPermisos";
import TablaSecciones from "../../../Tablas/Sistema/TablaSecciones";
import { CerrarIcono } from "../../../../assets/Icons";
import ModalCrearSeccion from "../../../Modales/Sistema/ModalCrearSeccion";
import ModalGestionarAcciones from "../../../Modales/Sistema/ModalGestionarAcciones";
import ModalCrearRol from "../../../Modales/Sistema/ModalCrearRol";
import ModalGestionarUsuariosRol from "../../../Modales/Sistema/ModalGestionarUsuariosRol";
import ModalVincularPermisosRol from "../../../Modales/Sistema/ModalVincularPermisosRol";
import { useEliminarRol } from "../../../../Backend/Autenticacion/queries/Rol/useEliminarRol.mutation";

const VistaRolesEmpresa = ({ empresa, onClose }) => {
  const [busqueda, setBusqueda] = useState("");
  const [pestañaActiva, setPestañaActiva] = useState("ROLES");
  
  // Estados para modales
  const [isModalCrearSeccionOpen, setIsModalCrearSeccionOpen] = useState(false);
  const [seccionAEditar, setSeccionAEditar] = useState(null);
  const [isModalAccionesOpen, setIsModalAccionesOpen] = useState(false);
  const [permisoAGestionar, setPermisoAGestionar] = useState(null);
  const [isModalCrearRolOpen, setIsModalCrearRolOpen] = useState(false);
  const [rolAEditar, setRolAEditar] = useState(null);
  const [isModalGestionarUsuariosOpen, setIsModalGestionarUsuariosOpen] = useState(false);
  const [rolAGestionarUsuarios, setRolAGestionarUsuarios] = useState(null);
  const [isModalVincularPermisosOpen, setIsModalVincularPermisosOpen] = useState(false);
  const [rolAVincularPermisos, setRolAVincularPermisos] = useState(null);
  
  // Parametros comunes
  const filtroEmpresa = { codigoEmpresa: empresa.codigo || empresa.codigo };

  // --- FETCHING DATOS ---
  const queryRoles = useObtenerRoles(filtroEmpresa);
  const queryPermisos = useObtenerPermisos(filtroEmpresa);
  const querySecciones = useObtenerSeccionesQuery(filtroEmpresa);
  const { mutateAsync: eliminarSeccion } = useEliminarSeccion();
  const { mutateAsync: eliminarRol } = useEliminarRol();

  // Extraemos arreglos
  const rolesEmpresa = Array.isArray(queryRoles.data) ? queryRoles.data : queryRoles.data?.data || [];
  const permisosEmpresa = Array.isArray(queryPermisos.data) ? queryPermisos.data : queryPermisos.data?.data || [];
  const seccionesEmpresa = Array.isArray(querySecciones.data) ? querySecciones.data : querySecciones.data?.data || [];

  // --- MANEJADORES DE ACCIONES ---
  const handleAccionEnDesarrollo = async (accion, fila) => {
    if (accion === "CREAR") {
      if (pestañaActiva === "SECCIONES") {
        setSeccionAEditar(null);
        setIsModalCrearSeccionOpen(true);
      }
      if (pestañaActiva === "ROLES") {
        setRolAEditar(null);
        setIsModalCrearRolOpen(true);
      }
      return;
    }

    if (accion === "EDITAR_ROL") {
      setRolAEditar(fila);
      setIsModalCrearRolOpen(true);
      return;
    }

    if (accion === "ELIMINAR_ROL") {
      if (window.confirm(`¿Estás seguro de eliminar el rol "${fila.nombre}"? Esta acción no se puede deshacer.`)) {
        try {
          await eliminarRol({
            codigo: fila.codigo || fila.codigo,
            codigoEmpresa: filtroEmpresa.codigoEmpresa
          });
        } catch (error) {
          console.error("Error al eliminar rol", error);
        }
      }
      return;
    }

    if (accion === "EDITAR_SECCION") {
      setSeccionAEditar(fila);
      setIsModalCrearSeccionOpen(true);
      return;
    }

    if (accion === "ELIMINAR_SECCION") {
      if (window.confirm(`¿Estás seguro de eliminar la sección "${fila.nombre}"? Esto también eliminará su permiso asociado.`)) {
        try {
          await eliminarSeccion({
            codigoEmpresa: filtroEmpresa.codigoEmpresa,
            codigo: fila.codigo
          });
        } catch (error) {
          console.error("Error al eliminar", error);
        }
      }
      return;
    }

    if (accion === "GESTIONAR_USUARIOS_ROL") {
      setRolAGestionarUsuarios(fila);
      setIsModalGestionarUsuariosOpen(true);
      return;
    }

    if (accion === "VINCULAR_PERMISOS_ROL") {
      setRolAVincularPermisos(fila);
      setIsModalVincularPermisosOpen(true);
      return;
    }

    if (accion === "GESTIONAR_ACCIONES") {
      setPermisoAGestionar(fila);
      setIsModalAccionesOpen(true);
      return;
    }

    console.log(`[${accion}] - ${pestañaActiva}:`, fila);
  };

  return (
    <div className="bg-white rounded-md border border-black/10 shadow-lg animate-in slide-in-from-top-4 duration-300 overflow-hidden">
      
      {/* CABECERA Y BOTÓN CERRAR */}
      <div className="flex items-center justify-between p-4 border-b border-black/5 bg-black/[0.02]">
        <div>
          <h2 className="text-lg font-black tracking-tighter text-black uppercase">
            Centro de Seguridad - {empresa.nombre}
          </h2>
          <p className="text-[12px] text-[var(--text-muted)] font-medium">
            Gestionando los perfiles, permisos y módulos habilitados.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-black/10 rounded-md transition-colors"
        >
          <CerrarIcono size={20} />
        </button>
      </div>

      {/* NAVEGACIÓN POR PESTAÑAS (TABS) */}
      <div className="flex px-4 border-b border-black/5 bg-black/[0.01]">
        {["ROLES", "PERMISOS", "SECCIONES"].map((tab) => (
          <button
            key={tab}
            onClick={() => setPestañaActiva(tab)}
            className={`px-4 py-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${
              pestañaActiva === tab
                ? "border-black text-black"
                : "border-transparent text-[var(--text-muted)] hover:text-black hover:bg-black/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 bg-black/[0.01] min-h-[400px]">
        
        {/* BARRA DE HERRAMIENTAS CENTRAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] group-focus-within:text-black transition-colors">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={`BUSCAR ${pestañaActiva}...`}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-black/10 rounded-md text-[13px] font-bold placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-black/30 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => handleAccionEnDesarrollo("CREAR", null)}
            className="px-4 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            NUEVO {pestañaActiva.slice(0, -1)}
          </button>
        </div>

        {/* RENDERIZADO CONDICIONAL DE PESTAÑAS */}
        
        {pestañaActiva === "ROLES" && (
          <div className="animate-in fade-in duration-300">
            <TablaRoles
              roles={rolesEmpresa}
              cargando={queryRoles.isLoading}
              busqueda={busqueda}
              onRefrescar={queryRoles.refetch}
              handleEditarClick={(fila) => handleAccionEnDesarrollo("EDITAR_ROL", fila)}
              handleEliminarClick={(fila) => handleAccionEnDesarrollo("ELIMINAR_ROL", fila)}
              handleGestionarUsuariosClick={(fila) => handleAccionEnDesarrollo("GESTIONAR_USUARIOS_ROL", fila)}
              handleVincularPermisosClick={(fila) => handleAccionEnDesarrollo("VINCULAR_PERMISOS_ROL", fila)}
            />
          </div>
        )}

        {pestañaActiva === "PERMISOS" && (
          <div className="animate-in fade-in duration-300">
             <TablaPermisos
              permisos={permisosEmpresa}
              cargando={queryPermisos.isLoading}
              busqueda={busqueda}
              onRefrescar={queryPermisos.refetch}
              handleEditarClick={(fila) => handleAccionEnDesarrollo("EDITAR_PERMISO", fila)}
              handleEliminarClick={(fila) => handleAccionEnDesarrollo("ELIMINAR_PERMISO", fila)}
              handleGestionarAcciones={(fila) => handleAccionEnDesarrollo("GESTIONAR_ACCIONES", fila)}
            />
          </div>
        )}

        {pestañaActiva === "SECCIONES" && (
          <div className="animate-in fade-in duration-300">
             <TablaSecciones
              secciones={seccionesEmpresa}
              cargando={querySecciones.isLoading}
              busqueda={busqueda}
              onRefrescar={querySecciones.refetch}
              handleEditarClick={(fila) => handleAccionEnDesarrollo("EDITAR_SECCION", fila)}
              handleEliminarClick={(fila) => handleAccionEnDesarrollo("ELIMINAR_SECCION", fila)}
            />
          </div>
        )}

      </div>
      <ModalCrearSeccion 
        isOpen={isModalCrearSeccionOpen}
        onClose={() => setIsModalCrearSeccionOpen(false)}
        empresa={empresa}
        seccionAEditar={seccionAEditar}
      />

      <ModalGestionarAcciones
        isOpen={isModalAccionesOpen}
        onClose={() => setIsModalAccionesOpen(false)}
        permiso={permisoAGestionar}
        rolesEmpresa={rolesEmpresa}
        empresa={empresa}
      />

      <ModalCrearRol
        isOpen={isModalCrearRolOpen}
        onClose={() => setIsModalCrearRolOpen(false)}
        empresa={empresa}
        rolAEditar={rolAEditar}
      />

      <ModalGestionarUsuariosRol
        isOpen={isModalGestionarUsuariosOpen}
        onClose={() => setIsModalGestionarUsuariosOpen(false)}
        empresa={empresa}
        rol={rolAGestionarUsuarios}
      />

      <ModalVincularPermisosRol
        isOpen={isModalVincularPermisosOpen}
        onClose={() => setIsModalVincularPermisosOpen(false)}
        empresa={empresa}
        rol={rolAVincularPermisos}
      />
    </div>
  );
};

export default VistaRolesEmpresa;
