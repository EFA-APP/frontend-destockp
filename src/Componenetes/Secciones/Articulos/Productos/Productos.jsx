import { InventarioIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaProductos from "../../../Tablas/Productos/TablaProductos";

const Productos = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion
        ruta={"Productos"}
        icono={<InventarioIcono size={20} />}
      />

      <TablaProductos />
    </div>
  );
};

export default Productos;
