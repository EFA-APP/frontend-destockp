import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { AgregarIcono } from "../../../assets/Icons";

const CrearProductos = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Crear Producto"} icono={<AgregarIcono />} />

      <div className="px-6 py-4 border-0 card no-inset no-ring bg-[var(--fill)]! shadow-md rounded-md"></div>
    </div>
  );
};

export default CrearProductos;
