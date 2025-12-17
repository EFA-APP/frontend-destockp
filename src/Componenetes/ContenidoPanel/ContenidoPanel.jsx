import BarraNavegacion from "../Diseño/MenuNavegacion/BarraNavegacion";
import { Outlet } from "react-router-dom";
const ContenidoPanel = () => {
  return (
    <div className="flex flex-col w-full dark:bg-darkgray pr-2">
      <BarraNavegacion />

      {/* CONTENDOR DE VISTAS RELATIVAS */}
      <div className="bg-[var(--fill2)] dark:bg-dark h-screen rounded-[20px]">
        {/* COMPONENTE DE CONFIGURACION DE PERFIL */}
        <Outlet />
      </div>
    </div>
  );
};

export default ContenidoPanel;
