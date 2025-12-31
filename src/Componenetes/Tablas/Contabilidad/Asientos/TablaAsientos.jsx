import { useAsientos } from "../../../../api/hooks/Contabilidad/Asientos/useAsientos";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import { columnasAsientos } from "./columnaAsientos";

const TablaAsientos = () => {
  const { asientos, busqueda, setBusqueda, origen, setOrigen, verDetalle } =
    useAsientos();

  return (
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaReutilizable
        columnas={columnasAsientos}
        datos={asientos}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones
        onVer={verDetalle}
        placeholderBuscador="Buscar asiento..."
        mostrarFiltros
        filtrosElementos={
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
        }
      />
    </div>
  );
};

export default TablaAsientos;
