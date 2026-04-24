
import { CargandoIcono } from "../../../assets/Icons";
import useCargadorStore from "../../../store/useCargadorStore";

const Cargador = () => {
  const { cargando } = useCargadorStore((estado) => estado);

  if (!cargando) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[var(--surface-active)]/40 backdrop-blur-md z-[10000] transition-all duration-500">
      <div className="relative flex items-center justify-center">
        {/* Capas de animación de fondo */}
        <div className="loader-glow" />
        <div className="loader-orbit-ring border-t-[var(--primary)]!" />
        <div className="loader-orbit-ring rotate-45 border-b-[var(--primary)]! opacity-40" />
        
        {/* Icono Central Animado */}
        <div className="relative z-10 animate-bounce transition-all duration-700">
          <div className="p-6 rounded-[32px] bg-[var(--surface)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--border-subtle)]">
            <CargandoIcono size={50} color={"var(--primary)"} className="animate-spin" />
          </div>
        </div>

        {/* Texto de carga discreto */}
        <div className="absolute -bottom-16 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] opacity-60 animate-pulse">
          Sincronizando
        </div>
      </div>
    </div>
  );
};

export default Cargador;
