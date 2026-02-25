import { ClientesIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import TablaClientes from "../../../Tablas/Contactos/Clientes/TablaClientes";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Clientes = () => {
  return (
    <ContenedorSeccion>
      <EncabezadoSeccion ruta={"Clientes"} icono={<ClientesIcono />} />
      <TablaClientes />
    </ContenedorSeccion>
  );
};

export default Clientes;
