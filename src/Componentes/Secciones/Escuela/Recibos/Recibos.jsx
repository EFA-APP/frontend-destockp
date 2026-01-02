import { ComprobanteIcono } from "../../../../assets/Icons";
import TablaRecibos from "../../../Tablas/Escuela/Recibos/TablaRecibos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
const Recibos = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion
        ruta={"Recibos"}
        icono={<ComprobanteIcono size={20} />}
      />
      <TablaRecibos />
    </div>
  );
};

export default Recibos;
