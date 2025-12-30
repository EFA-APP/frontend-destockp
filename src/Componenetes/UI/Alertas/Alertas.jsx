import { X } from 'lucide-react';
import { tiposDeAlertas } from './alertaConfig';

export const Alerta = ({ alerta, onCerrar }) => {
  const config = tiposDeAlertas[alerta.type] || tiposDeAlertas.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-md border ${config.bgColor} ${config.borderColor} shadow-sm transition-all`}>
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm ${config.textColor}`}>{alerta.message}</p>
      <button
        onClick={onCerrar}
        className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        ariaLabel="Cerrar alerta"
      >
        <X className="w-5 h-5 text-red-600" />
      </button>
    </div>
  );
};