import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Landmark, Plus, ShieldCheck, Filter, X, Building2, CreditCard, ArrowLeft, MoreHorizontal, Search } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useCuentaBancariaQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useMovimientosBancariosQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosBancarios.query";
import { formatPrice } from "../../../../utils/formatters";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";
import ModalAjusteMovimiento from "./ModalAjusteMovimiento";

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

const ESTADOS_CONCILIACION = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "CONCILIADO", label: "Conciliado" },
  { value: "DIFERENCIA", label: "Diferencia" },
];

const ESTADO_STYLE = {
  PENDIENTE: "bg-amber-50 text-amber-700 border-amber-200/60 dot-amber-500",
  CONCILIADO: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dot-emerald-500",
  DIFERENCIA: "bg-rose-50 text-rose-700 border-rose-200/60 dot-rose-500",
};

const LibroBanco = () => {
  const { codigo } = useParams();
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [pagina, setPagina] = useState(1);
  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false);
  const [filtros, setFiltros] = useState({ fechaDesde: "", fechaHasta: "", estadoConciliacion: "" });

  const { data: cuenta, isLoading: isLoadingCuenta } = useCuentaBancariaQuery(codigo, codigoEmpresa);

  const filtrosQuery = {
    ...filtros,
    pagina,
    limite: 20,
  };
  const { data, isLoading } = useMovimientosBancariosQuery(codigo, filtrosQuery);

  const movimientos = data?.data ?? [];
  const totalPaginas = data?.totalPaginas ?? 1;

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaDesde: "", fechaHasta: "", estadoConciliacion: "" });
    setPagina(1);
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      
      {/* SUPERIOR NAVIGATION & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <Link
          to="/panel/tesoreria/bancos/cuentas"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Volver a Cuentas
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/panel/tesoreria/bancos/cuentas/${codigo}/conciliacion`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <ShieldCheck size={16} strokeWidth={2.5} />
            Conciliar Banco
          </Link>
          <button
            onClick={() => setModalAjusteAbierto(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-900 text-white text-xs font-bold uppercase tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:bg-black transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            Ajuste Manual
          </button>
        </div>
      </div>

      {/* KPI CARDS (Contexto de Cuenta) */}
      {!isLoadingCuenta && cuenta ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-md p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Institución</p>
              <h2 className="text-xl font-black text-gray-900 leading-tight">{cuenta.banco?.nombre}</h2>
              <p className="text-sm font-semibold text-gray-500 mt-1">{cuenta.alias || "Sin alias configurado"}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
              <CreditCard size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Datos Bancarios</p>
              <p className="text-sm font-bold text-gray-800 font-mono tracking-tight">{cuenta.cbu || "—"}</p>
              <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1">
                N° {cuenta.numeroCuenta}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-md p-6 shadow-lg flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 scale-150 translate-x-1/4 translate-y-1/4">
              <Landmark size={120} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1 relative z-10">Saldo Operativo</p>
            <p className="text-4xl font-black tracking-tight text-white relative z-10">{formatPrice(cuenta.saldo)}</p>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-white border border-gray-200 rounded-md shadow-sm animate-pulse flex items-center justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando datos de la cuenta...</p>
        </div>
      )}

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
        
        {/* TOOLBAR FILTROS */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Libro Mayor Bancario</h2>
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
                  setFiltros((prev) => ({ ...prev, fechaDesde: desde, fechaHasta: hasta }));
                  setPagina(1);
                }}
              />
              
              <select
                value={filtros.estadoConciliacion}
                onChange={(e) => cambiarFiltro("estadoConciliacion", e.target.value)}
                className="h-9 px-3 border border-gray-300 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 cursor-pointer shadow-sm"
              >
                {ESTADOS_CONCILIACION.map((t) => (
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

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                {["Fecha", "Operación / Concepto", "Conciliación", "Importe", "Saldo Acum.", ""].map((col, i) => (
                  <th 
                    key={i} 
                    className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${i === 3 || i === 4 ? "text-right" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                      <p className="font-bold text-sm tracking-wide text-gray-500">CARGANDO MOVIMIENTOS...</p>
                    </div>
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                      <Search size={40} strokeWidth={1} className="text-gray-300 mb-2" />
                      <p className="font-bold text-gray-600">No se encontraron movimientos</p>
                      <p className="text-sm text-gray-500 max-w-sm mx-auto">
                        Intentá ajustar los filtros de fecha o estado de conciliación para ver resultados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((mov) => {
                  const esIngreso = mov.importe >= 0;
                  const styleKey = mov.estadoConciliacion || "PENDIENTE";
                  const badgeStyle = ESTADO_STYLE[styleKey] || "bg-gray-100 text-gray-600 dot-gray-500";
                  
                  return (
                    <tr key={mov.codigo} className="hover:bg-gray-50/80 transition-colors group">
                      
                      {/* Fecha */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700 whitespace-nowrap font-mono">
                          {fmtFecha(mov.fecha)}
                        </span>
                      </td>
                      
                      {/* Concepto / Tipo */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900 max-w-[300px] truncate">
                            {mov.concepto || "Sin concepto registrado"}
                          </span>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {mov.tipoMovimiento?.nombre ?? `Tipo ${mov.codigoTipoMovimiento}`}
                          </span>
                        </div>
                      </td>
                      
                      {/* Estado Conciliación */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${badgeStyle.split(" dot-")[0]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${badgeStyle.split(" dot-")[1] || "gray-500"}`} />
                          {mov.estadoConciliacion}
                        </span>
                      </td>

                      {/* Importe */}
                      <td className="px-6 py-4 text-right">
                        <span className={`text-base font-black whitespace-nowrap tabular-nums ${esIngreso ? "text-emerald-600" : "text-gray-900"}`}>
                          {esIngreso ? "+" : ""}
                          {formatPrice(mov.importe)}
                        </span>
                      </td>
                      
                      {/* Saldo Acumulado */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-600 whitespace-nowrap tabular-nums">
                          {formatPrice(mov.saldoAcumulado)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                          <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                            <MoreHorizontal size={16} />
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

        {/* PAGINACIÓN ESTILO CORPORATIVO */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalAjusteAbierto && cuenta && (
        <ModalAjusteMovimiento cuenta={cuenta} onClose={() => setModalAjusteAbierto(false)} />
      )}
    </div>
  );
};

export default LibroBanco;
