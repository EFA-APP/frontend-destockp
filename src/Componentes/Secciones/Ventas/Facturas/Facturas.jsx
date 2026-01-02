import { ComprobanteIcono } from "../../../../assets/Icons";
import TablaFacturas from "../../../Tablas/Ventas/Facturas/TablaFacturas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Facturas = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion ruta={"Facturas"} icono={<ComprobanteIcono />} />

      <TablaFacturas />
    </div>
  );
};

export default Facturas;
