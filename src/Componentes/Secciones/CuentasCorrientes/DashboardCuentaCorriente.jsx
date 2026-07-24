import React, { useState } from 'react';
import { useMetricasCuentaCorriente } from '../../../Backend/CuentasCorrientes/queries/useMetricasCuentaCorriente';
import { useDashboardMetricasStore } from '../../../Backend/CuentasCorrientes/dashboardMetricas.store';
import { Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from 'recharts';
import { FileDown, RefreshCcw, Loader2, Settings2, BarChart2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MetricasCuentaCorrientePDF from './MetricasCuentaCorrientePDF';

const formatearMoneda = (monto) => {
  if (monto == null) return "$ 0.00";
  return Number(monto).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
};

const THEME = {
  emitido: '#64748b',   // slate-500
  cobrado: '#059669',   // emerald-600 (for Ingreso)
  pagado: '#c77719',    // accent-like (for Egreso)
};

export default function DashboardCuentaCorriente({ tipo }) {
  const { data, isLoading, isError, refetch } = useMetricasCuentaCorriente();
  const metricasActivas = useDashboardMetricasStore((state) => state.metricasActivas);
  const toggleMetrica = useDashboardMetricasStore((state) => state.toggleMetrica);
  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md border border-gray-200 mb-6 shadow-sm">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Cargando métricas del panel...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-md mb-6 flex flex-col items-start shadow-sm">
        <h3 className="text-sm font-bold text-rose-800 mb-2">Error al cargar las métricas</h3>
        <p className="text-sm text-rose-600 mb-4">Ocurrió un problema de red o de servidor. Por favor, intente nuevamente.</p>
        <button onClick={() => refetch()} className="flex items-center text-xs font-bold bg-white text-rose-700 px-3 py-2 rounded border border-rose-200 hover:bg-rose-100 transition-colors">
          <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
          Reintentar
        </button>
      </div>
    );
  }

  const metricas = data || {};
  const { totales = {}, evolucion = {} } = metricas;

  const evolucionTipo = evolucion[tipo] || [];

  const labelAbonado = tipo === 'INGRESO' ? 'Cobrado' : 'Pagado';
  const colorAbonado = tipo === 'INGRESO' ? THEME.cobrado : THEME.pagado;

  const dataEvolucion = evolucionTipo.map(e => ({
    periodo: e.periodo,
    Emitido: Number(e.montoEmitido || 0),
    [labelAbonado]: Number(e.montoCobrado || 0),
  }));

  const hasAnyActive = Object.values(metricasActivas).some(v => v);

  return (
    <div className="mb-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-md border border-gray-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-md">
            <BarChart2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Dashboard de Métricas</h2>
            <p className="text-xs text-gray-500 font-medium">Análisis en tiempo real de {tipo.toLowerCase()}s</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-3 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Preferencias
          </button>
          
          <PDFDownloadLink
            document={<MetricasCuentaCorrientePDF datos={metricas} tipo={tipo} />}
            fileName={`Metricas_Cuenta_Corriente_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`}
            className={`flex items-center px-3 py-2 text-sm font-bold text-white rounded-md transition-colors ${
              !hasAnyActive ? "bg-gray-300 cursor-not-allowed" : "bg-[#1FAE6D] hover:bg-emerald-700"
            }`}
          >
            {({ loading }) => (
              <>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                {loading ? "Generando..." : "Exportar PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {showSettings && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={metricasActivas.totales} onChange={() => toggleMetrica('totales')} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Totales Consolidados</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={metricasActivas.evolucion} onChange={() => toggleMetrica('evolucion')} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">Evolución Mensual</span>
          </label>
        </div>
      )}

      {!hasAnyActive && (
        <div className="p-8 text-center bg-gray-50 rounded-md border border-gray-200 border-dashed">
          <p className="text-sm text-gray-500 font-medium">Seleccione al menos una métrica para visualizar el dashboard.</p>
        </div>
      )}

      {hasAnyActive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metricasActivas.totales && (
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Total a Cobrar</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{formatearMoneda(totales.totalACobrar)}</p>
              </div>
              <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <p className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Total a Pagar</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{formatearMoneda(totales.totalAPagar)}</p>
              </div>
            </div>
          )}

          {metricasActivas.evolucion && (
            <div className="col-span-1 md:col-span-2 bg-white p-5 rounded-md border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Evolución Mensual ({tipo})</h3>
              {dataEvolucion.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm font-medium text-gray-400">Sin datos de evolución</div>
              ) : (
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataEvolucion} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="periodo" tick={{fontSize: 11, fill: '#475569'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tickFormatter={(v) => `$${v/1000}k`} tick={{fontSize: 11, fill: '#475569'}} axisLine={false} tickLine={false} dx={-10} />
                      <RechartsTooltip 
                        cursor={{fill: '#f8fafc'}}
                        formatter={(value) => formatearMoneda(value)}
                        contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '15px' }} />
                      <Bar dataKey="Emitido" fill={THEME.emitido} radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey={labelAbonado} fill={colorAbonado} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
