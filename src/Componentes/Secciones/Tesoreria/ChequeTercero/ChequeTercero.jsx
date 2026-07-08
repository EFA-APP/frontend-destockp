import { useState, useEffect } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useCarteraChequeTerceroQuery } from "../../../../Backend/Comprobantes/queries/useCarteraChequeTerceroQuery";
import { formatPrice } from "../../../../utils/formatters";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";
import SelectorUnidadNegocio from "../../../UI/Select/SelectorUnidadNegocio";
import { Landmark, Filter, X, ArrowDownCircle, Banknote, XCircle, CheckCircle2 } from "lucide-react";
import ModalDestinoCheque from "./ModalDestinoCheque";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "RECIBIDO", label: "Recibido" },
  { value: "EN_CARTERA", label: "En Cartera" },
  { value: "DEPOSITADO", label: "Depositado" },
  { value: "ENDOSADO", label: "Endosado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "COBRADO", label: "Cobrado" },
];

const ESTADO_STYLE = {
  RECIBIDO: "bg-blue-50 text-blue-700 border-blue-200",
  EN_CARTERA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DEPOSITADO: "bg-purple-50 text-purple-700 border-purple-200",
  ENDOSADO: "bg-amber-50 text-amber-700 border-amber-200",
  RECHAZADO: "bg-rose-50 text-rose-700 border-rose-200",
  COBRADO: "bg-teal-50 text-teal-700 border-teal-200",
};

const ChequeTercero = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    busqueda: "",
  });

  const [modalDestino, setModalDestino] = useState({ isOpen: false, accion: null, cheque: null });

  const unidadesNegocio = usuario?.unidadesNegocio || [];
  const [filtroUnidadNegocio, setFiltroUnidadNegocio] = useState(
    unidadActiva?.codigoSecuencial ?? "",
  );

  useEffect(() => {
    if (unidadActiva?.codigoSecuencial) {
      setFiltroUnidadNegocio(unidadActiva.codigoSecuencial);
    }
  }, [unidadActiva?.codigoSecuencial]);

  // Si hay una sola unidad de negocio (o ninguna), se usa fija sin mostrar selector.
  const codigoUnidadNegocio =
    unidadesNegocio.length <= 1
      ? (unidadesNegocio[0]?.codigoSecuencial ?? unidadActiva?.codigoSecuencial)
      : filtroUnidadNegocio;

  const filtrosQuery = {
    ...filtros,
    ...(codigoUnidadNegocio && { codigoUnidadNegocio: Number(codigoUnidadNegocio) }),
    pagina: 1,
    limite: 1000,
  };

  const { data, isLoading } = useCarteraChequeTerceroQuery(filtrosQuery);
  const cheques = data?.data ?? [];

  const cantidadTotal = cheques.length;
  const importeTotal = cheques.reduce((acc, ch) => acc + (ch.importe || 0), 0);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaDesde: "", fechaHasta: "", estado: "", busqueda: "" });
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  const onAccion = (cheque, accion) => {
    setModalDestino({ isOpen: true, accion, cheque });
  };

  return (
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion ruta="Tesorería / Cartera de Cheques de Tercero" icono={<Banknote size={20} />} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-md bg-emerald-50 text-emerald-600 shrink-0">
            <Banknote size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Importe Total</p>
            <p className="text-2xl font-black leading-none tracking-tight text-emerald-600">{formatPrice(importeTotal)}</p>
          </div>
        </div>
        <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-md bg-black/[0.03] text-gray-500 shrink-0">
            <Landmark size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Cheques en Cartera</p>
            <p className="text-2xl font-black leading-none tracking-tight text-gray-500">{cantidadTotal}</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-black/[0.01]">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-black/40 uppercase tracking-widest mb-1">
              <Filter size={14} />
              Filtros
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">Búsqueda</span>
              <input
                type="text"
                placeholder="N°, Banco, Titular..."
                value={filtros.busqueda}
                onChange={(e) => cambiarFiltro("busqueda", e.target.value)}
                className="h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs bg-white focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">Cobro entre</span>
              <DateRangePicker
                fechaDesde={filtros.fechaDesde}
                fechaHasta={filtros.fechaHasta}
                onChange={(desde, hasta) => {
                  setFiltros((prev) => ({ ...prev, fechaDesde: desde, fechaHasta: hasta }));
                }}
              />
            </div>

            <SelectorUnidadNegocio
              value={filtroUnidadNegocio}
              onChange={(valor) => setFiltroUnidadNegocio(Number(valor))}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-black/50 uppercase tracking-wider">Estado</span>
              <select
                value={filtros.estado}
                onChange={(e) => cambiarFiltro("estado", e.target.value)}
                className="h-9 px-3 border border-[var(--border-subtle)] rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
              >
                {ESTADOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <X size={13} />
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-[var(--border-subtle)]">
                {["Banco / N°", "Titular / CUIT", "Emisión", "Cobro", "Importe", "Estado", "Acciones"].map((col) => (
                  <th key={col} className="px-5 py-3.5 text-[9px] font-black text-black/40 uppercase tracking-[0.18em] whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-semibold text-black/40">Cargando cartera de cheques...</td>
                </tr>
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm font-semibold text-black/40">No se encontraron cheques.</td>
                </tr>
              ) : (
                cheques.map((ch) => {
                  const style = ESTADO_STYLE[ch.estado] || "bg-gray-100 text-gray-600";
                  return (
                    <tr key={ch.codigo} className="border-b border-[var(--border-subtle)] hover:bg-[var(--primary)]/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-xs font-bold text-gray-800">{ch.banco}</div>
                        <div className="text-xs text-gray-500 font-mono">#{ch.numero}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-xs font-bold text-gray-800">{ch.titular}</div>
                        <div className="text-[10px] text-gray-500 font-mono">CUIT: {ch.cuit}</div>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {fmtFecha(ch.fechaEmision)}
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {fmtFecha(ch.fechaCobro)}
                      </td>
                      <td className="px-5 py-3 text-sm font-black text-emerald-700 whitespace-nowrap">
                        {formatPrice(ch.importe)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${style}`}>
                          {ch.estado.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {ch.estado === "EN_CARTERA" || ch.estado === "RECIBIDO" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onAccion(ch, "DEPOSITAR")}
                              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                            >
                              Depositar
                            </button>
                            <button
                              onClick={() => onAccion(ch, "COBRAR")}
                              className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100"
                            >
                              Cobrar
                            </button>
                            <button
                              onClick={() => onAccion(ch, "RECHAZAR")}
                              className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
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
      
      {modalDestino.isOpen && (
        <ModalDestinoCheque
          cheque={modalDestino.cheque}
          accion={modalDestino.accion}
          onClose={() => setModalDestino({ isOpen: false, accion: null, cheque: null })}
        />
      )}
    </div>
  );
};

export default ChequeTercero;
