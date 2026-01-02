import { LibroMayorIcono } from "../../../../assets/Icons";
import TablaLibroMayor from "../../../Tablas/Contabilidad/LibroMayor/TablaLibroMayor";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const LibroMayor = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion
        ruta="Libro Mayor"
        icono={<LibroMayorIcono size={20} />}
      />

      <TablaLibroMayor />
    </div>
  );
};

export default LibroMayor;
