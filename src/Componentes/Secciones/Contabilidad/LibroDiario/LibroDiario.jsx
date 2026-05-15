import { LibroDiarioIcono } from "../../../../assets/Icons";
import TablaLibroDiario from "../../../Tablas/Contabilidad/LibroDiario/TablaLibroDiario";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const LibroDiario = () => {
  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 min-h-screen">
      <EncabezadoSeccion
        ruta="Libro Diario"
        icono={
          <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-md flex items-center justify-center text-[var(--primary)] shadow-inner">
            <LibroDiarioIcono size={22} strokeWidth={2.5} />
          </div>
        }
      />
      
      <div className="flex-1 px-8 pb-8">
        <div className="max-w-[1600px] mx-auto pt-6">
          <TablaLibroDiario />
        </div>
      </div>
    </div>
  );
};

export default LibroDiario;
