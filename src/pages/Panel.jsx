import ContenidoPanel from "../Componentes/ContenidoPanel/ContenidoPanel";
import BarraLateral from "../Componentes/UI/BarraLateral/BarraLateral";
import { useTamañoBarraLateral } from "../store/useTamanoBarraLateral";

const Panel = () => {
  const isExpanded = useTamañoBarraLateral((state) => state.isExpanded);
  return (
    <div className="w-full min-h-screen dark:bg-darkgray bg-[var(--fill)]">
      <div className="flex w-full transition-all duration-[2s] ease-in">
        {/* ASIDE */}
        <BarraLateral />
        <div
          className={`transition-all duration-300 ${
            isExpanded ? "w-[250px]" : "w-[75px]"
          }`}
        />
        <ContenidoPanel />
      </div>
    </div>
  );
};

export default Panel;
