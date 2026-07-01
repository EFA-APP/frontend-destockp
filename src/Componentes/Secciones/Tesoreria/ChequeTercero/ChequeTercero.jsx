import { useState } from "react";
import {
  ArrowDownCircle,
  ArrowRightLeft,
  XCircle,
  Filter,
  X,
  Landmark,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useChequeTerceroQuery } from "../../../../Backend/Tesoreria/queries/useChequeTercero.query";
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

const TIPOS_CHEQUE = [
  { value: "", label: "Todos" },
  { value: "12", label: "Entrante" },
  { value: "14", label: "Endosado" },
  { value: "18", label: "Anulado" },
];

const TIPO_STYLE = {
  12: "bg-emerald-50 text-emerald-700 border-emerald-200",
  14: "bg-blue-50 text-blue-700 border-blue-200",
  18: "bg-rose-50 text-rose-700 border-rose-200",
};

const TIPO_ICONO = {
  12: ArrowDownCircle,
  14: ArrowRightLeft,
  18: XCircle,
};

const ResumenCard = ({ titulo, valor, icono, colorClass, esMoneda = true }) => (
  <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex items-center gap-4 shadow-sm hover:border-gray-300 transition-colors">
    <div className={`p-3 rounded-md bg-black/[0.03] ${colorClass} shrink-0`}>
      {icono}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {titulo}
      </p>
      <p className={`text-2xl font-black leading-none tracking-tight ${colorClass}`}>
        {esMoneda ? formatPrice(valor) : valor}
      </p>
    </div>
  </div>
);

const ChequeTercero = () => {
  const { usuario } = useAuthStore();
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    codigoTipoMovimiento: "",
  });

  const filtrosQuery = {
    codigoEmpresa: usuario?.codigoEmpresa,
    ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
    ...(filtros.codigoTipoMovimiento && {
      codigoTipoMovimiento: filtros.codigoTipoMovimiento,
    }),
  };

  const { data, isLoading } = useChequeTerceroQuery(filtrosQuery);

  const movimientos = data?.data ?? [];

  const totalEntrantes = movimientos
    .filter((m) => m.codigoTipoMovimiento === 12)
    .reduce((s, m) => s + (m.importe ?? 0), 0);

  const totalEndosados = movimientos
    .filter((m) => m.codigoTipoMovimiento === 14)
    .reduce((s, m) => s + (m.importe ?? 0), 0);

  const cantidadTotal = movimientos.length;

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaDesde: "", fechaHasta: "", codigoTipoMovimiento: "" });
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion
        ruta="Tesorería / Cheques de Tercero"
        icono={<Landmark size={20} />}
      />

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ResumenCard
          titulo="Total entrantes"
          valor={totalEntrantes}
          icono={<ArrowDownCircle size={18} />}
          colorClass="text-emerald-600"
        />
        <ResumenCard
          titulo="Total endosados"
          valor={totalEndosados}
          icono={<ArrowRightLeft size={18} />}
          colorClass="text-blue-600"
        />
        <ResumenCard
          titulo="Registros"
          valor={cantidadTotal}
          icono={<Landmark size={18} />}
          colorClass="text-gray-500"
          esMoneda={false}
        />
      </div>

      {/* Panel principal */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm flex flex-col">
        {/* Filtros */}
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
                }}
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">
                Tipo
              </span>
              <select
                value={filtros.codigoTipoMovimiento}
                onChange={(e) =>
                  cambiarFiltro("codigoTipoMovimiento", e.target.value)
                }
                className="h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
              >
                {TIPOS_CHEQUE.map((t) => (
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
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    Cargando cheques…
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    No se encontraron cheques de tercero
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => {
                  const tipo = mov.codigoTipoMovimiento;
                  const Icono = TIPO_ICONO[tipo] ?? ArrowDownCircle;
                  const tipoLabel =
                    tipo === 12
                      ? "Entrante"
                      : tipo === 14
                        ? "Endosado"
                        : tipo === 18
                          ? "Anulado"
                          : `Tipo ${tipo}`;
                  const tipoStyle =
                    TIPO_STYLE[tipo] ??
                    "bg-gray-100 text-gray-600 border-gray-200";

                  return (
                    <tr
                      key={mov.codigo}
                      className="border-b border-[var(--border-subtle)]/60 hover:bg-[var(--primary)]/[0.02] transition-colors cursor-default"
                    >
                      <td className="px-5 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                        {fmtFecha(mov.fecha)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${tipoStyle}`}
                        >
                          <Icono size={11} />
                          {tipoLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600 max-w-[200px] truncate">
                        {mov._comprobante?.razonSocial ?? "—"}
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
                            tipo === 18 ? "text-rose-700" : "text-emerald-700"
                          }
                        >
                          {tipo === 18 ? "−" : "+"}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChequeTercero;
