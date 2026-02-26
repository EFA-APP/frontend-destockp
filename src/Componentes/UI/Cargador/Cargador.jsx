
import { CargandoIcono } from "../../../assets/Icons"
import useCargadorStore from "../../../store/useCargadorStore";
const Cargador = () => {
  const { cargando } = useCargadorStore(estado => estado);  // Accede al estado de loading

  if (!cargando) return null;  // No renderiza nada si no hay loading

  return (
    <div className="fixed flex justify-center items-center w-screen h-screen bg-[var(--primary-light)]/20! ">
      <CargandoIcono size={100} color={"white"} className="animate-spin" />
    </div>
  );
};

export default Cargador;
