import React, { useState } from "react";
import { useEmpresas } from "../../../Backend/Autenticacion/queries/Empresa/useEmpresas.query";
import TablaEmpresas from "../../Tablas/Sistema/TablaEmpresas";
import { ConfiguracionEmpresaIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import VistaUsuariosEmpresa from "./Vistas/VistaUsuariosEmpresa";
import VistaRolesEmpresa from "./Vistas/VistaRolesEmpresa";
import VistaUnidadesNegocio from "./Vistas/VistaUnidadesNegocio";
import VistaConfiguracionCampos from "./Vistas/VistaConfiguracionCampos";
import ModalCrearEmpresa from "../../Modales/Empresa/ModalCrearEmpresa";
import ModalEditarEmpresa from "../../Modales/Empresa/ModalEditarEmpresa";
import { useActualizarEmpresa } from "../../../Backend/Autenticacion/queries/Empresa/useActualizarEmpresa.mutation";

const Empresas = () => {
  const [busqueda, setBusqueda] = useState("");
  const { data: empresas, isLoading, refetch } = useEmpresas();
  const { mutateAsync: actualizarEmpresa } = useActualizarEmpresa();

  // Estados para modales
  const [isModalCrearOpen, setIsModalCrearOpen] = useState(false);
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);

  // Estados para las subvistas (Patrón Master-Detail)
  const [empresaActiva, setEmpresaActiva] = useState(null);
  const [vistaActiva, setVistaActiva] = useState(null); // 'usuarios', 'unidades', 'roles', 'configuracion'

  // --- MANEJADORES DE ACCIONES ---
  const handleUsuariosClick = (fila) => {
    setEmpresaActiva(fila);
    setVistaActiva("usuarios");
    // Hacemos scroll suave hacia abajo para que el usuario note que se abrió la vista
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleUnidadesClick = (fila) => {
    setEmpresaActiva(fila);
    setVistaActiva("unidades");
  };

  const handleRolesClick = (fila) => {
    setEmpresaActiva(fila);
    setVistaActiva("roles");
  };

  const handleConfigurarCamposClick = (fila) => {
    setEmpresaActiva(fila);
    setVistaActiva("configuracion");
  };

  const handleEditarClick = (fila) => {
    setEmpresaActiva(fila);
    setIsModalEditarOpen(true);
  };

  const handleDuplicarClick = (fila) => {
    console.log("Duplicar empresa", fila);
  };

  const handleEliminarClick = async (fila) => {
    // Si quieres un alert de confirmación, podrías usar sweetalert o un modal aquí.
    // Por ahora, aplicamos el bloqueo/desbloqueo instantáneo (soft-delete):
    try {
      await actualizarEmpresa({
        codigoEmpresa: fila.codigo || fila.codigoSecuencial,
        activo: !fila.activo,
      });
    } catch (error) {
      console.error("Error al bloquear/activar empresa:", error);
    }
  };

  const cerrarVistaActiva = () => {
    setVistaActiva(null);
    setEmpresaActiva(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500 pb-20">
      <EncabezadoSeccion
        ruta="Empresas"
        descripcionIcono="Panel maestro para la gestión de organizaciones, unidades de negocio y seguridad."
        icono={<ConfiguracionEmpresaIcono size="24" />}
      />
      {/* HEADER DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <ConfiguracionEmpresaIcono size="24" color="white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              Administración de Empresas
            </h1>
            <p className="text-[13px] font-medium text-[var(--text-muted)]">
              Panel maestro para la gestión de organizaciones, unidades de
              negocio y seguridad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-white border border-black/10 rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/5 transition-all active:scale-95"
          >
            Actualizar
          </button>
          <button 
            onClick={() => setIsModalCrearOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-md active:scale-95"
          >
            Nueva Empresa
          </button>
        </div>
      </div>

      {/* PIE DE SECCIÓN (ESTADÍSTICAS RÁPIDAS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-md flex items-center justify-between">
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
            Empresas Activas
          </span>
          <span className="text-xl font-black text-emerald-700">
            {empresas?.filter((e) => e.activo).length || 0}
          </span>
        </div>
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-md flex items-center justify-between">
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">
            Conexión AFIP
          </span>
          <span className="text-xl font-black text-blue-700">
            {empresas?.filter((e) => e.conexionArca).length || 0}
          </span>
        </div>
        <div className="p-4 bg-black/5 border border-black/10 rounded-md flex items-center justify-between">
          <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            Total Registradas
          </span>
          <span className="text-xl font-black text-black">
            {empresas?.length || 0}
          </span>
        </div>
      </div>

      {/* BUSCADOR RÁPIDO */}
      <div className="relative group">
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
          placeholder="BUSCAR POR NOMBRE, CUIT O RAZÓN SOCIAL..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
          className="w-full pl-12 pr-4 py-3 bg-white border border-black/10 rounded-md text-[13px] font-bold placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-black/30 transition-all shadow-sm"
        />
      </div>

      {/* TABLA DE RESULTADOS PRINCIPAL */}
      <TablaEmpresas
        empresas={empresas}
        cargando={isLoading}
        busqueda={busqueda}
        onRefrescar={refetch}
        handleUsuariosClick={handleUsuariosClick}
        handleUnidadesClick={handleUnidadesClick}
        handleRolesClick={handleRolesClick}
        handleEditarClick={handleEditarClick}
        handleDuplicarClick={handleDuplicarClick}
        handleEliminarClick={handleEliminarClick}
        handleConfigurarCamposClick={handleConfigurarCamposClick}
      />

      {/* VISTAS DETALLE (SUBTABLAS) */}
      {empresaActiva && vistaActiva === "usuarios" && (
        <VistaUsuariosEmpresa 
          empresa={empresaActiva} 
          onClose={cerrarVistaActiva} 
        />
      )}

      {empresaActiva && vistaActiva === "roles" && (
        <VistaRolesEmpresa 
          empresa={empresaActiva} 
          onClose={cerrarVistaActiva} 
        />
      )}
      
      {empresaActiva && vistaActiva === "unidades" && (
        <VistaUnidadesNegocio 
          empresa={empresaActiva} 
          onClose={cerrarVistaActiva} 
        />
      )}

      {empresaActiva && vistaActiva === "configuracion" && (
        <VistaConfiguracionCampos
          empresa={empresaActiva}
          onClose={cerrarVistaActiva}
        />
      )}

      {/* MODALES */}
      <ModalCrearEmpresa 
        isOpen={isModalCrearOpen} 
        onClose={() => setIsModalCrearOpen(false)} 
      />

      <ModalEditarEmpresa 
        isOpen={isModalEditarOpen} 
        onClose={() => setIsModalEditarOpen(false)}
        empresaAEditar={empresaActiva}
      />

    </div>
  );
};

export default Empresas;
