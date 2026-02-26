import { useAsientos } from "../../../../Backend/hooks/Contabilidad/Asientos/useAsientos";
import DataTable from "../../../UI/DataTable/DataTable";
import Select from "../../../UI/Select/Select";
import { columnasAsientos } from "./columnaAsientos";

const TablaAsientos = () => {
  const { asientos, busqueda, setBusqueda, origen, setOrigen, verDetalle } =
    useAsientos();

  const renderDetalleAsiento = (asiento) => (
    <div className="p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--fill-secondary)]/10">
            <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Cuenta</th>
            <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">Nombre</th>
            <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap text-right">Debe</th>
            <th className="px-4 py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap text-right">Haber</th>
          </tr>
        </thead>

        <tbody>
          {asiento.movimientos.map((mov) => (
            <tr key={mov.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-hover)] transition-colors">
              <td className="px-4 py-2.5 text-[11px] font-mono text-[var(--text-muted)]">{mov.cuenta}</td>
              <td className="px-4 py-2.5 text-[11px] text-[var(--text-primary)]">{mov.nombreCuenta}</td>
              <td className="px-4 py-2.5 text-[11px] text-right font-medium text-[var(--primary)]">
                {mov.debe > 0 ? `$${mov.debe.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
              </td>
              <td className="px-4 py-2.5 text-[11px] text-right font-medium text-blue-400">
                {mov.haber > 0 ? `$${mov.haber.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr className="bg-[var(--fill-secondary)]/5 font-bold">
            <td colSpan={2} className="px-4 py-3 text-[10px] uppercase tracking-wider text-[var(--text-muted)] text-right">
              Totales
            </td>
            <td className="px-4 py-3 text-[11px] text-right text-[var(--primary)]">
              ${asiento.totalDebe.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td className="px-4 py-3 text-[11px] text-right text-blue-400">
              ${asiento.totalHaber.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <DataTable
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
  );
};

export default TablaAsientos;
