import ContenidoPanel from "../Componenetes/ContenidoPanel/ContenidoPanel";
import BarraLateral from "../Componenetes/UI/BarraLateral/BarraLateral";

const Panel = () => {
  return (
    <div className="w-full min-h-screen dark:bg-darkgray bg-[var(--fill)]">
      <div className="flex w-full transition-all duration-[2s] ease-in">
        {/* ASIDE */}
        <BarraLateral />
        <div className="w-[250px]"></div>
        <ContenidoPanel />
      </div>
    </div>
  );
};

export default Panel;
