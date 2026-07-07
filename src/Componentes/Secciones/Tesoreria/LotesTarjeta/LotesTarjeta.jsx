import { useState } from "react";
import {
  CreditCard,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Banknote,
  Calendar,
  Layers
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useLotesTarjetaQuery } from "../../../../Backend/Tesoreria/queries/useLotesTarjeta.query";
import { formatPrice } from "../../../../utils/formatters";
import { TarjetaIcono } from "../../../../assets/Icons";
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
  CREDITO: "bg-violet-50 text-violet-700 border border-violet-200",
  DEBITO: "bg-cyan-50 text-cyan-700 border border-cyan-200",
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
    <div className="w-full py-8 px-8 space-y-8 bg-gray-50/30 min-h-full">
      <EncabezadoSeccion
        ruta="Tesorería / Lotes de Tarjeta"
        icono={<TarjetaIcono size={22} className="text-[var(--color-brand-primary)]" />}
      />

      {/* Resumen rápido Rediseñado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-5 p-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-100/50 rounded-full blur-2xl"></div>
          <div className="p-3.5 bg-violet-100 rounded-[14px] shadow-sm z-10">
            <CreditCard size={22} className="text-violet-600" />
          </div>
          <div className="z-10">
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total cobrado
            </p>
            <p className="text-2xl font-black text-violet-700 tracking-tight">
              {formatPrice(totalGeneral)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
          <div className="p-3.5 bg-blue-100 rounded-[14px] shadow-sm z-10">
            <Banknote size={22} className="text-blue-600" />
          </div>
          <div className="z-10">
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Transacciones
            </p>
            <p className="text-2xl font-black text-blue-700 tracking-tight">
              {totalTransacciones}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 p-6 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl"></div>
          <div className="p-3.5 bg-emerald-100 rounded-[14px] shadow-sm z-10">
            <Layers size={22} className="text-emerald-600" />
          </div>
          <div className="z-10">
            <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Lotes encontrados
            </p>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">
              {lotes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros Estilizados */}
      <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-[16px] p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="flex items-center gap-2 pb-2 sm:pb-0 sm:pr-4 sm:border-r border-gray-100 h-full">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Filter size={18} className="text-gray-500" />
            </div>
            <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
              Filtros
            </span>
          </div>

          <div className="flex-1 max-w-sm">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Rango de fechas
            </label>
            <div className="h-[42px]">
              <DateRangePicker
                fechaDesde={filtros.fechaDesde}
                fechaHasta={filtros.fechaHasta}
                onChange={(desde, hasta) => {
                  setFiltros((prev) => ({
                    ...prev,
                    fechaDesde: desde,
                    fechaHasta: hasta,
                  }));
                  setExpandido(null);
                }}
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Tipo tarjeta
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => cambiarFiltro("tipo", e.target.value)}
              className="block w-full h-[42px] rounded-xl border border-gray-200 bg-white px-3.5 text-[13px] font-semibold text-gray-700 focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] focus:outline-none cursor-pointer transition-all"
            >
              <option value="">Ambas</option>
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
            </select>
          </div>

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="h-[42px] flex items-center justify-center gap-2 text-[13px] font-bold text-gray-600 border border-gray-200 rounded-xl px-5 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
            >
              <X size={15} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de lotes */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-2xl p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
            <p className="text-sm font-medium text-gray-500">Cargando lotes de tarjeta...</p>
          </div>
        ) : lotes.length === 0 ? (
          <div className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <CreditCard size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No se encontraron lotes</h3>
            <p className="text-sm text-gray-500">Intenta ajustando los filtros de búsqueda.</p>
          </div>
        ) : (
          lotes.map((lote, idx) => {
            const key = `${lote.lote ?? "sin_lote"}_${lote.tipo ?? idx}`;
            const abierto = expandido === key;
            return (
              <div
                key={key}
                className="bg-white border border-[var(--color-neutral-border)] shadow-sm rounded-[16px] overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                {/* Cabecera del lote */}
                <button
                  onClick={() => setExpandido(abierto ? null : key)}
                  className={`w-full flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 cursor-pointer transition-colors ${abierto ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-100 rounded-xl border border-gray-200/60 shadow-sm mt-0.5 sm:mt-0">
                      <CreditCard size={20} className="text-gray-500" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[16px] font-bold text-gray-900 tracking-tight">
                          {lote.marca ?? "Sin marca"}
                        </span>
                        {lote.tipo && (
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-sm ${TIPO_STYLE[lote.tipo] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                          >
                            {TIPO_BADGE_LABEL[lote.tipo] ?? lote.tipo}
                          </span>
                        )}
                        {lote.lote && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider">
                            Lote {lote.lote}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {lote.autorizacion && (
                          <span className="text-[12.5px] font-medium text-gray-500 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            Aut. {lote.autorizacion}
                          </span>
                        )}
                        {lote.fechaAcreditacion && (
                          <span className="text-[12.5px] font-medium text-gray-500 flex items-center gap-1.5">
                            <Calendar size={13} className="text-gray-400" />
                            Acreditación: {fmtFecha(lote.fechaAcreditacion)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        {lote.cantidadTransacciones} transacción{lote.cantidadTransacciones !== 1 ? "es" : ""}
                      </p>
                      <p className="text-[18px] font-black text-gray-900 tracking-tight">
                        {formatPrice(lote.totalMonto)}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                      {abierto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>
                </button>

                {/* Detalle de transacciones */}
                {abierto && (
                  <div className="border-t border-[var(--color-neutral-border)] bg-white p-6">
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {[
                              "Entidad",
                              "Comprobante",
                              "Cuotas",
                              "Recargo",
                              "Monto",
                              "Fecha",
                            ].map((col) => (
                              <th
                                key={col}
                                className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
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
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="px-5 py-4 text-[13.5px] font-semibold text-gray-800 max-w-[200px] truncate">
                                {tx.razonSocial ?? "—"}
                              </td>
                              <td className="px-5 py-4 text-[13px] font-medium text-gray-600">
                                {tx.tipoDescripcionComprobante
                                  ? `${tx.tipoDescripcionComprobante.substring(0, 3)} #${tx.codigoComprobante}`
                                  : `#${tx.codigoComprobante}`}
                              </td>
                              <td className="px-5 py-4 text-[13px] font-medium text-gray-600">
                                {tx.cantidadCuotas ?? 1}
                              </td>
                              <td className="px-5 py-4 text-[13px] font-medium text-gray-600">
                                {tx.recargo > 0 ? (
                                  <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100 font-bold text-[11px]">
                                    {tx.recargo}%
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-5 py-4 text-[14px] font-bold text-violet-700">
                                {formatPrice(tx.monto)}
                              </td>
                              <td className="px-5 py-4 text-[13px] font-medium text-gray-500 whitespace-nowrap flex items-center gap-2">
                                <Calendar size={13} className="text-gray-400" />
                                {fmtFecha(tx.fechaPago)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200 bg-gray-50/80">
                            <td
                              colSpan={4}
                              className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right"
                            >
                              Total del lote
                            </td>
                            <td className="px-5 py-4 text-[16px] font-black text-violet-700">
                              {formatPrice(lote.totalMonto)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LotesTarjeta;
