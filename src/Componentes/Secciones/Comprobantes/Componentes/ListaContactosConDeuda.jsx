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
      <div className="flex justify-center items-center h-32 bg-white border border-gray-200 rounded-xl shadow-sm mt-5">
        <Loader2 className="w-6 h-6 text-[#1FAE6D] animate-spin" />
      </div>
    );
  }

  if (contactos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-xl shadow-sm mt-5">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-md mb-4">
          <Receipt className="w-6 h-6 text-gray-400" />
        </div>
        <h4 className="text-sm font-black text-gray-900 mb-1 uppercase tracking-wider">
          Todo al día
        </h4>
        <p className="text-xs font-medium text-gray-500">
          No hay {tipoOperacion === "INGRESO" ? "cuentas por cobrar" : "cuentas por pagar"} pendientes en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-5 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
          {tipoOperacion === "INGRESO"
            ? "Cuentas por Cobrar Pendientes"
            : "Cuentas por Pagar Pendientes"}
        </h3>
        <p className="text-xs font-medium text-gray-500 mt-0.5">
          Contactos con saldo a favor agrupados por deuda. Seleccioná uno para iniciar un comprobante.
        </p>
      </div>

      {resumenUnidades.length > 0 && (
        <div className="px-6 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap gap-6">
          {resumenUnidades.map((resumen) => {
            const unidadInfo = usuario?.unidadesNegocio?.find(
              (u) => u.codigo === resumen.codigoUnidadNegocio
            );
            const nombreUnidad = unidadInfo?.nombre || `Unidad ${resumen.codigoUnidadNegocio}`;

            return (
              <div key={resumen.codigoUnidadNegocio} className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700">
                  {nombreUnidad}:
                </span>
                <span className="text-xs font-bold text-gray-800">
                  {resumen.cantidadComprobantes} comprobante{resumen.cantidadComprobantes !== 1 && "s"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
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
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/80 cursor-pointer transition-colors duration-150 group"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-900">
                    {contacto.razonSocial}
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {nombreUnidad}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-xs ml-6 font-medium">
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
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Deuda Total
                  </span>
                  <span className="text-sm font-black text-gray-900 font-mono">
                    {formatPrice(contacto.deudaTotal)}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
