import { useLibroMayor } from "../../../../api/hooks/Contabilidad/LibroMayor/useLibroMayor";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import { columnasLibroMayor } from "./columnasLibroMayor";

const TablaLibroMayor = () => {
  const {
    mayor,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    cuentaSeleccionada,
    setCuentaSeleccionada,
    totales,
  } = useLibroMayor();

  return (
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaReutilizable
        columnas={columnasLibroMayor}
        datos={mayor}
        mostrarFiltros
        filtrosElementos={
          <>
            <FechaInput
              label="Desde:"
              value={fechaDesde}
              onChange={setFechaDesde}
            />
            <FechaInput
              label="Hasta:"
              value={fechaHasta}
              onChange={setFechaHasta}
            />
            <Select
              label="Cuenta"
              valor={cuentaSeleccionada}
              setValor={setCuentaSeleccionada}
              options={[
                { valor: "", texto: "Todas" },
                { valor: "1.1.01.001", texto: "Caja" },
                { valor: "1.1.02.001", texto: "Banco" },
                { valor: "1.1.04.001", texto: "IVA Crédito Fiscal" },
                { valor: "2.1.05.001", texto: "IVA Débito Fiscal" },
                { valor: "5.1.01.001", texto: "Compras" },
                { valor: "6.2.01.001", texto: "Diferencia de cambio" },
                { valor: "5.2.01.001", texto: "Alquileres" },
              ]}
            />
          </>
        }
      />

      {/* Totales */}
      <div className="mt-4 text-right text-sm">
        <div>Debe: ${totales.debe.toFixed(2)}</div>
        <div>Haber: ${totales.haber.toFixed(2)}</div>
        <div className="font-bold">
          Saldo Final: ${totales.saldo.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default TablaLibroMayor;
