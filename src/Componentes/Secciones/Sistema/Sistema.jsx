import React, { useState } from "react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { 
  ConfiguracionEmpresaIcono, 
  CuentaIcono, 
  CajaIcono,
  ConfiguracionIcono 
} from "../../../assets/Icons";
import Empresas from "./Empresas";
import TablaUsuarios from "../../Tablas/Sistema/TablaUsuarios";
import TablaUnidadesNegocio from "../../Tablas/Sistema/TablaUnidadesNegocio";
import { useObtenerUsuarios } from "../../../Backend/Autenticacion/queries/Usuario/useObtenerUsuarios.query";

const Sistema = () => {
  const [tabActiva, setTabActiva] = useState("empresas");
  const [busqueda, setBusqueda] = useState("");
  
  // Queries
  const { data: usuarios, isLoading: cargandoUsuarios, refetch: refetchUsuarios } = useObtenerUsuarios();

  const tabs = [
    { id: "empresas", nombre: "Empresas", icono: <ConfiguracionEmpresaIcono size={14} />, color: "#10b981" },
    { id: "usuarios", nombre: "Usuarios", icono: <CuentaIcono size={14} />, color: "#3b82f6" },
    { id: "unidades", nombre: "Unidades", icono: <CajaIcono size={14} />, color: "#f59e0b" },
    { id: "roles", nombre: "Roles y Permisos", icono: <ConfiguracionIcono size={14} />, color: "#8b5cf6" },
  ];

  const renderContent = () => {
    switch (tabActiva) {
      case "empresas":
        return <Empresas />;
      case "usuarios":
        return (
          <div className="flex flex-col gap-4 p-6 animate-in fade-in duration-500">
            <div className="relative group">
              <input
                type="text"
                placeholder="BUSCAR USUARIOS..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                className="w-full pl-12 pr-4 py-3 bg-white border border-black/10 rounded-md text-[13px] font-bold shadow-sm focus:outline-none focus:border-black/30 transition-all"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>
            <TablaUsuarios 
              usuarios={usuarios} 
              cargando={cargandoUsuarios} 
              busqueda={busqueda} 
              onRefrescar={refetchUsuarios} 
            />
          </div>
        );
      case "unidades":
        return (
          <div className="flex flex-col gap-4 p-6 animate-in fade-in duration-500">
            <div className="p-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest bg-white rounded-md border border-black/5 shadow-sm">
              Seleccione una empresa para ver sus unidades de negocio
            </div>
          </div>
        );
      default:
        return (
          <div className="p-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest">
            Próximamente: {tabActiva.toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--fill)] text-[var(--text-primary)] overflow-hidden p-4 lg:p-6 gap-4">
      <EncabezadoSeccion
        ruta="SISTEMA"
        icono={<ConfiguracionEmpresaIcono size={18} />}
      >
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-md tracking-widest uppercase shadow-sm">
             Modo Administrador
           </span>
        </div>
      </EncabezadoSeccion>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* SISTEMA DE TABS HORIZONTAL PREMIUM */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-black/5 rounded-md shadow-sm overflow-x-auto no-scrollbar shrink-0">
          {tabs.map((tab) => {
            const isActive = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setTabActiva(tab.id);
                  setBusqueda("");
                }}
                className={`
                  relative px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-3 cursor-pointer whitespace-nowrap
                  ${isActive ? "text-black" : "text-[var(--text-muted)] hover:text-black hover:bg-black/5"}
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-black/5 rounded-md border border-black/10" />
                )}
                <div
                  className="w-1.5 h-1.5 rounded-full shadow-sm"
                  style={{ backgroundColor: tab.color }}
                />
                <span className="relative z-10">{tab.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/50 rounded-md overflow-y-auto no-scrollbar border border-black/5">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Sistema;
