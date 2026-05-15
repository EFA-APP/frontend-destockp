import BarraNavegacion from "../UI/MenuNavegacion/BarraNavegacion";
import { Outlet } from "react-router-dom";
import { useUIStore } from "../../Backend/Config/ui.store";
import PageTransitionLoader from "../UI/PageTransitionLoader/PageTransitionLoader";

const ContenidoPanel = () => {
  const { sidebarLocked } = useUIStore();

  return (
    <div className={`flex flex-col w-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${sidebarLocked ? "md:pl-64" : "md:pl-[88px]"}`}>
      <BarraNavegacion />

      {/* CONTENDOR DE VISTAS RELATIVAS CON LOADER ANIMADO */}
      <div className="flex-1 min-h-[calc(100vh-56px)] relative flex flex-col">
        <PageTransitionLoader>
          <Outlet />
        </PageTransitionLoader>
      </div>
    </div>
  );
};

export default ContenidoPanel;
