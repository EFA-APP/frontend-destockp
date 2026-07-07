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
            <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-[16px] mb-6 overflow-hidden">
                <EncabezadoSeccion
                    ruta="Reporte de Producción Global"
                    icono={<ProduccionIcono size={20} className="text-[var(--color-brand-primary)]" />}
                    volver={true}
                    redireccionAnterior={-1}
                />
            </div>

            <section className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] p-6 shadow-sm min-h-[600px]">
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
