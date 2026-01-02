import { ClientesIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaClientes from "../../../Tablas/Clientes/TablaClientes";

const Clientes = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Clientes"} icono={<ClientesIcono />} />
      <TablaClientes />
    </div>
  );
};

export default Clientes;
