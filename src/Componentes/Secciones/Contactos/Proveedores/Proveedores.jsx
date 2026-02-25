import { ProveedoresIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import TablaProveedores from "../../../Tablas/Contactos/Proveedores/TablaProveedores";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Proveedores = () => {
  return (
    <ContenedorSeccion>
      <EncabezadoSeccion ruta={"Proveedores"} icono={<ProveedoresIcono />} />
      <TablaProveedores />
    </ContenedorSeccion>
  );
};

export default Proveedores;
