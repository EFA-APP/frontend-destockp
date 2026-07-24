import { useState, useEffect } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useCarteraChequePropioQuery } from "../../../../Backend/Comprobantes/queries/useCarteraChequePropioQuery";
import { formatPrice } from "../../../../utils/formatters";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";
import SelectorUnidadNegocio from "../../../UI/Select/SelectorUnidadNegocio";
import { FileCheck, Filter, X, History, Building2, Search, MoreHorizontal, FileSignature } from "lucide-react";
import ModalAccionChequePropio from "./ModalAccionChequePropio";
import ModalHistorialChequePropio from "./ModalHistorialChequePropio";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

const ESTADOS = [
  { value: "", label: "Todos" },
  { value: "EMITIDO", label: "Emitido" },
  { value: "ENTREGADO", label: "Entregado" },
  { value: "COBRADO", label: "Cobrado" },
  { value: "RECHAZADO", label: "Rechazado" },
  { value: "ANULADO", label: "Anulado" },
];

const ESTADO_STYLE = {
  EMITIDO: "bg-sky-50 text-sky-700 border-sky-200/60 dot-sky-500",
  ENTREGADO: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dot-cyan-500",
  COBRADO: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dot-emerald-500",
  RECHAZADO: "bg-rose-50 text-rose-700 border-rose-200/60 dot-rose-500",
  ANULADO: "bg-gray-100 text-gray-500 border-gray-200 dot-gray-400",
};

