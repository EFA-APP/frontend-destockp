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
      <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-[16px] mb-6 overflow-hidden">
        <EncabezadoSeccion ruta={titulo} icono={<CanastaIcono />} />
      </div>

      <TablaMateriaPrima />
    </ContenedorSeccion>
  );
};

export default MateriaPrima;
