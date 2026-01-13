// TablaLibroDiario.jsx

import { useLibroDiario } from "../../../../api/hooks/Contabilidad/LibroDiario/useLibroDiario";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import TablaDesplegableDetalle from "../../../UI/TablaDesplegableDetalle/TablaDesplegableDetalle";
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
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaDesplegableDetalle
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
              <div className="p-4 mx-6 bg-[var(--fill)] rounded-md border border-gray-200/30">

            <table className="w-full text-xs">
              <thead className="bg-[var(--fill)] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Cuenta</th>
                  <th className="px-3 py-2 text-right">Debe</th>
                  <th className="px-3 py-2 text-right">Haber</th>
                </tr>
              </thead>
              <tbody>
                {asiento?.movimientos?.map((mov) => (
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
      <div className="mt-6 space-y-2">
        {/* Barra Total Debe / Haber */}
        <div className="flex items-center justify-between rounded-xl overflow-hidden border border-white/10 bg-gradient-to-r from-orange-600/40 via-[var(--fill2)] to-green-600/40 shadow-inner">
          <div className="px-4 py-2 font-semibold text-sm text-white">
            Total Debe:{" "}
            <span className="text-[var(--primary)]">
              ${totales.debe.toFixed(2)}
            </span>
          </div>

          <div className="px-4 py-2 font-semibold text-sm text-white text-right">
            Total Haber:{" "}
            <span className="text-green-400">${totales.haber.toFixed(2)}</span>
          </div>
        </div>

        {/* Balance */}
        <div className="w-full flex justify-center text-center text-sm font-semibold">
          <div
            className={`w-[300px] text-white border-b border-t bg-gradient-to-r ${
              totales.debe === totales.haber
                ? "border-green-500/30  from-[var(--fill)] via-green-600/40 to-[var(--fill)]"
                : "border-red-500/30 from-[var(--fill)] via-red-600/15 to-[var(--fill)]"
            }  py-2`}
          >
            Balance:{" "}
            <span
              className={
                totales.debe === totales.haber
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {totales.debe === totales.haber
                ? "Balanceado ✓"
                : "Desbalanceado ✗"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablaLibroDiario;
