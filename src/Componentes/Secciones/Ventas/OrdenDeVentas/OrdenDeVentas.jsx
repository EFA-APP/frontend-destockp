import { OrdenDeVentaIcono } from "../../../../assets/Icons";
import TablaOrdenDeVentas from "../../../Tablas/Ventas/OrdenDeVentas/TablaOrdenDeVentas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const OrdenDeVentas = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Orden De Ventas"}
        icono={<OrdenDeVentaIcono />}
      />

      <TablaOrdenDeVentas />
    </div>
  );
};

export default OrdenDeVentas;
