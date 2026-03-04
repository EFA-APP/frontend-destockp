import { useState } from "react";

function TablaConTabs({ vistas = [], vistaInicial = 0 }) {
  const [vistaActiva, setVistaActiva] = useState(vistaInicial);

  if (!vistas || vistas.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 font-medium">
        No hay vistas configuradas
      </div>
    );
  }

  const vistaActual = vistas[vistaActiva];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Tabs superiores - Diseño de Control Segmentado */}
      <div className="inline-flex p-1.5 bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md w-fit shadow-inner gap-2">
        {vistas.map((vista, index) => {
          const isActive = vistaActiva === index;
          return (
            <button
              key={index}
              onClick={() => setVistaActiva(index)}
              className={`
                flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-md
                text-xs font-black uppercase tracking-widest transition-all duration-300
                ${isActive
                  ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm ring-1 ring-[var(--border-subtle)]'
                  : 'text-[var(--text-theme)]/50 hover:text-[var(--text-theme)] hover:bg-[var(--surface)]/50'
                }
              `}
            >
              {vista.icono && (
                <span className={`transition-colors duration-300 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-theme)]/40'}`}>
                  {vista.icono}
                </span>
              )}
              {vista.titulo}
              {vista.badge && (
                <span className={`
                  ml-1 px-2 py-0.5 text-[10px] font-black rounded-sm transition-all
                  ${isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'bg-black/5 text-[var(--text-theme)]/30'
                  }
                `}>
                  {vista.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido de la vista activa con animación de entrada */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {vistaActual.renderTabla()}
      </div>
    </div>
  );
}

export default TablaConTabs;