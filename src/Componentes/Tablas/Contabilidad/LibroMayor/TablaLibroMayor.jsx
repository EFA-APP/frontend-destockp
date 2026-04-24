import { useLibroMayor } from "../../../../Backend/hooks/Contabilidad/LibroMayor/useLibroMayor";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import DataTable from "../../../UI/DataTable/DataTable";
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
    <DataTable id_tabla="libromayor"
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
        <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl    ">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/10">
                <th className="px-4 py-3 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Detalle</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap text-right">Debe</th>
                <th className="px-4 py-3 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap text-right">Haber</th>
              </tr>
            </thead>
            <tbody>
              {cuenta.movimientos.map((mov, i) => (
                <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] ">
                  <td className="px-4 py-2.5 text-[13px] text-[var(--text-primary)]">
                    {new Date(mov.fecha + "T00:00:00").toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-[var(--text-primary)]">{mov.descripcion}</td>
                  <td className="px-4 py-2.5 text-[13px] text-right font-medium text-[var(--primary)]">
                    {mov.debe > 0 ? `$${mov.debe.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-right font-medium text-red-400">
                    {mov.haber > 0 ? `$${mov.haber.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    />
  );
};

export default TablaLibroMayor;
