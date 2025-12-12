import BarraLateral from "../Componenetes/BarraLateral/BarraLateral";
import ContenidoPanel from "../Componenetes/ContenidoPanel/ContenidoPanel";

const Panel = () => {
  return (
    <div className="w-full min-h-screen dark:bg-darkgray bg-[var(--fill)]">
      <div className="flex w-full transition-all duration-[2s] ease-in">
        {/* ASIDE */}
        <BarraLateral />
        <div className="w-[220px]"></div>
        <ContenidoPanel />
      </div>
    </div>
  );
};

export default Panel;
