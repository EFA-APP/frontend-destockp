import { ContableIcono } from "../../../../assets/Icons";
import TablaPlanDeCuentas from "../../../Tablas/Contabilidad/PlanDeCuentas/TablaPlanDeCuentas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { BookOpen } from "lucide-react";

const PlanDeCuentas = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <EncabezadoSeccion
        ruta="Plan de Cuentas"
        icono={
          <div className="w-10 h-10 bg-black/40 rounded-md flex items-center justify-center text-black shadow-lg">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
        }
      />

      <div className="flex-1 px-8 pb-8">
        <div className="rounded-md overflow-hidden h-full flex flex-col">
          <TablaPlanDeCuentas />
        </div>
      </div>
    </div>
  );
};

export default PlanDeCuentas;
