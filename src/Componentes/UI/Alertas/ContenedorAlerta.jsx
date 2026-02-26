import { useAlertas } from '../../../store/useAlertas';
import { Alerta } from './Alertas';

export const ContenedorAlerta = () => {
  const { alertas, eliminarAlerta } = useAlertas();

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-full px-4 sm:px-0">
      {alertas.map((alerta) => (
        <Alerta
          key={alerta.id}
          alerta={alerta}
          onCerrar={() => eliminarAlerta(alerta.id)}
        />
      ))}
    </div>
  );
};