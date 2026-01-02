import { CanastaIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import TablaMateriaPrima from "../../../Tablas/MateriaPrima/TablaMateriaPrima";

const MateriaPrima = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Materia Prima"} icono={<CanastaIcono />} />

      <TablaMateriaPrima />
    </div>
  );
};

export default MateriaPrima;
