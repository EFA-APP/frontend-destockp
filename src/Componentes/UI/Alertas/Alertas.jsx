import { X } from 'lucide-react';
import { tiposDeAlertas } from './alertaConfig';

export const Alerta = ({ alerta, onCerrar }) => {
  const config = tiposDeAlertas[alerta.type] || tiposDeAlertas.info;
  const Icon = config.icon;

  return (
    <div className={`
      relative overflow-hidden
      flex items-center gap-3 px-4 py-3
      bg-[var(--surface-active)] border border-[var(--border-medium)]
      rounded-md shadow-lg
          
      
    `}>
      {/* Indicador lateral de color (Minimalista y formal) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.indicatorColor}`} />

      <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0 ml-1`} strokeWidth={2.5} />

      <p className={`!flex-1 !text-[15px] font-medium text-[var(--text-primary)]`}>
        {alerta.message}
      </p>

      <button
        onClick={onCerrar}
        className="!p-1 !rounded hover:bg-[var(--border-medium)] ! flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        aria-label="Cerrar alerta"
      >
        <X size={14} color='white' />
      </button>
    </div>
  );
};