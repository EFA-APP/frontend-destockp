import { formatPrice, formatDate } from "../../../../utils/formatters";

const HistorialCajasDiarias = ({ historial }) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm flex-1 flex flex-col">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-black/[0.01]">
        <span className="text-xs font-black text-black/40 uppercase tracking-widest">
          Historial de Cajas Anteriores
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/[0.02] border-b border-[var(--border-subtle)]">
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
                  className="px-5 py-3.5 text-[9px] font-black text-black/40 uppercase tracking-[0.18em] whitespace-nowrap"
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
                  className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                >
                  No hay cajas anteriores registradas
                </td>
              </tr>
            ) : (
              historial.map((entrada, index) => (
                <tr
                  key={`${entrada.fecha}-${index}`}
                  className="border-b border-[var(--border-subtle)]/60 hover:bg-[var(--primary)]/[0.02] transition-colors cursor-default"
                >
                  <td className="px-5 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                    {formatDate(entrada.fecha)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {formatPrice(entrada.fondoInicial)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                    {formatPrice(entrada.ingresos)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-rose-700 whitespace-nowrap">
                    {formatPrice(entrada.egresos)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {formatPrice(entrada.saldoEsperado)}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                    {formatPrice(entrada.saldoContado)}
                  </td>
                  <td className="px-5 py-4 text-xs font-black whitespace-nowrap">
                    <span
                      className={
                        entrada.diferencia === 0
                          ? "text-emerald-600"
                          : entrada.diferencia < 0
                            ? "text-rose-600"
                            : "text-amber-600"
                      }
                    >
                      {formatPrice(entrada.diferencia)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {entrada.estado === "cerrada" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Cerrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
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
