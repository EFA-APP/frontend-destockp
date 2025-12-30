import { NotaCreditoIcono, NotaDebitoIcono } from "../../../../assets/Icons";
import TablaNotasCredito from "../../../Tablas/Ventas/NotaDeCredito/TablaNotaDeCredito";
import TablaNotaDeDebito from "../../../Tablas/Ventas/NotaDeDebito/TablaNotaDeDebito";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const NotaDeDebito = () => {
  return (
    <div className="w-full py-6 px-6 h-auto">
      {/* ENCABEZADO */}
      <EncabezadoSeccion
        ruta={"Nota de debitos"}
        icono={<NotaDebitoIcono size={22} />}
      />

      <TablaNotaDeDebito />
    </div>
  );
};

export default NotaDeDebito;
