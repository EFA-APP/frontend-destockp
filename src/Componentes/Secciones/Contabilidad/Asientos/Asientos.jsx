import { CalculadoraIcono, ConfiguracionIcono } from "../../../../assets/Icons";
import TablaAsientos from "../../../Tablas/Contabilidad/Asientos/TablaAsientos";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { Link } from "react-router-dom";

const Asientos = () => {
  return (
    <div className="w-full py-6 px-6">
      <EncabezadoSeccion ruta="Asientos" icono={<CalculadoraIcono size={20} />}>
        <Link
          to="/panel/contabilidad/configuracion"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all font-bold text-sm"
        >
          Configurar Automatización
        </Link>
      </EncabezadoSeccion>
      <TablaAsientos />
    </div>
  );
};

export default Asientos;
