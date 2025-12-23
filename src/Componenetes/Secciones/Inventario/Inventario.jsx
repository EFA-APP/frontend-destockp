import { InventarioIcono } from "../../../assets/Icons";
import TablaInventario from "../../Tablas/TablaInventario/TablaInventario";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Inventario = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Inventario"} icono={<InventarioIcono />} />

      <TablaInventario />
    </div>
  );
};

export default Inventario;
