import { useLibroMayor } from "../../../../api/hooks/Contabilidad/LibroMayor/useLibroMayor";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import TablaDesplegableDetalle from "../../../UI/TablaDesplegableDetalle/TablaDesplegableDetalle";
import { columnasLibroMayor } from "./columnasLibroMayor";

const TablaLibroMayor = () => {
  const {
    cuentas,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    busqueda,
    setBusqueda
  } = useLibroMayor();

  return (
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaDesplegableDetalle
        columnas={columnasLibroMayor}
        datos={cuentas}
        mostrarAcciones={true}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarFiltros
        filtrosElementos={
          <>
            <FechaInput label="Desde:" value={fechaDesde} onChange={setFechaDesde} />
            <FechaInput label="Hasta:" value={fechaHasta} onChange={setFechaHasta} />
          </>
        }
        renderDetalle={(cuenta) => (
          <div className="p-4 mx-6 bg-[var(--fill)] rounded-md border border-gray-200/30">
            <table className="w-full text-xs border border-gray-600/30 mt-2 bg-[var(--fill)] rounded-md" >
              <thead className="bg-[var(--fill)] text-white">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Detalle</th>
                  <th className="px-3 py-2 text-right">Debe</th>
                  <th className="px-3 py-2 text-right">Haber</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {cuenta.movimientos.map((mov, i) => (
                  <tr key={i} className="border-t border-gray-700/30">
                    <td className="px-3 py-2">
                      {new Date(mov.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-3 py-2">{mov.descripcion}</td>
                    <td className="px-3 py-2 text-right text-blue-400">
                      {mov.debe > 0 ? `$${mov.debe.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-red-400">
                      {mov.haber > 0 ? `$${mov.haber.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />
    </div>
  );
};

export default TablaLibroMayor;
