import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Plus,
  X,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useMovimientosTesoreriaQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosTesoreria.query";
import { formatPrice } from "../../../../utils/formatters";
import { BilleteraIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";
import ModalMovimientoManual from "../../../Modales/Tesoreria/ModalMovimientoManual";

const TIPOS_MOVIMIENTO = [
  { value: "", label: "Todos los tipos" },
  { value: "1", label: "Ingreso Efectivo" },
  { value: "2", label: "Egreso Efectivo" },
  { value: "3", label: "Anulación Efectivo" },
  { value: "4", label: "Transferencia Entrante" },
  { value: "5", label: "Transferencia Saliente" },
  { value: "6", label: "Transferencia Anulada" },
  { value: "7", label: "Cobro Tarjeta Débito" },
  { value: "8", label: "Cobro Tarjeta Crédito" },
  { value: "9", label: "Tarjeta Anulada" },
  { value: "10", label: "Cheque Propio Corriente" },
  { value: "12", label: "Cheque Tercero Entrante" },
  { value: "14", label: "Cheque Tercero Endosado" },
  { value: "16", label: "Cheque Propio Diferido" },
  { value: "17", label: "Cheque Propio Anulado" },
  { value: "18", label: "Cheque Tercero Anulado" },
];

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const TIPO_OPERACION_STYLE = {
  INGRESO: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  EGRESO: "bg-rose-50 text-rose-700 border border-rose-200",
};

const MovimientosTesoreria = () => {
  const { usuario } = useAuthStore();
  const [pagina, setPagina] = useState(1);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    tipoOperacion: "",
    codigoTipoMovimiento: "",
  });

  const filtrosQuery = {
    codigoEmpresa: usuario?.codigoEmpresa,
    pagina,
    limite: 20,
    ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
    ...(filtros.tipoOperacion && { tipoOperacion: filtros.tipoOperacion }),
    ...(filtros.codigoTipoMovimiento && {
      codigoTipoMovimiento: filtros.codigoTipoMovimiento,
    }),
  };

  const { data, isLoading } = useMovimientosTesoreriaQuery(filtrosQuery);

  const movimientos = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = data?.totalPaginas ?? 1;
  const resumen = data?.resumen ?? {
    totalIngresos: 0,
    totalEgresos: 0,
    saldoNeto: 0,
  };

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      tipoOperacion: "",
      codigoTipoMovimiento: "",
    });
    setPagina(1);
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion
        ruta="Tesorería / Movimientos"
        icono={<BilleteraIcono size={20} />}
      >
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Movimiento
        </button>
      </EncabezadoSeccion>

      {modalAbierto && (
        <ModalMovimientoManual onClose={() => setModalAbierto(false)} />
      )}

      {/* Tarjetas de Resumen Horizontales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResumenCard
          titulo="Total Ingresos"
          monto={resumen.totalIngresos}
          icono={<TrendingUp size={18} />}
          colorClass="text-emerald-600"
        />
        <ResumenCard
          titulo="Total Egresos"
          monto={resumen.totalEgresos}
          icono={<TrendingDown size={18} />}
          colorClass="text-rose-600"
        />
        <ResumenCard
          titulo="Saldo Neto"
          monto={resumen.saldoNeto}
          icono={<Wallet size={18} />}
          colorClass={
            resumen.saldoNeto >= 0 ? "text-emerald-600" : "text-rose-600"
          }
        />
      </div>

      {/* Panel Principal: Filtros y Tabla */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm flex-1 flex flex-col">
        {/* Barra de Filtros Integrada */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-black/[0.01]">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-black/40 uppercase tracking-widest mb-1">
              <Filter size={14} />
              Filtros
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">
                Rango de fechas
              </span>
              <DateRangePicker
                fechaDesde={filtros.fechaDesde}
                fechaHasta={filtros.fechaHasta}
                onChange={(desde, hasta) => {
                  setFiltros((prev) => ({
                    ...prev,
                    fechaDesde: desde,
                    fechaHasta: hasta,
                  }));
                  setPagina(1);
                }}
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">
                Tipo operación
              </span>
              <select
                value={filtros.tipoOperacion}
                onChange={(e) => cambiarFiltro("tipoOperacion", e.target.value)}
                className="h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
              >
                <option value="">Todos</option>
                <option value="INGRESO">Ingresos</option>
                <option value="EGRESO">Egresos</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">
                Tipo movimiento
              </span>
              <select
                value={filtros.codigoTipoMovimiento}
                onChange={(e) =>
                  cambiarFiltro("codigoTipoMovimiento", e.target.value)
                }
                className="h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
              >
                {TIPOS_MOVIMIENTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-md border border-transparent transition-colors cursor-pointer"
              >
                <X size={13} />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-[var(--border-subtle)]">
                {[
                  "Fecha",
                  "Tipo",
                  "Descripción movimiento",
                  "Entidad",
                  "Comprobante",
                  "Importe",
                  "Conciliado",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-[9px] font-black text-black/40 uppercase tracking-[0.18em] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    Cargando movimientos…
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    No se encontraron movimientos
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => (
                  <tr
                    key={mov.codigo}
                    className="border-b border-[var(--border-subtle)]/60 hover:bg-[var(--primary)]/[0.02] transition-colors group cursor-default"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                      {fmtFecha(mov.fecha)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          TIPO_OPERACION_STYLE[mov.tipoOperacion] ??
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {mov.tipoOperacion === "INGRESO" ? (
                          <ArrowUpCircle size={12} />
                        ) : (
                          <ArrowDownCircle size={12} />
                        )}
                        {mov.tipoOperacion}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-800">
                      {mov.tipoMovimiento?.nombre ??
                        `Tipo ${mov.codigoTipoMovimiento}`}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-600 max-w-[180px] truncate">
                      {mov._comprobante?.razonSocial ?? mov.descripcion ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {mov._comprobante ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                            {mov._comprobante.tipoDescripcionComprobante?.substring(
                              0,
                              3,
                            )}
                          </span>
                          <span className="font-mono tabular-nums">
                            {mov._comprobante.puntoVenta &&
                            mov._comprobante.numeroComprobante
                              ? `${String(mov._comprobante.puntoVenta).padStart(4, "0")}-${String(mov._comprobante.numeroComprobante).padStart(8, "0")}`
                              : `#${mov.codigoComprobante}`}
                          </span>
                        </span>
                      ) : mov.codigoComprobante ? (
                        <span className="font-mono tabular-nums">
                          #{mov.codigoComprobante}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-black whitespace-nowrap tabular-nums">
                      <span
                        className={
                          mov.tipoOperacion === "INGRESO"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {mov.tipoOperacion === "EGRESO" ? "−" : "+"}
                        {formatPrice(mov.importe)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {mov.conciliado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Conciliado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] bg-gray-50/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={13} />
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Siguiente
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResumenCard = ({ titulo, monto, icono, colorClass }) => (
  <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex items-center gap-4 shadow-sm hover:border-gray-300 transition-colors">
    <div className={`p-3 rounded-md bg-black/[0.03] ${colorClass} shrink-0`}>
      {icono}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {titulo}
      </p>
      <p
        className={`text-2xl font-black leading-none tracking-tight ${colorClass}`}
      >
        {formatPrice(monto)}
      </p>
    </div>
  </div>
);

export default MovimientosTesoreria;
