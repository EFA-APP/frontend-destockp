import { ProveedoresIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaProveedores from "../../../Tablas/Proveedores/TablaProveedores";

const Proveedores = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Proveedores"} icono={<ProveedoresIcono />} />
      <TablaProveedores />
    </div>
  );
};

export default Proveedores;
