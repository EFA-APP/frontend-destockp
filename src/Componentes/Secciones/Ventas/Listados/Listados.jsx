import { ComprobanteIcono } from "../../../../assets/Icons";
import TablaComprobantes from "../../../Tablas/Ventas/Comprobantes/TablaComprobantes";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Listados = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion ruta={"Listado de Comprobantes"} icono={<ComprobanteIcono />} />

      <TablaComprobantes />
    </div>
  );
};

export default Listados;
