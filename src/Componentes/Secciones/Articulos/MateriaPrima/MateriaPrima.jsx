import { useLocation } from "react-router-dom";
import { CanastaIcono } from "../../../../assets/Icons";
import TablaMateriaPrima from "../../../Tablas/Articulos/MateriaPrima/TablaMateriaPrima";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";

const MateriaPrima = () => {
  const location = useLocation();
  const esEspecie = location.pathname.includes("/inventario/especies");
  const titulo = esEspecie ? "Especies" : "Materia Prima";

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion ruta={titulo} icono={<CanastaIcono />} />

      <TablaMateriaPrima />
    </ContenedorSeccion>
  );
};

export default MateriaPrima;
