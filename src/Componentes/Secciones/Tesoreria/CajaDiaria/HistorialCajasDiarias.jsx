import { formatPrice, formatDate } from "../../../../utils/formatters";

const HistorialCajasDiarias = ({ historial }) => {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E9EDEC]">
        <span className="text-[15px] font-semibold text-[#1A1D1C]">
          Historial de Cajas Anteriores
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {[
                "Fecha",
                "Fondo Inicial",
                "Ingresos",
                "Egresos",
                "Saldo Esperado",
                "Saldo Contado",
                "Diferencia",
                "Estado",
              ].map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-[13px] font-medium text-[#6B7472] whitespace-nowrap border-b border-[#E9EDEC]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historial.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-sm font-medium text-[#6B7472]"
                >
                  No hay cajas anteriores registradas
                </td>
              </tr>
            ) : (
              historial.map((entrada, index) => (
                <tr
                  key={`${entrada.fecha}-${index}`}
                  className="border-b border-[#E9EDEC] hover:bg-[#F5F7F6] transition-colors cursor-default"
                >
                  <td className="px-6 py-4 text-sm font-normal text-[#1A1D1C] whitespace-nowrap">
                    {formatDate(entrada.fecha)}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-[#1A1D1C] whitespace-nowrap">
                    {formatPrice(entrada.fondoInicial)}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-[#1FAE6D] whitespace-nowrap">
                    {entrada.ingresos !== null && entrada.ingresos !== undefined ? formatPrice(entrada.ingresos) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-normal text-[#EF5A5A] whitespace-nowrap">
                    {entrada.egresos !== null && entrada.egresos !== undefined ? formatPrice(entrada.egresos) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1A1D1C] whitespace-nowrap">
                    {entrada.saldoEsperado !== null && entrada.saldoEsperado !== undefined ? formatPrice(entrada.saldoEsperado) : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1A1D1C] whitespace-nowrap">
                    {entrada.saldoContado !== null && entrada.saldoContado !== undefined ? formatPrice(entrada.saldoContado) : "—"}
                  </td>
                  <td className="px-6 py-4 text-[15px] font-semibold whitespace-nowrap">
                    {entrada.diferencia !== null && entrada.diferencia !== undefined ? (
                      <span
                        className={
                          entrada.diferencia === 0
                            ? "text-[#1FAE6D]"
                            : entrada.diferencia < 0
                              ? "text-[#EF5A5A]"
                              : "text-[#F5B944]"
                        }
                      >
                        {formatPrice(entrada.diferencia)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {entrada.estado === "cerrada" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E8F7EF] text-[#178F58]">
                        Cerrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F5B944]/10 text-[#F5B944]">
                        Abierta
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialCajasDiarias;
