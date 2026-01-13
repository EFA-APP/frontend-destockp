import { useAsientos } from "../../../../api/hooks/Contabilidad/Asientos/useAsientos";
import Select from "../../../UI/Select/Select";
import TablaDesplegableDetalle from "../../../UI/TablaDesplegableDetalle/TablaDesplegableDetalle";
import { columnasAsientos } from "./columnaAsientos";

const TablaAsientos = () => {
  const { asientos, busqueda, setBusqueda, origen, setOrigen, verDetalle } =
    useAsientos();

  const renderDetalleAsiento = (asiento) => (
    <div className="p-4 mx-6 bg-[var(--fill)] rounded-md border border-gray-200/30">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-400/30 text-white">
          <tr>
            <th className="text-left py-2">Cuenta</th>
            <th className="text-left py-2">Nombre</th>
            <th className="text-right py-2">Debe</th>
            <th className="text-right py-2">Haber</th>
          </tr>
        </thead>

        <tbody>
          {asiento.movimientos.map((mov) => (
            <tr key={mov.id} className="border-b border-gray-700/30">
              <td className="py-2 font-mono text-gray-300">{mov.cuenta}</td>
              <td className="py-2 text-gray-200">{mov.nombreCuenta}</td>
              <td className="py-2 text-right text-green-400">
                {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : ""}
              </td>
              <td className="py-2 text-right text-blue-400">
                {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : ""}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="font-semibold text-white border-t border-gray-400/30">
            <td colSpan={2} className="text-right py-2">
              Totales
            </td>
            <td className="text-right py-2 text-green-400">
              ${asiento.totalDebe.toFixed(2)}
            </td>
            <td className="text-right py-2 text-blue-400">
              ${asiento.totalHaber.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="px-6 py-4 bg-[var(--fill)] shadow-md rounded-md">
      <TablaDesplegableDetalle
        columnas={columnasAsientos}
        datos={asientos}
        renderDetalle={renderDetalleAsiento}
        mostrarBuscador
        botonAgregar={{
          texto: "Agregar Asiento",
          ruta: "/panel/contabilidad/asientos/nuevo",
        }}
        onVer={verDetalle}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
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
