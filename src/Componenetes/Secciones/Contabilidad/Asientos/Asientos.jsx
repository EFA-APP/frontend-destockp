import { CalculadoraIcono, ContableIcono } from "../../../../assets/Icons";
import TablaAsientos from "../../../Tablas/Contabilidad/Asientos/TablaAsientos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Asientos = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion
        ruta="Plan de Cuentas"
        icono={<CalculadoraIcono size={20} />}
      />
      <TablaAsientos />
    </div>
  );
};

export default Asientos;
