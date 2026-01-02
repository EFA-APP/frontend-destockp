import { useAlertas } from '../../../store/useAlertas';
import { Alerta } from './Alertas';

export const ContenedorAlerta = () => {
  const { alertas, eliminarAlerta } = useAlertas();

  return (
    <div className="fixed top-16 right-4 z-50 space-y-3 max-w-md w-full">
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