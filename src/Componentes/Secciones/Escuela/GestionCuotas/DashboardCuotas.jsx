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

const DashboardCuotas = ({ filas, mes, anio, asientosRaw }) => {
  const metricas = useMemo(() => {
    let pagadas = 0;
    let impagas = 0;
    let parciales = 0;
    let sinEmitir = 0;

    let totalEmitido = 0;
    let totalCobrado = 0;
    let totalDeuda = 0;

    filas.forEach((f) => {
      // Conteo por estado
      if (f.estado === "ABONADO") pagadas++;
      else if (f.estado === "VENCIDA" || f.estado === "EMITIDA") impagas++;
      else if (f.estado === "PARCIALMENTE_ABONADO") parciales++;
      else sinEmitir++;

      // Valores monetarios
      if (f.estado !== "SIN_EMITIR") {
        totalEmitido += f.monto;
        totalDeuda += f.totalDeuda;
      }
    });

    totalCobrado = totalEmitido - totalDeuda;

    const dataPie = [
      { name: "Abonadas", value: pagadas },
      { name: "Impagas", value: impagas },
      { name: "Parciales", value: parciales },
      { name: "Sin Emitir", value: sinEmitir },
    ].filter((d) => d.value > 0);

    return {
      pagadas,
      impagas,
      parciales,
      sinEmitir,
      totalEmitido,
      totalCobrado,
      totalDeuda,
      dataPie,
    };
  }, [filas]);

  // Evolución últimos 6 meses (BarChart)
  const evolucionData = useMemo(() => {
    if (!asientosRaw) return [];

    const mesesStr = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const resultado = [];

    // Generar últimos 6 meses a partir del mes/año seleccionado
    for (let i = 5; i >= 0; i--) {
      let m = mes - i;
      let y = anio;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }

      // Filtrar asientos que correspondan a esa cuota: CUOTA-XXX-YYYY-MM
      const prefijo = `-${y}-${String(m).padStart(2, "0")}`;

      let cobradoMes = 0;
      let emitidoMes = 0;

      asientosRaw.forEach((a) => {
        if (
          typeof a.referencia === "string" &&
          a.referencia.endsWith(prefijo) &&
          a.referencia.startsWith("CUOTA-")
        ) {
          // Asumiendo que el total emitido por cuota se puede estimar o buscar en las cuentas de padres
          a.detalles?.forEach((d) => {
            if (
              d.codigoCuentaContable === 507 ||
              d.nombreCuentaContable?.toUpperCase().includes("PADRE")
            ) {
              cobradoMes += d.haber || 0;
              emitidoMes += d.debe || 0;
            }
          });
        }
      });

      resultado.push({
        name: `${mesesStr[m - 1]}`,
        anio: y,
        Cobrado: cobradoMes,
        Deuda: Math.max(0, emitidoMes - cobradoMes),
        Emitido: emitidoMes,
        PorcentajePendiente:
          emitidoMes > 0
            ? (Math.max(0, emitidoMes - cobradoMes) / emitidoMes) * 100
            : 0,
      });
    }

    // Invertir para que el mes más reciente quede al final en el gráfico, pero en la tabla podemos mostrarlo de arriba hacia abajo
    return resultado.reverse();
  }, [asientosRaw, mes, anio]);

  return (
    <div className="flex flex-col gap-5 mb-6">
      {/* Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Total Emitido
            </span>
            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md">
              <DollarSign size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-gray-800">
            {formatearARS(metricas.totalEmitido)}
          </span>
        </div>

        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Total Cobrado
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600">
            {formatearARS(metricas.totalCobrado)}
          </span>
          <div className="w-full bg-emerald-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{
                width: `${metricas.totalEmitido ? (metricas.totalCobrado / metricas.totalEmitido) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">
              Total Deuda
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-md">
              <TrendingDown size={16} />
            </div>
          </div>
          <span className="text-2xl font-black text-rose-600">
            {formatearARS(metricas.totalDeuda)}
          </span>
          <div className="w-full bg-rose-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{
                width: `${metricas.totalEmitido ? (metricas.totalDeuda / metricas.totalEmitido) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Estado Alumnos
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-gray-800">
              {metricas.pagadas}
            </span>
            <span className="text-xs font-bold text-gray-400 mb-1">
              / {filas.length} al día
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico de Anillo */}
        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[var(--primary)]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">
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
        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--primary)]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">
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
          <div className="border border-[var(--border-subtle)] rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-800 border-b border-emerald-900">
                  <th className="px-4 py-2.5 text-[9px] font-black text-emerald-50 uppercase tracking-widest">
                    Mes
                  </th>
                  <th className="px-4 py-2.5 text-[9px] font-black text-emerald-50 uppercase tracking-widest text-right">
                    Monto Total
                  </th>
                  <th className="px-4 py-2.5 text-[9px] font-black text-emerald-50 uppercase tracking-widest text-right">
                    Pagado
                  </th>
                  <th className="px-4 py-2.5 text-[9px] font-black text-emerald-50 uppercase tracking-widest text-right">
                    Pendiente
                  </th>
                  <th className="px-4 py-2.5 text-[9px] font-black text-emerald-50 uppercase tracking-widest text-right">
                    % Pendiente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {[...evolucionData].reverse().map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-2 text-xs font-bold text-gray-700 uppercase">
                      {row.name} {row.anio}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-gray-600 text-right">
                      {formatearARS(row.Emitido)}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-gray-600 text-right">
                      {formatearARS(row.Cobrado)}
                    </td>
                    <td className="px-4 py-2 text-xs font-semibold text-rose-600 text-right">
                      {formatearARS(row.Deuda)}
                    </td>
                    <td className="px-4 py-2 text-xs font-black text-gray-800 text-right">
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
