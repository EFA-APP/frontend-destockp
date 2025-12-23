import { ClientesIcono, PersonaIcono } from "../../../assets/Icons";
import TablaClientes from "../../Tablas/TablaCliente/TablaCliente";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Clientes = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Clientes"} icono={<ClientesIcono />} />
      <TablaClientes />
    </div>
  );
};

export default Clientes;
