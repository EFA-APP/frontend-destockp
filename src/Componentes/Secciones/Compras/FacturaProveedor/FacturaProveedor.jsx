import { ComprobanteIcono } from "../../../../assets/Icons";
import TablaFacturasProveedor from "../../../Tablas/Compras/FacturaProveedor/TablaFacturaProveedor";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";


const FacturasProveedor = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      <EncabezadoSeccion
        ruta={"Facturas de proveedor"}
        icono={<ComprobanteIcono />}
      />

      <TablaFacturasProveedor/>
    </div>
  );
};

export default FacturasProveedor;
