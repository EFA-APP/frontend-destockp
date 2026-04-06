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
         <section className="relative overflow-hidden">
            {/* Glow Header Background */}
            <div className="absolute top-0 left-1/4 w-full h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <EncabezadoSeccion
               ruta={`Inventario / Historial de ${tipo === "PRODUCTO" ? "Productos" : "Materia Prima"}`}
               icono={<HistorialIcono size={22} className="text-amber-500" />}
               volver={true}
               redireccionAnterior={-1}
            />

            <div className="mt-4">
               <div className="bg-[var(--surface)] border border-white/5 rounded-3xl p-4 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                  {/* Inner decorative border */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <ListaMovimientos
                     key={tipo}
                     codigoArticulo={null}
                     tipoArticulo={tipo}
                  />
               </div>
            </div>
         </section>
      </ContenedorSeccion>
   );
};

export default HistorialStockPage;
