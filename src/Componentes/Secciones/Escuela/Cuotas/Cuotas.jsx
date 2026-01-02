import { useAlumnos } from "../../../../api/hooks/Escuela/Alumnos/useAlumnos";
import { AlumnoIcono, CuotasIcono } from "../../../../assets/Icons";
import TablaCuotas from "../../../Tablas/Escuela/Cuotas/TablaCuotas";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";

const Cuotas = () => {
  const { alumnos } = useAlumnos();
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Cuotas"} icono={<CuotasIcono size={22} />} />

      <TablaCuotas alumnos={alumnos} />
    </div>
  );
};

export default Cuotas;
