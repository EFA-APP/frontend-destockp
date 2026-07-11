import { CalculadoraIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import TablaAsientos from "../../../Tablas/Contabilidad/Asientos/TablaAsientos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { Link } from "react-router-dom";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

const Asientos = () => {
  return (
    <div className="w-full flex flex-col gap-6 p-6 md:p-8 animate-fade-in">
      <EncabezadoSeccion
        titulo="Asientos Contables"
        descripcion="Explorá y gestioná los asientos del libro diario general."
        ruta="Asientos"
        icono={<CalculadoraIcono size={22} className="text-[var(--primary)]" />}
      />
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <TablaAsientos />
      </div>
    </div>
  );
};

export default Asientos;
