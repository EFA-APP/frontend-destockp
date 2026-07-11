import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Search, FileText, Calendar, Building2 } from "lucide-react";
import { useObtenerComprobantesQuery } from "../../../../Backend/Ventas/queries/Comprobante/useObtenerComprobantes.query";
import { formatPrice } from "../../../../utils/formatters";

const TIPOS_COMPROBANTE = [
  { value: "", label: "Todos los tipos" },
  { value: "FACTURA", label: "Factura" },
  { value: "NOTA_CREDITO", label: "Nota de Crédito" },
  { value: "NOTA_DEBITO", label: "Nota de Débito" },
  { value: "PRESUPUESTO", label: "Presupuesto" },
];

const formatNro = (puntoVenta, numeroComprobante) =>
  `${String(puntoVenta || 0).padStart(5, "0")}-${String(numeroComprobante || 0).padStart(8, "0")}`;

const FieldLabel = ({ children }) => (
  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

const SelectorComprobanteModal = ({
  isOpen,
  onClose,
  onSeleccionar,
  unidadesNegocio = [],
}) => {
  const firstUnidad = unidadesNegocio[0]?.codigo
    ? String(unidadesNegocio[0].codigo)
    : "";

  const [unidadNegocio, setUnidadNegocio] = useState(firstUnidad);
  const [tipoDescripcion, setTipoDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  useEffect(() => {
    if (unidadesNegocio.length > 0 && !unidadNegocio) {
      setUnidadNegocio(String(unidadesNegocio[0].codigo));
    }
  }, [unidadesNegocio]);

  const filtros = {
    codigoUnidadNegocio: unidadNegocio || undefined,
    ...(tipoDescripcion && { tipo: tipoDescripcion }),
    ...(fechaInicio && { fechaDesde: fechaInicio }),
    ...(fechaFin && { fechaHasta: fechaFin }),
    ...(busquedaDebounced && { busqueda: busquedaDebounced }),
    limite: 50,
  };

  const { data, isLoading } = useObtenerComprobantesQuery(filtros);
  const comprobantes = Array.isArray(data) ? data : (data?.data ?? []);

  if (!isOpen) return null;

  const handleSeleccionar = (comp) => {
    onSeleccionar(comp);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-md shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-tight">
                Buscar Comprobante Asociado
              </h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                Seleccioná el comprobante origen que origina esta nota
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all group shadow-sm cursor-pointer"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 bg-white shrink-0 flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <FieldLabel>Unidad de Negocio</FieldLabel>
              <select
                value={unidadNegocio}
                onChange={(e) => setUnidadNegocio(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {unidadesNegocio.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select
                value={tipoDescripcion}
                onChange={(e) => setTipoDescripcion(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {TIPOS_COMPROBANTE.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Desde</FieldLabel>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 focus:outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <FieldLabel>Hasta</FieldLabel>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Buscador */}
          <div className="relative flex bg-white border border-gray-300 rounded-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[46px] items-center shadow-xs">
            <div className="pl-4 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, número, referencia..."
              className="w-full bg-transparent pl-3 pr-10 py-2 text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 w-5 h-5 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50/50">
          {!unidadNegocio ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Building2 className="w-10 h-10 text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest">
                Seleccioná una unidad de negocio
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-white border border-gray-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : comprobantes.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
              <Search className="w-10 h-10 text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest">
                Sin resultados
              </p>
              <p className="text-[10px] font-semibold uppercase">
                Intentá con otros filtros
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {comprobantes.map((comp) => (
                <button
                  key={comp.codigo}
                  type="button"
                  onClick={() => handleSeleccionar(comp)}
                  className="w-full text-left bg-white border border-gray-200 rounded-md px-4 py-3 hover:border-[var(--primary)]/50 hover:shadow-sm hover:bg-[var(--primary)]/5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                        {comp.tipoDescripcionComprobante || "COMPROBANTE"}{" "}
                        {comp.letraComprobante || ""}
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {formatNro(comp.puntoVenta, comp.numeroComprobante)}
                      </span>
                    </div>
                    {(comp.nombreCliente || comp.razonSocial) && (
                      <p className="text-[11px] font-semibold text-gray-500 mt-0.5 truncate">
                        {comp.nombreCliente || comp.razonSocial}
                      </p>
                    )}
                    {comp.fechaEmision && (
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(comp.fechaEmision).toLocaleDateString(
                          "es-AR",
                        )}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-gray-900">
                      {formatPrice(comp.total || 0)}
                    </p>
                    {comp.saldoPendiente !== undefined && (
                      <p className="text-[10px] font-semibold text-amber-600">
                        Saldo: {formatPrice(comp.saldoPendiente)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs uppercase tracking-wider rounded-md transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SelectorComprobanteModal;
