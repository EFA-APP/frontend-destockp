import { CanastaIcono } from "../../../../assets/Icons";
import TablaMateriaPrima from "../../../Tablas/Articulos/MateriaPrima/TablaMateriaPrima";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
const MateriaPrima = () => {
  return (
    <ContenedorSeccion>
      <EncabezadoSeccion ruta={"Materia Prima"} icono={<CanastaIcono />} />

      <TablaMateriaPrima />
    </ContenedorSeccion>
  );
};

export default MateriaPrima;
