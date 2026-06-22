import { CalculadoraIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import TablaAsientos from "../../../Tablas/Contabilidad/Asientos/TablaAsientos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { Link } from "react-router-dom";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

const Asientos = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion
        ruta="Asientos"
        icono={<CalculadoraIcono size={20} />}
      />
      <TablaAsientos />
    </div>
  );
};

export default Asientos;