const ChequePropio = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const [filtros, setFiltros] = useState({ fechaDesde: "", fechaHasta: "", estado: "", busqueda: "" });

  const [modalAccion, setModalAccion] = useState({ isOpen: false, accion: null, cheque: null });
  const [chequeHistorial, setChequeHistorial] = useState(null);

  const unidadesNegocio = usuario?.unidadesNegocio || [];
  const [filtroUnidadNegocio, setFiltroUnidadNegocio] = useState(unidadActiva?.codigo ?? "");

  useEffect(() => {
    if (unidadActiva?.codigo) setFiltroUnidadNegocio(unidadActiva.codigo);
  }, [unidadActiva?.codigo]);

  const codigoUnidadNegocio =
    unidadesNegocio.length <= 1 ? (unidadesNegocio[0]?.codigo ?? unidadActiva?.codigo) : filtroUnidadNegocio;

  const filtrosQuery = {
    codigoEmpresa: usuario?.codigoEmpresa,
    ...filtros,
    ...(codigoUnidadNegocio && { codigoUnidadNegocio: Number(codigoUnidadNegocio) }),
    pagina: 1,
    limite: 1000,
  };

  const { data, isLoading } = useCarteraChequePropioQuery(filtrosQuery);
  const cheques = data?.data ?? [];

  const cantidadTotal = cheques.length;
  const importeTotal = cheques.reduce((acc, ch) => acc + (ch.importe || 0), 0);

  const cambiarFiltro = (campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }));
  const limpiarFiltros = () => setFiltros({ fechaDesde: "", fechaHasta: "", estado: "", busqueda: "" });
  const hayFiltros = Object.values(filtros).some(Boolean);

  const onAccion = (cheque, accion) => setModalAccion({ isOpen: true, accion, cheque });

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
            <FileSignature className="text-[#1FAE6D]" size={28} strokeWidth={2.5} />
            Cartera de Cheques Propios
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Seguimiento y control de cheques propios emitidos a proveedores, pagos y rechazos.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-md p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileCheck size={100} />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">
            Compromisos (Total Filtrado)
          </p>
          <p className="text-4xl font-black text-white relative z-10 tracking-tight">
            {formatPrice(importeTotal)}
          </p>
        </div>
        
        <div className="bg-white rounded-md p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Volumen de Valores
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-gray-900 tracking-tight">{cantidadTotal}</p>
            <p className="text-sm font-bold text-gray-400">cheques encontrados</p>
          </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Listado de Cheques</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-gray-300 pr-4">
              <Filter size={14} /> Filtros
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar N° o Banco..."
                  value={filtros.busqueda}
                  onChange={(e) => cambiarFiltro("busqueda", e.target.value)}
                  className="h-9 w-48 pl-8 pr-3 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-gray-900 shadow-sm"
                />
              </div>

              <DateRangePicker
                fechaDesde={filtros.fechaDesde}
                fechaHasta={filtros.fechaHasta}
                onChange={(desde, hasta) => {
                  cambiarFiltro("fechaDesde", desde);
                  cambiarFiltro("fechaHasta", hasta);
                }}
              />

              <div className="h-9">
                <SelectorUnidadNegocio 
                  value={filtroUnidadNegocio} 
                  onChange={(valor) => setFiltroUnidadNegocio(Number(valor))} 
                />
              </div>

              <select
                value={filtros.estado}
                onChange={(e) => cambiarFiltro("estado", e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-gray-900 cursor-pointer shadow-sm"
              >
                {ESTADOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
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

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                {["Institución / N°", "Sucursal", "Fecha Emisión", "Vencimiento (Pago)", "Importe", "Estado", "Acciones"].map((col, i) => (
                  <th 
                    key={i} 
                    className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${i === 4 ? "text-right" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      <p className="font-bold text-sm tracking-wide text-gray-500">BUSCANDO CHEQUES...</p>
                    </div>
                  </td>
                </tr>
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <FileCheck size={40} strokeWidth={1} className="text-gray-300 mb-2" />
                      <p className="font-bold text-gray-600">No se encontraron valores</p>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Ajustá los filtros de búsqueda o fecha para encontrar cheques emitidos.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                cheques.map((ch) => {
                  const styleKey = ch.estado || "EMITIDO";
                  const badgeStyle = ESTADO_STYLE[styleKey] || "bg-gray-100 text-gray-600 dot-gray-500";
                  
                  return (
                    <tr key={ch.codigo} className="hover:bg-gray-50/80 transition-colors group">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Building2 size={18} className="text-gray-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{ch.banco}</span>
                            <span className="text-[12px] font-bold text-gray-500 font-mono tracking-tight mt-0.5">#{ch.numero}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-semibold text-gray-600">{ch.sucursal || "—"}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap">{fmtFecha(ch.fechaEmision)}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-black text-gray-900 whitespace-nowrap">{fmtFecha(ch.fechaPago)}</span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-black text-rose-600 tracking-tight whitespace-nowrap">
                          {formatPrice(ch.importe)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${badgeStyle.split(" dot-")[0]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${badgeStyle.split(" dot-")[1] || "gray-500"}`} />
                          {ch.estado.replace(/_/g, " ")}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          {ch.estado === "EMITIDO" && (
                            <>
                              <button
                                onClick={() => onAccion(ch, "ENTREGAR")}
                                className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-sky-100 transition-colors uppercase tracking-wider"
                              >
                                Entregar
                              </button>
                              <button
                                onClick={() => onAccion(ch, "ANULAR")}
                                className="text-[10px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-gray-100 transition-colors uppercase tracking-wider"
                              >
                                Anular
                              </button>
                            </>
                          )}
                          
                          {ch.estado === "ENTREGADO" && (
                            <>
                              <button
                                onClick={() => onAccion(ch, "COBRAR")}
                                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-emerald-100 transition-colors uppercase tracking-wider"
                              >
                                Cobrado
                              </button>
                              <button
                                onClick={() => onAccion(ch, "RECHAZAR")}
                                className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-rose-100 transition-colors uppercase tracking-wider"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          
                          {ch.estado === "RECHAZADO" && (
                            <button
                              onClick={() => onAccion(ch, "COBRAR")}
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-emerald-100 transition-colors uppercase tracking-wider"
                            >
                              Re-presentar
                            </button>
                          )}
                          
                          <button
                            onClick={() => setChequeHistorial(ch)}
                            title="Ver historial"
                            className="p-1.5 text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200 bg-transparent hover:bg-gray-50 rounded-md transition-colors ml-auto"
                          >
                            <History size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAccion.isOpen && (
        <ModalAccionChequePropio
          cheque={modalAccion.cheque}
          accion={modalAccion.accion}
          onClose={() => setModalAccion({ isOpen: false, accion: null, cheque: null })}
        />
      )}

      {chequeHistorial && (
        <ModalHistorialChequePropio cheque={chequeHistorial} onClose={() => setChequeHistorial(null)} />
      )}
    </div>
  );
};

export default ChequePropio;
