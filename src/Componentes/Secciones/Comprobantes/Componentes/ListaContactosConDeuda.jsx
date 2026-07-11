import React from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useContactosConDeudaQuery } from "../../../../Backend/Ventas/queries/Comprobante/useContactosConDeuda.query";
import { UserIcon, Receipt, CalendarClock, ArrowRight, Loader2 } from "lucide-react";

export const ListaContactosConDeuda = ({ tipoOperacion, onSeleccionarContacto }) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const codigoUnidadNegocio = usuario?.codigoUnidadNegocio;

  const { data, isLoading } = useContactosConDeudaQuery(
    tipoOperacion,
    codigoEmpresa,
    codigoUnidadNegocio
  );

  const contactos = data?.contactos || [];
  const resumenUnidades = data?.resumenUnidades || [];

  const formatPrice = (n) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
      n ?? 0
    );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("es-AR").format(d);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32 bg-[#FFFFFF] border border-[#E9EDEC] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] mt-5">
        <Loader2 className="w-6 h-6 text-[#1FAE6D] animate-spin" />
      </div>
    );
  }

  if (contactos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#FFFFFF] border border-[#E9EDEC] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] mt-5">
        <div className="flex items-center justify-center w-16 h-16 bg-[#F5F7F6] rounded-full mb-4">
          <Receipt className="w-8 h-8 text-[#9CA5A2]" />
        </div>
        <h4 className="text-[16px] font-semibold text-[#1A1D1C] mb-1">
          Todo al día
        </h4>
        <p className="text-[14px] text-[#6B7472]">
          No hay {tipoOperacion === "INGRESO" ? "cuentas por cobrar" : "cuentas por pagar"} pendientes en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-5 bg-[#FFFFFF] border border-[#E9EDEC] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-[24px] py-[20px] border-b border-[#E9EDEC] bg-[#F5F7F6]">
        <h3 className="text-[18px] font-semibold text-[#1A1D1C] uppercase tracking-wide">
          {tipoOperacion === "INGRESO"
            ? "Cuentas por Cobrar Pendientes"
            : "Cuentas por Pagar Pendientes"}
        </h3>
        <p className="text-[14px] font-normal text-[#6B7472] mt-1">
          Contactos con saldo a favor agrupados por deuda. Selecciona uno para iniciar un comprobante.
        </p>
      </div>

      {resumenUnidades.length > 0 && (
        <div className="px-[24px] py-[12px] bg-[#E8F7EF] border-b border-[#E9EDEC] flex flex-wrap gap-6">
          {resumenUnidades.map((resumen) => {
            const unidadInfo = usuario?.unidadesNegocio?.find(
              (u) => u.codigo === resumen.codigoUnidadNegocio
            );
            const nombreUnidad = unidadInfo?.nombre || `Unidad ${resumen.codigoUnidadNegocio}`;

            return (
              <div key={resumen.codigoUnidadNegocio} className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-[#1FAE6D]">
                  {nombreUnidad}:
                </span>
                <span className="text-[13px] font-medium text-[#1A1D1C]">
                  {resumen.cantidadComprobantes} comprobante{resumen.cantidadComprobantes !== 1 && "s"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="divide-y divide-[#E9EDEC] max-h-[400px] overflow-y-auto">
        {contactos.map((contacto) => {
          const unidadInfo = usuario?.unidadesNegocio?.find(
            (u) => u.codigo === contacto.codigoUnidadNegocio
          );
          const nombreUnidad = unidadInfo?.nombre || `Unidad ${contacto.codigoUnidadNegocio}`;
          const keyAgrupacion = `${contacto.codigoReceptor}-${contacto.codigoUnidadNegocio}`;

          return (
            <div
              key={keyAgrupacion}
              onClick={() => onSeleccionarContacto({
                codigo: contacto.codigoReceptor,
                razonSocial: contacto.razonSocial,
                codigoUnidadNegocio: contacto.codigoUnidadNegocio
              })}
              className="px-[24px] py-[16px] flex items-center justify-between hover:bg-[#F9FAFA] cursor-pointer transition-colors duration-200 group"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#6B7472]" />
                  <span className="text-[15px] font-semibold text-[#1A1D1C]">
                    {contacto.razonSocial}
                  </span>
                  <span className="text-[11px] font-bold text-[#1FAE6D] bg-[#E8F7EF] px-2 py-0.5 rounded-md uppercase">
                    {nombreUnidad}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#6B7472] text-[13px] ml-6">
                  <div className="flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{contacto.cantidadComprobantes} comprobante{contacto.cantidadComprobantes !== 1 && "s"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Vence: {formatDate(contacto.vencimientoMasAntiguo)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[12px] font-medium text-[#6B7472] uppercase tracking-wide">
                    Deuda Total
                  </span>
                  <span className="text-[16px] font-bold text-[#1A1D1C]">
                    {formatPrice(contacto.deudaTotal)}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 text-[#C4C9C8] group-hover:text-[#1FAE6D] transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
