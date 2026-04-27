import { useParams } from "react-router-dom";
import { HistorialIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";
import ListaMovimientos from "../../UI/ListaMovimientos/ListaMovimientos";

/**
 * Página de Historial Global de Movimientos
 * Muestra todos los movimientos de una categoría (PRODUCTO o MATERIA_PRIMA)
 */
const HistorialStockPage = () => {
  const { tipo = "PRODUCTO" } = useParams();

  return (
    <ContenedorSeccion>
      <section className="relative overflow-hidden">
        <EncabezadoSeccion
          ruta={"MOVIMIENTOS"}
          icono={<HistorialIcono size={22} className="text-amber-700" />}
          volver={true}
          redireccionAnterior={-1}
          subTitulo={`${tipo === "PRODUCTO" ? "PRODUCTOS" : "MATERIA PRIMA"}`}
        />
        <ListaMovimientos
          key={tipo}
          codigoArticulo={null}
          tipoArticulo={tipo}
        />
      </section>
    </ContenedorSeccion>
  );
};

export default HistorialStockPage;
