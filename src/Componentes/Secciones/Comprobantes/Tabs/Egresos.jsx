import BuscadorDetalle from "../Componentes/BuscadorDetalle";
import CabeceraComprobante from "../Componentes/CabeceraComprobante";

const Egresos = ({ tipoOperacion }) => {
  return (
    <div className="h-full w-full">
      <CabeceraComprobante tipoOperacion={tipoOperacion} />
      <BuscadorDetalle tipoOperacion={tipoOperacion} />
    </div>
  );
};

export default Egresos;
