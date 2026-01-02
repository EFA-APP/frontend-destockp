// TablaLibroDiario.jsx

import { useLibroDiario } from "../../../../api/hooks/Contabilidad/LibroDiario/useLibroDiario";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import { columnasLibroDiario } from "./columnasLibroDiario";

const TablaLibroDiario = () => {
  const {
    movimientos,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
    manejarDetalle,
  } = useLibroDiario();

  return (
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaReutilizable
        columnas={columnasLibroDiario}
        datos={movimientos}
        mostrarBuscador={false}
        onVer={manejarDetalle}
        onDescargar={manejarDetalle}
        mostrarAcciones={true}
        placeholderBuscador=""
        mostrarFiltros
        filtrosElementos={
          <>
            {/* Fecha desde */}
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
      />

      {/* Footer con totales */}
      <div className="mt-4 pt-4 border-t-1 border-gray-400/30 text-white">
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
              totales.debe === totales.haber ? "text-green-600" : "text-red-600"
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
