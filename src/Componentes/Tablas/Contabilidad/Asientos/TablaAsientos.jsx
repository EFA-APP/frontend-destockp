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
    <div className="p-8 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-hover)]/20 backdrop-blur-xl border border-[var(--border-subtle)] rounded-md shadow-2xl shadow-black/5 relative overflow-hidden group">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[var(--primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary)]/10 transition-all duration-700" />

      <div className="relative z-10">
        <div className="mb-6 flex items-end justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-md flex items-center justify-center text-[var(--primary)] shadow-inner">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-[14px] font-black uppercase tracking-[0.25em] text-[var(--primary)] mb-1">
                Detalle del Movimiento
              </h4>
              <p className="text-[11px] font-medium text-black/40 flex items-center gap-1.5 uppercase tracking-wider">
                <Fingerprint size={12} className="text-[var(--primary)]/60" />
                ID de Registro:{" "}
                <span className="font-black text-black/60">{asiento.id}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Asiento Balanceado
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]/80 shadow-sm backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-[11px] font-black text-black/40 uppercase tracking-[0.2em] w-[15%]">
                  Código
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-black/40 uppercase tracking-[0.2em]">
                  Cuenta Contable
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-black/40 uppercase tracking-[0.2em] text-right w-[20%]">
                  Debe
                </th>
                <th className="px-6 py-4 text-[11px] font-black text-black/40 uppercase tracking-[0.2em] text-right w-[20%]">
                  Haber
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border-subtle)]/40">
              {asiento.movimientos.map((mov) => (
                <tr
                  key={mov.id}
                  className="hover:bg-[var(--primary)]/[0.02] transition-all duration-200 group/row"
                >
                  <td className="px-6 py-4.5 text-[12px] font-mono font-bold text-black/50 group-hover/row:text-[var(--primary)] transition-colors">
                    {mov.cuenta}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-black/80 group-hover/row:translate-x-1 transition-transform duration-300">
                        {mov.nombreCuenta}
                      </span>
                      {mov.detalle && (
                        <span className="text-[11px] text-black/40 italic mt-0.5">
                          {mov.detalle}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    {mov.debe > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-black text-emerald-600 font-mono">
                          {formatPrice(mov.debe)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500/60 font-black uppercase tracking-tighter mt-0.5">
                          <ArrowUpLeft size={10} /> Ingreso
                        </div>
                      </div>
                    ) : (
                      <span className="text-black/10 font-black">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    {mov.haber > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-black text-rose-600 font-mono">
                          {formatPrice(mov.haber)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-rose-500/60 font-black uppercase tracking-tighter mt-0.5">
                          <ArrowDownRight size={10} /> Egreso
                        </div>
                      </div>
                    ) : (
                      <span className="text-black/10 font-black">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-black/[0.04] border-t-2 border-[var(--border-subtle)]">
                <td colSpan={2} className="px-6 py-5">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-black/40">
                      Total General
                    </span>
                    <div className="h-px w-12 bg-black/10" />
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="bg-white/50 rounded-md p-2 border border-black/5 shadow-inner">
                    <span className="text-[16px] font-black text-emerald-600 font-mono block">
                      {formatPrice(asiento.totalDebe)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="bg-white/50 rounded-md p-2 border border-black/5 shadow-inner">
                    <span className="text-[16px] font-black text-rose-600 font-mono block">
                      {formatPrice(asiento.totalHaber)}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer info opcional */}
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">
            Moneda Base: Pesos Argentinos (ARS)
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">
                Activos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">
                Pasivos
              </span>
            </div>
          </div>
        </div>
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
