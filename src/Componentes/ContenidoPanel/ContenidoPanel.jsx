import BarraNavegacion from "../UI/MenuNavegacion/BarraNavegacion";
import { Outlet } from "react-router-dom";
const ContenidoPanel = () => {
  return (
    <div className="flex flex-col w-full dark:bg-darkgray pr-2">
      <BarraNavegacion />

      {/* CONTENDOR DE VISTAS RELATIVAS */}
      <div className="bg-[var(--fill)] dark:bg-dark h-auto rounded-[20px]">
        <Outlet />
      </div>
    </div>
  );
};

export default ContenidoPanel;
