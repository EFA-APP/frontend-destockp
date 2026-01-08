// TablaLibroDiario.jsx

import { useLibroDiario } from "../../../../api/hooks/Contabilidad/LibroDiario/useLibroDiario";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import TablaDesplegableDetalle from "../../../UI/TablaDesplegableDetalle/TablaDesplegableDetalle";
import { columnasLibroDiario } from "./columnasLibroDiario";

const TablaLibroDiario = () => {
  const {
    movimientos, // ← ASIENTOS
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
  } = useLibroDiario();

  return (
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaDesplegableDetalle
        columnas={columnasLibroDiario}
        datos={movimientos}
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
        renderDetalle={() => (
          <div className="rounded-md border border-gray-600/30 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[var(--fill)] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Cuenta</th>
                  <th className="px-3 py-2 text-right">Debe</th>
                  <th className="px-3 py-2 text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                {movimientos?.map((mov) => (
                  <tr
                    key={mov.id}
                    className="border-t border-gray-700/30 text-white"
                  >
                    <td className="px-3 py-2">
                      <div className="font-mono">{mov.cuenta}</div>
                      <div className="text-green-400 text-[11px]">
                        {mov.nombreCuenta}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
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
      <div className="mt-4 pt-4 border-t border-gray-400/30 text-white">
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="text-right font-semibold text-sm">
            Total Debe:{" "}
            <span className="text-[var(--primary)]">
              ${totales.debe.toFixed(2)}
            </span>
          </div>
          <div className="text-right font-semibold text-sm">
            Total Haber:{" "}
            <span className="text-[var(--primary)]">
              ${totales.haber.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="text-right text-xs text-gray-400">
          Balance:
          <span
            className={`ml-2 font-semibold ${
              totales.debe === totales.haber ? "text-green-500" : "text-red-500"
            }`}
          >
            {totales.debe === totales.haber
              ? "Balanceado ✓"
              : "Desbalanceado ✗"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TablaLibroDiario;
