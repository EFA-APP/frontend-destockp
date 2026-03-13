import React from "react";
import { useParams } from "react-router-dom";
import { HistorialIcono, MovimientoIcono } from "../../../assets/Icons";
import { Info, AlertCircle, Clock } from "lucide-react";
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
      <EncabezadoSeccion
        ruta={`Historial de ${tipo === "PRODUCTO" ? "Productos" : "Materia Prima"}`}
        icono={<HistorialIcono size={20} />}
        volver={true}
        redireccionAnterior={-1}
      />

      {/* Main Content Area */}

      {/* Right Panel: The Log */}
      <section className="bg-[var(--surface)] border border-white/5 rounded-md p-6 shadow-sm min-h-[600px]">
        <ListaMovimientos
          key={tipo}
          codigoArticulo={null} // Global mode
          tipoArticulo={tipo}
        />
      </section>

    </ContenedorSeccion>
  );
};

export default HistorialStockPage;
