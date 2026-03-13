import React from "react";
import { useParams } from "react-router-dom";
import { ProduccionIcono } from "../../../assets/Icons";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";
import ListaMovimientos from "../../UI/ListaMovimientos/ListaMovimientos";

/**
 * ProduccionReportePage: Página de historial global de producciones.
 */
const ProduccionReportePage = () => {
    return (
        <ContenedorSeccion>
            <EncabezadoSeccion
                ruta="Reporte de Producción Global"
                icono={<ProduccionIcono size={20} />}
                volver={true}
                redireccionAnterior={-1}
            />

            <section className="bg-[var(--surface)] border border-white/5 rounded-md p-6 shadow-sm min-h-[600px]">
                <ListaMovimientos
                    codigoArticulo={null}
                    tipoArticulo="PRODUCTO"
                    filtroOrigen="PRODUCCION"
                />
            </section>
        </ContenedorSeccion>
    );
};

export default ProduccionReportePage;
