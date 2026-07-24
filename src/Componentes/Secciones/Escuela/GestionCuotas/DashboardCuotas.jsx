import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatearARS } from "../../../../utils/formatearMoneda";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";

const COLORS = ["#10b981", "#f43f5e", "#f59e0b", "#64748b"]; // Emerald (Pagadas), Rose (Vencidas), Amber (Parciales), Slate (Sin emitir)

/**
 * Optimización de performance (2026-07-14, PARTE 2/2 frontend, ver
 * progress/impl_cuotas-listado-performance-backend.md): los conteos por
 * estado (pagadas/vencidas/parciales/sinEmitir) y `deudaTotal` ya NO se
 * calculan iterando `filas` (que ahora es solo la página actual, ~20 filas)
 * — vienen del universo completo vía prop `resumen` (`useResumenCuotas.js`,
 * `cuotas.resumen`).
 *
 * Nota de mapeo: el backend expone exactamente 4 buckets (pagadas/vencidas/
 * parciales/sinEmitir) — el pie/tarjeta que antes se llamaba "Impagas"
 * (VENCIDA + EMITIDA combinadas) ahora muestra solo `resumen.vencidas`
 * (estrictamente vencidas); los contactos con cuota emitida pero AÚN NO
 * vencida no entran en ningún bucket de este resumen (sí cuentan en
 * `resumen.totalContactos`) — mismo criterio ya documentado en el backend.
 *
 * Optimización de performance, PARTE 3 (2026-07-14, ver
 * progress/impl_cuotas-listado-performance-backend.md): "Total Emitido" y
 * "Total Cobrado" ya NO se derivan de `filas` (la página actual) — vienen
 * de `resumen.totalEmitido`/`resumen.totalCobrado` (universo completo,
 * `cuotas.resumen`), reemplazando la limitación conocida documentada en la
 * PARTE 2. Por eso este componente ya no recibe/usa la prop `filas`.
 */
const DashboardCuotas = ({ resumen, mes, anio, evolucionReal }) => {
  const metricas = useMemo(() => {
    const pagadas = resumen?.pagadas ?? 0;
    const vencidas = resumen?.vencidas ?? 0;
    const parciales = resumen?.parciales ?? 0;
    const sinEmitir = resumen?.sinEmitir ?? 0;
    const totalContactos = resumen?.totalContactos ?? 0;
    const totalDeuda = resumen?.deudaTotal ?? 0;
    const totalEmitido = resumen?.totalEmitido ?? 0;
    const totalCobrado = resumen?.totalCobrado ?? 0;

    const dataPie = [
      { name: "Abonadas", value: pagadas },
      { name: "Vencidas", value: vencidas },
      { name: "Parciales", value: parciales },
      { name: "Sin Emitir", value: sinEmitir },
    ].filter((d) => d.value > 0);

    return {
      pagadas,
      vencidas,
      parciales,
      sinEmitir,
      totalContactos,
      totalEmitido,
      totalCobrado,
      totalDeuda,
      dataPie,
    };
  }, [resumen]);

  // Evolución últimos 6 meses (BarChart). Bugfix
  // "cuotas-evolucion-facturas-reales": el array ya llega agregado y
  // ordenado (más viejo primero) desde `cuotas.evolucion`
  // (contabilidad-ms/comprobantes-ms, Facturas reales) vía el prop
  // `evolucionReal` — acá solo se renombran los campos al nombre que ya
  // espera el JSX de abajo (BarChart + tabla), sin recalcular nada.
  const evolucionData = useMemo(() => {
    if (!evolucionReal) return [];

    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return evolucionReal.map((fila) => {
      const d = new Date(fila.fechaVto);
      const name = mesesNombres[d.getMonth()] || "";
      const anio = d.getFullYear();
      
      const emitido = fila.totalEmitido || 0;
      const cobrado = fila.totalCobrado || 0;
      const deuda = emitido - cobrado;
      const porcentajePendiente = emitido > 0 ? (deuda / emitido) * 100 : 0;

      return {
        name,
        anio,
        Cobrado: cobrado,
        Deuda: deuda,
        Emitido: emitido,
        PorcentajePendiente: porcentajePendiente,
      };
    });
  }, [evolucionReal]);

  return (
    <div className="flex flex-col gap-5 mb-6">
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* HERO KPI */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-5 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={100} />
          </div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Total Emitido
            </span>
          </div>
          <span className="text-3xl font-black text-white relative z-10 tracking-tight">
            {formatearARS(metricas.totalEmitido)}
          </span>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Total Cobrado
            </span>
            <div className="p-1.5 bg-[#1FAE6D]/10 text-[#1FAE6D] rounded-md">
              <TrendingUp size={14} strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            {formatearARS(metricas.totalCobrado)}
          </span>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#1FAE6D] h-full rounded-full"
              style={{
                width: `${metricas.totalEmitido ? (metricas.totalCobrado / metricas.totalEmitido) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Total Deuda
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md">
              <TrendingDown size={14} strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            {formatearARS(metricas.totalDeuda)}
          </span>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{
                width: `${metricas.totalEmitido ? (metricas.totalDeuda / metricas.totalEmitido) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Estado Alumnos
            </span>
            <div className="p-1.5 bg-gray-100 text-gray-600 rounded-md">
              <Users size={14} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              {metricas.pagadas}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              / {metricas.totalContactos} al día
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico de Anillo */}
        <div className="bg-white border border-gray-200 rounded-md p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <Activity size={14} className="text-gray-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-700">
              Estado del Mes
            </h3>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricas.dataPie}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {metricas.dataPie.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {metricas.dataPie.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Barras y Tabla */}
        <div className="bg-white border border-gray-200 rounded-md p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <TrendingUp size={14} className="text-gray-400" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-700">
              Evolución (Últimos 6 Meses)
            </h3>
          </div>

          <div className="flex-1 min-h-[160px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={evolucionData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <RechartsTooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => formatearARS(value)}
                />
                <Bar
                  dataKey="Cobrado"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="Deuda"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de % Pendiente */}
          <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Mes
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Monto Total
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Pagado
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Pendiente
                  </th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    % Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[...evolucionData].reverse().map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 text-[11px] font-bold text-gray-900 uppercase tracking-widest">
                      {row.name} {row.anio}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-gray-600 text-right">
                      {formatearARS(row.Emitido)}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[#1FAE6D] text-right">
                      {formatearARS(row.Cobrado)}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-rose-600 text-right">
                      {formatearARS(row.Deuda)}
                    </td>
                    <td className="px-4 py-3 text-xs font-black text-gray-900 text-right">
                      {row.PorcentajePendiente.toFixed(2).replace(".", ",")}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCuotas;
