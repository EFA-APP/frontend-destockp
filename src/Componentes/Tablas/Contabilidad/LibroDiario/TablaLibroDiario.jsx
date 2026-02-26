// TablaLibroDiario.jsx

import { useLibroDiario } from "../../../../Backend/hooks/Contabilidad/LibroDiario/useLibroDiario";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasLibroDiario } from "./columnasLibroDiario";

const TablaLibroDiario = () => {
  const {
    asientos, // ← ASIENTOS
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
  } = useLibroDiario();

  return (
    <div className="space-y-4">
      <DataTable
        columnas={columnasLibroDiario}
        datos={asientos}
        mostrarBuscador={false}
        mostrarAcciones={true}
        mostrarFiltros
        filtrosElementos={
          <>
            <FechaInput
              label="Desde:"
              value={fechaDesde}
              onChange={setFechaDesde}
              size="sm"
            />
            <FechaInput
              label="Hasta:"
              value={fechaHasta}
              onChange={setFechaHasta}
              size="sm"
            />
            <Select
              label="Origen"
              valor={origen}
              setValor={setOrigen}
              options={[
                { valor: "TODOS", texto: "Todos" },
                { valor: "VENTA", texto: "Ventas" },
                { valor: "COMPRA", texto: "Compras" },
                { valor: "MANUAL", texto: "Manual" },
              ]}
            />
          </>
        }
        renderDetalle={(asiento) => (
          <div className="p-4 bg-[var(--surface-hover)]/30 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                  <th className="px-3 py-2 text-left font-bold uppercase tracking-wider text-[10px]">Cuenta</th>
                  <th className="px-3 py-2 text-right font-bold uppercase tracking-wider text-[10px]">Debe</th>
                  <th className="px-3 py-2 text-right font-bold uppercase tracking-wider text-[10px]">Haber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]/50">
                {asiento?.movimientos?.map((mov) => (
                  <tr key={mov.id} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-mono font-bold text-[var(--primary)]">{mov.cuenta}</div>
                      <div className="text-[10px] opacity-70">
                        {mov.nombreCuenta}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* ================= FOOTER CONTABLE ================= */}
      <div className="mt-2 space-y-2">
        {/* Barra Total Debe / Haber */}
        <div className="flex items-center justify-between rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface)] shadow-md">
          <div className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">
            Total Debe:{" "}
            <span className="text-[var(--primary)] text-sm ml-2">
              ${totales.debe.toFixed(2)}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-[var(--border-subtle)]" />

          <div className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-right">
            Total Haber:{" "}
            <span className="text-green-500 text-sm ml-2">${totales.haber.toFixed(2)}</span>
          </div>
        </div>

        {/* Balance Status */}
        <div className="flex justify-center">
          <div className={`px-6 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest ${totales.debe === totales.haber
            ? "bg-green-500/10 border-green-500/30 text-green-500"
            : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}>
            {totales.debe === totales.haber ? "Balanceado ✓" : "Desbalanceado ✗"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaLibroDiario;
