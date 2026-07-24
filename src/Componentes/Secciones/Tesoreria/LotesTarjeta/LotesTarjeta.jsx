import { useState } from "react";
import {
  CreditCard,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Banknote,
  Calendar,
  Layers,
  Search
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useLotesTarjetaQuery } from "../../../../Backend/Tesoreria/queries/useLotesTarjeta.query";
import { formatPrice } from "../../../../utils/formatters";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const TIPO_STYLE = {
  CREDITO: "bg-violet-50 text-violet-700 border-violet-200/60 dot-violet-500",
  DEBITO: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dot-cyan-500",
};

const TIPO_BADGE_LABEL = { CREDITO: "Crédito", DEBITO: "Débito" };

const LotesTarjeta = () => {
  const { usuario } = useAuthStore();
  const [expandido, setExpandido] = useState(null);
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    tipo: "",
  });

  const filtrosQuery = {
    codigoEmpresa: usuario?.codigoEmpresa,
    ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
    ...(filtros.tipo && { tipo: filtros.tipo }),
  };

  const { data: lotes = [], isLoading } = useLotesTarjetaQuery(filtrosQuery);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setExpandido(null);
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaDesde: "", fechaHasta: "", tipo: "" });
    setExpandido(null);
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  const totalGeneral = lotes.reduce((s, l) => s + l.totalMonto, 0);
  const totalTransacciones = lotes.reduce(
    (s, l) => s + l.cantidadTransacciones,
    0,
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Tesorería</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Valores</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-[#1FAE6D]" size={28} strokeWidth={2.5} />
            Lotes de Tarjeta
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Liquidaciones y lotes agrupados por emisora de tarjetas de crédito y débito.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-md p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard size={100} />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">
            Total Cobrado (Filtrado)
          </p>
          <p className="text-4xl font-black text-white relative z-10 tracking-tight">
            {formatPrice(totalGeneral)}
          </p>
        </div>
        
        <div className="bg-white rounded-md p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Transacciones
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-gray-900 tracking-tight">{totalTransacciones}</p>
            <p className="text-sm font-bold text-gray-400">operaciones</p>
          </div>
        </div>

        <div className="bg-white rounded-md p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Lotes Encontrados
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-gray-900 tracking-tight">{lotes.length}</p>
            <p className="text-sm font-bold text-gray-400">lotes listados</p>
          </div>
        </div>
      </div>

      {/* FILTROS Y LISTADO */}
      <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Liquidaciones</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-gray-300 pr-4">
              <Filter size={14} /> Filtros
            </div>

            <div className="flex items-center gap-3">
              <DateRangePicker
                fechaDesde={filtros.fechaDesde}
                fechaHasta={filtros.fechaHasta}
                onChange={(desde, hasta) => {
                  cambiarFiltro("fechaDesde", desde);
                  cambiarFiltro("fechaHasta", hasta);
                }}
              />

              <select
                value={filtros.tipo}
                onChange={(e) => cambiarFiltro("tipo", e.target.value)}
                className="h-9 w-40 px-3 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-gray-900 cursor-pointer shadow-sm"
              >
                <option value="">Ambas (Tarjetas)</option>
                <option value="CREDITO">Crédito</option>
                <option value="DEBITO">Débito</option>
              </select>

              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title="Limpiar filtros"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CONTENIDO (ACORDEON DE LOTES) */}
        <div className="flex flex-col bg-gray-50">
          {isLoading ? (
            <div className="py-24 text-center bg-white">
              <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <p className="font-bold text-sm tracking-wide text-gray-500">CARGANDO LOTES...</p>
              </div>
            </div>
          ) : lotes.length === 0 ? (
            <div className="py-24 text-center bg-white">
              <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                <CreditCard size={40} strokeWidth={1} className="text-gray-300 mb-2" />
                <p className="font-bold text-gray-600">No se encontraron lotes</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Ajustá los filtros de búsqueda o fecha para encontrar liquidaciones de tarjeta.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {lotes.map((lote, idx) => {
                const key = `${lote.lote ?? "sin_lote"}_${lote.tipo ?? idx}`;
                const abierto = expandido === key;
                const styleKey = lote.tipo || "CREDITO";
                const badgeStyle = TIPO_STYLE[styleKey] || "bg-gray-100 text-gray-600 border-gray-200 dot-gray-500";
                
                return (
                  <div
                    key={key}
                    className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    {/* Cabecera del lote */}
                    <button
                      onClick={() => setExpandido(abierto ? null : key)}
                      className={`w-full flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 cursor-pointer transition-colors ${abierto ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                          <CreditCard size={18} className="text-gray-500" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[15px] font-bold text-gray-900 tracking-tight">
                              {lote.marca ?? "Sin marca"}
                            </span>
                            {lote.tipo && (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${badgeStyle.split(" dot-")[0]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-${badgeStyle.split(" dot-")[1] || "gray-500"}`} />
                                {TIPO_BADGE_LABEL[lote.tipo] ?? lote.tipo}
                              </span>
                            )}
                            {lote.lote && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest">
                                Lote {lote.lote}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            {lote.autorizacion && (
                              <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                Aut. {lote.autorizacion}
                              </span>
                            )}
                            {lote.fechaAcreditacion && (
                              <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                Acreditación: {fmtFecha(lote.fechaAcreditacion)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pl-14 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                            {lote.cantidadTransacciones} transacciones
                          </p>
                          <p className="text-xl font-black text-gray-900 tracking-tight">
                            {formatPrice(lote.totalMonto)}
                          </p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                          {abierto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </div>
                      </div>
                    </button>

                    {/* Detalle de transacciones */}
                    {abierto && (
                      <div className="border-t border-gray-200 bg-gray-50/50 p-6">
                        <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  {[
                                    "Entidad",
                                    "Comprobante",
                                    "Cuotas",
                                    "Recargo",
                                    "Fecha",
                                    "Monto",
                                  ].map((col, i) => (
                                    <th
                                      key={col}
                                      className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap ${i === 5 ? "text-right" : ""}`}
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {(lote.transacciones ?? []).map((tx, i) => (
                                  <tr
                                    key={i}
                                    className="hover:bg-gray-50/80 transition-colors"
                                  >
                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-800 max-w-[200px] truncate">
                                      {tx.razonSocial ?? "—"}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-semibold text-gray-600 font-mono">
                                      {tx.tipoDescripcionComprobante
                                        ? `${tx.tipoDescripcionComprobante.substring(0, 3)} #${tx.codigoComprobante}`
                                        : `#${tx.codigoComprobante}`}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-600">
                                      {tx.cantidadCuotas ?? 1}
                                    </td>
                                    <td className="px-6 py-4">
                                      {tx.recargo > 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/60">
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                          {tx.recargo}%
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 font-bold">—</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-700 whitespace-nowrap">
                                      {fmtFecha(tx.fechaPago)}
                                    </td>
                                    <td className="px-6 py-4 text-[15px] font-black text-gray-900 text-right tracking-tight">
                                      {formatPrice(tx.monto)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-gray-50">
                                  <td
                                    colSpan={5}
                                    className="px-6 py-4 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right"
                                  >
                                    Total del lote
                                  </td>
                                  <td className="px-6 py-4 text-[18px] font-black text-gray-900 text-right tracking-tight">
                                    {formatPrice(lote.totalMonto)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotesTarjeta;
