import BarraNavegacion from "../UI/MenuNavegacion/BarraNavegacion";
import { Outlet } from "react-router-dom";
const ContenidoPanel = () => {
  return (
    <div className="flex flex-col w-full md:pl-64 transition-all duration-300">
      <BarraNavegacion />

      {/* CONTENDOR DE VISTAS RELATIVAS */}
      <div className="flex-1 min-h-[calc(100vh-56px)] overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default ContenidoPanel;
