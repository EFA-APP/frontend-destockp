import { AlumnoIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaAlumnos from "../../../Tablas/Escuela/Alumnos/TablaAlumnos";
const Alumnos = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Alumnos"} icono={<AlumnoIcono size={20} />} />
      <TablaAlumnos />
    </div>
  );
};

export default Alumnos;
