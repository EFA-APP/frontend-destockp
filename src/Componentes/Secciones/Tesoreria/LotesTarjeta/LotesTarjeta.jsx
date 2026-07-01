import { useState } from "react";
import {
  CreditCard,
  ChevronDown,
  ChevronRight,
  Filter,
  X,
  Banknote,
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
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion
        ruta="Tesorería / Lotes de Tarjeta"
        icono={<TarjetaIcono size={20} />}
      />

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 p-4 rounded-md border bg-violet-50 border-violet-200">
          <CreditCard size={18} className="text-violet-600" />
          <div>
            <p className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Total cobrado
            </p>
            <p className="text-xl font-black text-violet-700">
              {formatPrice(totalGeneral)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-md border bg-blue-50 border-blue-200">
          <Banknote size={18} className="text-blue-600" />
          <div>
            <p className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Transacciones
            </p>
            <p className="text-xl font-black text-blue-700">
              {totalTransacciones}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-md border bg-emerald-50 border-emerald-200">
          <CreditCard size={18} className="text-emerald-600" />
          <div>
            <p className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">
              Lotes encontrados
            </p>
            <p className="text-xl font-black text-emerald-700">
              {lotes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black/40 uppercase tracking-wider mb-1">
            <Filter size={13} />
            Filtros
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-black/40 uppercase tracking-wider">
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
                setExpandido(null);
              }}
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-black/40 uppercase tracking-wider">
              Tipo tarjeta
            </span>
            <select
              value={filtros.tipo}
              onChange={(e) => cambiarFiltro("tipo", e.target.value)}
              className="text-sm border border-[var(--border-subtle)] rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/40"
            >
              <option value="">Ambas</option>
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
            </select>
          </label>

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1.5 text-xs font-semibold text-black/50 hover:text-black/70 border border-[var(--border-subtle)] rounded-md px-3 py-1.5 bg-white hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X size={13} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de lotes */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-12 text-center text-sm text-black/40">
            Cargando lotes…
          </div>
        ) : lotes.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md p-12 text-center text-sm text-black/40">
            No se encontraron lotes de tarjeta
          </div>
        ) : (
          lotes.map((lote, idx) => {
            const key = `${lote.lote ?? "sin_lote"}_${lote.tipo ?? idx}`;
            const abierto = expandido === key;
            return (
              <div
                key={key}
                className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md overflow-hidden"
              >
                {/* Cabecera del lote */}
                <button
                  onClick={() => setExpandido(abierto ? null : key)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/[0.015] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard size={18} className="text-black/30" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-black/80">
                          {lote.marca ?? "Sin marca"}
                        </span>
                        {lote.tipo && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${TIPO_STYLE[lote.tipo] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                          >
                            {TIPO_BADGE_LABEL[lote.tipo] ?? lote.tipo}
                          </span>
                        )}
                        {lote.lote && (
                          <span className="text-[11px] text-black/40 font-mono">
                            Lote {lote.lote}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {lote.autorizacion && (
                          <span className="text-[11px] text-black/40">
                            Aut. {lote.autorizacion}
                          </span>
                        )}
                        {lote.fechaAcreditacion && (
                          <span className="text-[11px] text-black/40">
                            Acreditación: {fmtFecha(lote.fechaAcreditacion)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[11px] text-black/40 uppercase tracking-wider">
                        {lote.cantidadTransacciones} transacción
                        {lote.cantidadTransacciones !== 1 ? "es" : ""}
                      </p>
                      <p className="text-base font-black text-black/80">
                        {formatPrice(lote.totalMonto)}
                      </p>
                    </div>
                    {abierto ? (
                      <ChevronDown size={16} className="text-black/40" />
                    ) : (
                      <ChevronRight size={16} className="text-black/40" />
                    )}
                  </div>
                </button>

                {/* Detalle de transacciones */}
                {abierto && (
                  <div className="border-t border-[var(--border-subtle)]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-black/[0.02]">
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
                              className="px-5 py-2.5 text-[10px] font-black text-black/40 uppercase tracking-[0.15em]"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(lote.transacciones ?? []).map((tx, i) => (
                          <tr
                            key={i}
                            className="border-t border-[var(--border-subtle)]/50 hover:bg-black/[0.01]"
                          >
                            <td className="px-5 py-3 text-sm text-black/70 max-w-[180px] truncate">
                              {tx.razonSocial ?? "—"}
                            </td>
                            <td className="px-5 py-3 text-sm text-black/50">
                              {tx.tipoDescripcionComprobante
                                ? `${tx.tipoDescripcionComprobante.substring(0, 3)} #${tx.codigoComprobante}`
                                : `#${tx.codigoComprobante}`}
                            </td>
                            <td className="px-5 py-3 text-sm text-black/60">
                              {tx.cantidadCuotas ?? 1}
                            </td>
                            <td className="px-5 py-3 text-sm text-black/60">
                              {tx.recargo > 0 ? `${tx.recargo}%` : "—"}
                            </td>
                            <td className="px-5 py-3 text-sm font-semibold text-violet-700">
                              {formatPrice(tx.monto)}
                            </td>
                            <td className="px-5 py-3 text-sm text-black/50 whitespace-nowrap">
                              {fmtFecha(tx.fechaPago)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-[var(--border-subtle)] bg-black/[0.02]">
                          <td
                            colSpan={4}
                            className="px-5 py-2.5 text-[11px] font-semibold text-black/40"
                          >
                            Total lote
                          </td>
                          <td className="px-5 py-2.5 text-sm font-black text-violet-700">
                            {formatPrice(lote.totalMonto)}
                          </td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
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
