import BarraNavegacion from "../UI/MenuNavegacion/BarraNavegacion";
import { Outlet } from "react-router-dom";
const ContenidoPanel = () => {
  return (
    <div className="flex flex-col w-full">
      <BarraNavegacion />

      {/* CONTENDOR DE VISTAS RELATIVAS */}
      <div className="bg-[var(--surface-hover)] h-auto rounded-[10px]">
        <Outlet />
      </div>
    </div>
  );
};

export default ContenidoPanel;
