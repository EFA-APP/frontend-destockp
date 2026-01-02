import { NotaCreditoIcono } from "../../../../assets/Icons";
import TablaNotasCredito from "../../../Tablas/Ventas/NotaDeCredito/TablaNotaDeCredito";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const NotaDeCredito = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Nota de creditos"}
        icono={<NotaCreditoIcono />}
      />

      <TablaNotasCredito />
    </div>
  );
};

export default NotaDeCredito;
