import { CanastaIcono, InventarioIcono } from "../../../assets/Icons";
import TablaMateriaPrima from "../../Tablas/MateriaPrima/TablaMateriaPrima";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";

const MateriaPrima = () => {
  return (
    <div className="px-3 py-4 border-0 card no-inset no-ring bg-[var(--fill2)] shadow-md rounded-md">
      <EncabezadoSeccion ruta={"Materia Prima"} icono={<CanastaIcono />} />

      <TablaMateriaPrima />
    </div>
  );
};

export default MateriaPrima;
