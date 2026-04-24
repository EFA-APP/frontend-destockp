import ContenidoPanel from "../Componentes/ContenidoPanel/ContenidoPanel";
import BarraLateral from "../Componentes/UI/BarraLateral/BarraLateral";
import NavbarMovil from "../Componentes/UI/BarraLateral/NavbarMovil";

const Panel = () => {
  return (
    <div className="w-full min-h-screen bg-[var(--fill-secondary)]">
      <div className="flex w-full pb-2 md:pb-0">
        <BarraLateral />
        <NavbarMovil />
        <ContenidoPanel />
      </div>
    </div>
  );
};

export default Panel;
