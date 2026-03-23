import ContenidoPanel from "../Componentes/ContenidoPanel/ContenidoPanel";
import BarraLateral from "../Componentes/UI/BarraLateral/BarraLateral";
import NavbarMovil from "../Componentes/UI/BarraLateral/NavbarMovil";
import { useTamañoBarraLateral } from "../store/useTamanoBarraLateral";

const Panel = () => {
  const isExpanded = useTamañoBarraLateral((state) => state.isExpanded);
  return (
    <div className="w-full min-h-screen dark:bg-darkgray bg-[var(--fill)]">
      <div className="flex w-full transition-all duration-[2s] ease-in pb-24 md:pb-0">
        {/* ASIDE (Desktop) */}
        <BarraLateral />

        {/* SPACER (Only on Desktop) */}
        <div
          className={`hidden md:block transition-all duration-300 ${
            isExpanded ? "w-[250px]" : "w-[75px]"
          }`}
        />

        {/* MOBILE NAVBAR */}
        <NavbarMovil />

        <ContenidoPanel />
      </div>
    </div>
  );
};

export default Panel;
