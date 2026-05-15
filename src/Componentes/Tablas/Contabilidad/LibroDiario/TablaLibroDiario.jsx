import React from "react";
import { useLibroDiario } from "../../../../Backend/hooks/Contabilidad/LibroDiario/useLibroDiario";
import DataTable from "../../../UI/DataTable/DataTable";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import { formatPrice, formatDate } from "../../../../utils/formatters";
import {
  Calendar,
  Filter,
  ArrowRightLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Hash,
} from "lucide-react";

const TablaLibroDiario = () => {
  const {
    asientos,
    loading,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
  } = useLibroDiario();

  const balanceado = Math.abs(totales.debe - totales.haber) < 0.01;

  const columnas = [
    {
      key: "fecha",
      etiqueta: "Fecha",
      renderizar: (val) => (
        <div className="flex items-center gap-2 py-1">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-[13px] font-black text-slate-700 tracking-tight">
            {formatDate(val)}
          </span>
        </div>
      ),
    },
    {
      key: "descripcion",
      etiqueta: "Descripción / Concepto",
      renderizar: (val, row) => (
        <div className="flex flex-col py-1">
          <span className="font-black text-[13px] text-gray-900 leading-tight uppercase tracking-tight">
            {val}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border ${
                row.origenModulo === "VENTAS"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : row.origenModulo === "COMPRAS"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-purple-50 text-purple-600 border-purple-100"
              }`}
            >
              {row.origenModulo}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "referencia",
      etiqueta: "Referencia",
      renderizar: (val) =>
        val ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-500 rounded border border-slate-200 w-fit">
            <Hash size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {val}
            </span>
          </div>
        ) : (
          <span className="text-slate-300">-</span>
        ),
    },
    {
      key: "debe",
      etiqueta: "Debe",
      renderizar: (val, row) => {
        const totalDebe = (row.detalles || []).reduce(
          (sum, m) => sum + (Number(m.debe) || 0),
          0,
        );
        return (
          <div className="text-right">
            <span className="font-black text-[14px] text-emerald-600 font-mono">
              {formatPrice(totalDebe)}
            </span>
          </div>
        );
      },
    },
    {
      key: "haber",
      etiqueta: "Haber",
      renderizar: (val, row) => {
        const totalHaber = (row.detalles || []).reduce(
          (sum, m) => sum + (Number(m.haber) || 0),
          0,
        );
        return (
          <div className="text-right">
            <span className="font-black text-[14px] text-rose-600 font-mono">
              {formatPrice(totalHaber)}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* FILTROS ELEGANTES */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
          <Filter size={14} className="text-[var(--primary)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--primary)]/70">
            Filtros del Diario
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <Calendar size={12} /> Período
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-[13px] font-black focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                />
                <span className="text-slate-300">→</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-[13px] font-black focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <ArrowRightLeft size={12} /> Origen de Asientos
              </label>
              <SearchableSelect
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                options={[
                  { value: "TODOS", label: "🌍 Todos los Orígenes" },
                  { value: "VENTAS", label: "📄 Ventas / Facturación" },
                  { value: "COMPRAS", label: "🛒 Compras / Proveedores" },
                  { value: "MANUAL", label: "⌨️ Asientos Manuales" },
                ]}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div
                className={`p-4 rounded-md flex items-center justify-between border ${
                  balanceado
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      balanceado ? "bg-emerald-500/20" : "bg-rose-500/20"
                    }`}
                  >
                    {balanceado ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-70">
                      Estado del Diario
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">
                      {balanceado ? "Totalmente Cuadrado" : "Fuera de Balance"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Suma Total DEBE
            </span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 font-mono tracking-tighter">
            {formatPrice(totales.debe)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Suma Total HABER
            </span>
            <TrendingDown size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 font-mono tracking-tighter">
            {formatPrice(totales.haber)}
          </p>
        </div>
      </div>

      {/* TABLA DE ASIENTOS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <DataTable
          columnas={columnas}
          datos={asientos}
          loading={loading}
          mostrarBuscador={false}
          emptyMessage="No se encontraron asientos contables en este período"
          renderDetalle={(asiento) => (
            <div className="p-8 bg-slate-50/80 backdrop-blur-sm border-t border-slate-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-10 h-10 bg-white rounded-md shadow-sm flex items-center justify-center text-[var(--primary)] border border-slate-100">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Detalle del Asiento N° {asiento.id}
                    </h5>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                      Desglose de movimientos de la partida doble
                    </p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Cuenta Contable
                      </th>
                      <th className="py-3 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Debe
                      </th>
                      <th className="py-3 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Haber
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/50">
                    {(asiento.detalles || []).map((mov, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-white transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-700 tracking-tight">
                              {mov.nombreCuenta || mov.cuenta}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              COD: {mov.cuenta}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`text-[14px] font-black font-mono ${mov.debe > 0 ? "text-emerald-600" : "text-slate-300"}`}
                          >
                            {mov.debe > 0 ? formatPrice(mov.debe) : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={`text-[14px] font-black font-mono ${mov.haber > 0 ? "text-rose-600" : "text-slate-300"}`}
                          >
                            {mov.haber > 0 ? formatPrice(mov.haber) : "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-white/50">
                      <td className="py-5 px-4 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        Totales del Asiento
                      </td>
                      <td className="py-5 px-4 text-right font-black font-mono text-[16px] text-emerald-700">
                        {formatPrice(
                          (asiento.detalles || []).reduce(
                            (s, m) => s + (Number(m.debe) || 0),
                            0,
                          ),
                        )}
                      </td>
                      <td className="py-5 px-4 text-right font-black font-mono text-[16px] text-rose-700">
                        {formatPrice(
                          (asiento.detalles || []).reduce(
                            (s, m) => s + (Number(m.haber) || 0),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default TablaLibroDiario;
