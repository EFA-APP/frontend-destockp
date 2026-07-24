import {
  FileText,
  Fingerprint,
  CheckCircle2,
  ArrowDownRight,
  ArrowUpLeft,
} from "lucide-react";
import { useAsientos } from "../../../../Backend/hooks/Contabilidad/Asientos/useAsientos";
import DataTable from "../../../UI/DataTable/DataTable";
import Select from "../../../UI/Select/Select";
import { columnasAsientos } from "./columnaAsientos";
import { formatPrice } from "../../../../utils/formatters";

const TablaAsientos = () => {
  const { asientos, busqueda, setBusqueda, origen, setOrigen, isLoading } =
    useAsientos();

  const renderDetalleAsiento = (asiento) => (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center text-white shadow-sm">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Detalle del Movimiento
            </h4>
            <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-widest mt-0.5">
              <Fingerprint size={12} className="text-gray-400" />
              ID de Registro: <span className="text-gray-700">{asiento.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-md">
          <CheckCircle2 size={12} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            Asiento Balanceado
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[15%]">
                Código
              </th>
              <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Cuenta Contable
              </th>
              <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right w-[20%]">
                Debe
              </th>
              <th className="px-5 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right w-[20%]">
                Haber
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {asiento.movimientos.map((mov) => (
              <tr key={mov.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-3.5 text-xs font-mono font-bold text-gray-500">
                  {mov.cuenta}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">
                      {mov.nombreCuenta}
                    </span>
                    {mov.detalle && (
                      <span className="text-[11px] text-gray-400 italic mt-0.5">
                        {mov.detalle}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {mov.debe > 0 ? (
                    <span className="text-xs font-black text-emerald-700 font-mono tracking-tight">
                      {formatPrice(mov.debe)}
                    </span>
                  ) : (
                    <span className="text-gray-300 font-black">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {mov.haber > 0 ? (
                    <span className="text-xs font-black text-rose-700 font-mono tracking-tight">
                      {formatPrice(mov.haber)}
                    </span>
                  ) : (
                    <span className="text-gray-300 font-black">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={2} className="px-5 py-3 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Total General
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-sm font-black text-emerald-700 font-mono tracking-tight">
                  {formatPrice(asiento.totalDebe)}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <span className="text-sm font-black text-rose-700 font-mono tracking-tight">
                  {formatPrice(asiento.totalHaber)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  return (
    <DataTable
      id_tabla="asientos"
      columnas={columnasAsientos}
      datos={asientos}
      loading={isLoading}
      renderDetalle={renderDetalleAsiento}
      mostrarBuscador
      botonAgregar={{
        texto: "Crear",
        ruta: "/panel/contabilidad/asientos/nuevo",
        tieneAccion: "CREAR_ASIENTO_MANUAL",
      }}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      placeholderBuscador="Buscar asiento..."
      mostrarFiltros={false}
      filtrosElementos={
        <div className="flex items-center gap-4">
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
        </div>
      }
    />
  );
};

export default TablaAsientos;
