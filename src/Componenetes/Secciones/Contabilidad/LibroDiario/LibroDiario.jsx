import { LibroDiarioIcono } from "../../../../assets/Icons";
import TablaLibroDiario from "../../../Tablas/Contabilidad/LibroDiario/TablaLibroDiario";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const LibroDiario = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion
        ruta="Libro Diario"
        icono={<LibroDiarioIcono size={20} />}
      />
      <TablaLibroDiario />
    </div>
  );
};

export default LibroDiario;
