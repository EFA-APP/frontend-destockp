import { InventarioIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaProductos from "../../../Tablas/Articulos/Productos/TablaProductos";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";

const Productos = () => {
  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta={"Productos"}
        icono={<InventarioIcono size={20} />}
      ></EncabezadoSeccion>

      <TablaProductos />
    </ContenedorSeccion>
  );
};

export default Productos;
