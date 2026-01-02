import { ContableIcono } from "../../../../assets/Icons";
import TablaPlanDeCuentas from "../../../Tablas/Contabilidad/PlanDeCuentas/TablaPlanDeCuentas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const PlanDeCuentas = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion ruta="Plan de Cuentas" icono={<ContableIcono />} />
      <TablaPlanDeCuentas />
    </div>
  );
};

export default PlanDeCuentas;
