import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { useEliminarMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useEliminarMovimiento.mutation";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import {
  CargandoIcono,
  ProduccionIcono,
  BorrarIcono,
  DescargarIcono,
} from "../../../assets/Icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReporteMovimientosPDF from "./ReporteMovimientosPDF";
import FechaInput from "../FechaInput/FechaInput";
import ModalConfirmacion from "../ModalConfirmacion/ModalConfirmacion";

const ListaMovimientos = ({
  codigoArticulo,
  tipoArticulo,
  filtroOrigen = null,
}) => {
  const usuario = useAuthStore((state) => state.usuario);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateForInput(d);
  });
  const [fechaFin, setFechaFin] = useState(() =>
    formatDateForInput(new Date()),
  );
  const [pagina, setPagina] = useState(1);
  const limite = 15;

  const { data: response, isLoading } = useObtenerMovimientos(
    codigoArticulo,
    tipoArticulo,
    fechaInicio,
    fechaFin,
    busqueda,
    pagina,
    limite,
  );

  const rawMovimientos = response?.movimientos || [];
  const totalItems = response?.total || 0;
  const totalPaginas = Math.ceil(totalItems / (limite || 15));

  const { mutate: eliminarMovimiento, isPending: isEliminando } =
    useEliminarMovimiento();

  const movimientos = filtroOrigen
    ? rawMovimientos?.filter((m) => m.origenMovimiento === filtroOrigen)
    : rawMovimientos;

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
  };

  const handleEliminar = () => {
    if (!movimientoAEliminar) return;

    eliminarMovimiento(
      {
        codigoEmpresa: usuario?.codigoEmpresa,
        codigoSecuencial: movimientoAEliminar.codigoSecuencial,
        tipoArticulo: tipoArticulo,
      },
      {
        onSuccess: () => setMovimientoAEliminar(null),
      },
    );
  };

  const formatFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(fecha);
    } catch (e) {
      return fechaStr;
    }
  };

  const getTipoConfig = (tipo) => {
    switch (tipo) {
      case "INGRESO":
        return {
          estilo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
          bullet: "bg-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
          line: "bg-emerald-700/20",
          simbolo: "+",
        };
      case "EGRESO":
        return {
          estilo: "text-rose-400 bg-rose-400/10 border-rose-400/20",
          bullet: "bg-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
          line: "bg-rose-700/20",
          simbolo: "-",
        };
      case "AJUSTE":
        return {
          estilo: "text-amber-400 bg-amber-400/10 border-amber-400/20",
          bullet: "bg-[var(--primary)] shadow-[0_0_10px_rgba(245,158,11,0.4)]",
          line: "bg-[var(--primary)]/20",
          simbolo: "±",
        };
      default:
        return {
          estilo: "text-gray-400 bg-gray-400/10 border-gray-400/20",
          bullet: "bg-gray-400",
          line: "bg-gray-400/20",
          simbolo: "",
        };
    }
  };

  const inputClasses =
    "w-full bg-[var(--surface)] border border-black/10 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:border-[var(--primary)]/50  placeholder:text-black/20 px-4! py-2.5!";

  return (
    <div className="pt-2">
      {/* Filters - Formal Implementation */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search Bar - Premium Style */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/20 group-focus-within:text-[var(--primary)]/50 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por artículo, usuario u observación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full py-3.5! bg-[var(--fill)] border border-black rounded-md pl-11 pr-4 text-sm text-black placeholder:text-[var(--text-muted)]  focus:shadow-md! focus:shadow-black/20!"
          />
        </div>

        {/* Date Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3  p-4 ">
          <FechaInput
            label="Desde la fecha"
            value={fechaInicio}
            onChange={setFechaInicio}
            className={inputClasses}
            size="sm"
          />
          <FechaInput
            label="Hasta la fecha"
            value={fechaFin}
            onChange={setFechaFin}
            className={inputClasses}
            size="sm"
          />
          {(fechaInicio || fechaFin || busqueda) && (
            <button
              onClick={clearFilters}
              className="p-2.5 rounded-lg bg-rose-700/10 text-rose-700 hover:bg-rose-700/20  border border-rose-700/10 active:scale-95 flex items-center justify-center h-[42px] w-[42px] cursor-pointer group"
              title="Limpiar filtros"
            >
              <BorrarIcono size={18} className="group-hover:rotate-12 " />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
        <div className="flex items-center gap-3">
          <h4 className="text-[13px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-2.5">
            <ProduccionIcono size={12} color="var(--primary)" />
            {tipoArticulo === "PRODUCTO"
              ? "Historial de Productos"
              : "Historial de Materia Prima"}
          </h4>
          {movimientos?.length > 0 && (
            <div className="px-2 py-0.5 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[12px] font-black text-[var(--primary)]   ">
              {movimientos.length} MOVIMIENTOS
            </div>
          )}
        </div>
        <div className="hidden sm:block h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />

        {/* PDF Export Button */}
        {movimientos && movimientos.length > 0 && (
          <PDFDownloadLink
            document={
              <ReporteMovimientosPDF
                movimientos={movimientos}
                tipoArticulo={tipoArticulo}
                fechaInicio={fechaInicio}
                fechaFin={fechaFin}
              />
            }
            fileName={`reporte_${tipoArticulo.toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`}
          >
            {({ loading, error }) => (
              <button
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/20  active:scale-95 disabled:opacity-50 cursor-pointer group whitespace-nowrap"
                title={error ? "Error al generar PDF" : "Descargar Reporte PDF"}
              >
                {loading ? (
                  <CargandoIcono size={14} className="" />
                ) : (
                  <DescargarIcono
                    size={14}
                    className="group-hover:-translate-y-0.5 "
                  />
                )}
                <span className="text-[12px] font-black uppercase tracking-wider">
                  {loading ? "Generando..." : "Descargar Reporte"}
                </span>
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <CargandoIcono size={32} className=" text-[var(--primary)]/40" />
          <p className="text-[12px] text-black/20 font-black uppercase tracking-widest">
            Sincronizando log...
          </p>
        </div>
      ) : !movimientos || movimientos.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.01] rounded-md border border-dashed border-black/5 text-[12px] text-black/20 font-bold uppercase tracking-widest px-6 flex flex-col gap-2">
          <span>No se registran eventos</span>
          <span className="text-[10px] normal-case font-medium opacity-50">
            Ajuste el rango de fechas para ver resultados
          </span>
        </div>
      ) : (
        <div className="relative space-y-4 pb-12 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar pl-1">
          {/* Timeline Connector (Desktop) */}
          <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--primary)]/30 via-white/5 to-transparent hidden md:block" />

          {movimientos.map((mov, idx) => {
            const config = getTipoConfig(mov.tipoMovimiento);
            const isIngreso = mov.tipoMovimiento === "INGRESO";
            const isEgreso = mov.tipoMovimiento === "EGRESO";

            return (
              <div
                key={idx}
                className="relative group     fill-mode-both"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Timeline Dot (Desktop) */}
                <div
                  className={`absolute left-[29px] top-6 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${config.bullet} z-10 hidden md:block shadow-[0_0_15px_rgba(0,0,0,0.8)]   `}
                />

                {/* Desktop View: Premium Timeline Card */}
                <div className="hidden md:grid grid-cols-[120px_1fr_140px_150px_auto] gap-6 p-6 bg-[var(--surface)] border border-white/[0.03] rounded-md   items-center ml-14 shadow-2xl overflow-hidden relative">
                  {/* Background Aura */}
                  {/* Background Aura - fixed with pointer-events-none */}
                  <div
                    className={`absolute -right-10 -top-10 w-32 h-32 blur-[80px] opacity-10 rounded-full  pointer-events-none ${isIngreso ? "bg-emerald-700" : isEgreso ? "bg-rose-700" : "bg-[var(--primary)]"}`}
                  />

                  {/* Time Info */}
                  <div className="flex flex-col border-r border-black/5 pr-4">
                    <span className="text-[11px] text-[var(--primary)]/70 font-black uppercase tracking-[0.2em] mb-1">
                      {formatFecha(mov.fecha).split(",")[0]}
                    </span>
                    <span className="text-[17px] text-black font-black font-mono tracking-tighter leading-none">
                      {formatFecha(mov.fecha).split(",")[1]}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex flex-col items-start">
                      <div className="text-[16px] text-black! font-black tracking-tight mb-1.5 group-hover:text-[var(--primary)]  uppercase leading-none">
                        {mov.nombreArticulo}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded border uppercase tracking-[0.15em] leading-none ${config.estilo}`}
                        >
                          {mov.tipoMovimiento}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-black/10" />
                        <span className="text-[11px] text-[var(--text-muted)] font-bold uppercase tracking-wider truncate max-w-[150px]">
                          {mov.origenMovimiento?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    {mov.observacion && (
                      <div className="mt-3 flex items-start gap-2 max-w-[450px]">
                        <div className="w-0.5 h-3 bg-black/10 mt-1" />
                        <span
                          className="text-[13px] text-[var(--primary)]/40 italic font-medium leading-relaxed"
                          title={mov.observacion}
                        >
                          {mov.observacion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="text-right flex flex-col items-end px-6 border-x border-black/5">
                    <div
                      className={`text-2xl font-black tracking-tighter flex items-center gap-1.5 ${isIngreso ? "text-emerald-400" : isEgreso ? "text-rose-400" : "text-amber-400"}`}
                    >
                      <span className="opacity-50 text-lg font-medium">
                        {config.simbolo}
                      </span>
                      {mov.cantidad}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                      {mov.unidadMedida || "UNIDADES"}
                    </span>
                  </div>

                  {/* User/Responsible */}
                  <div className="text-right flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] text-[var(--primary)]/80 font-black uppercase tracking-wider">
                        {mov.nombreUsuario}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center">
                        <span className="text-[10px] font-black text-[var(--primary)]">
                          {mov.nombreUsuario?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">
                      Operador
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pl-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovimientoAEliminar(mov);
                      }}
                      className="w-11 h-11 rounded-md! bg-red-600/5 text-red-600/40 hover:text-red-600 hover:bg-red-600/10  cursor-pointer flex items-center justify-center border border-black/5 hover:border-red-700/20"
                      title="Anular Registro"
                    >
                      <BorrarIcono size={20} />
                    </button>
                  </div>
                </div>

                {/* Mobile View: High Impact Floating Card */}
                <div className="md:hidden p-5 bg-[#1a1a1a]/60 backdrop-blur-xl border border-black/10 rounded-[2.5rem] shadow-2xl space-y-4 relative overflow-hidden group/card active:scale-[0.98] ">
                  {/* Background Aura - fixed with pointer-events-none */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 rounded-full -mr-16 -mt-16 pointer-events-none ${isIngreso ? "bg-emerald-700" : isEgreso ? "bg-rose-700" : "bg-[var(--primary)]"}`}
                  />

                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-[0.2em] self-start leading-none ${config.estilo}`}
                        >
                          {mov.tipoMovimiento}
                        </span>
                        <span className="text-[11px] text-black/20 font-black uppercase tracking-widest">
                          {mov.origenMovimiento?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h3 className="text-black font-black text-[17px] tracking-tight leading-snug uppercase break-words">
                        {mov.nombreArticulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[12px] text-black/40 font-mono font-bold tracking-tighter">
                          {formatFecha(mov.fecha)}
                        </span>
                        <span className="text-black/10">|</span>
                        <span className="text-[12px] text-[var(--primary)]/60 font-black uppercase tracking-tighter">
                          {mov.nombreUsuario}
                        </span>
                      </div>
                    </div>

                    <div className="text-right pl-4">
                      <div
                        className={`text-3xl font-black tracking-tighter leading-none ${isIngreso ? "text-emerald-400" : isEgreso ? "text-rose-400" : "text-amber-400"}`}
                      >
                        {config.simbolo}
                        {mov.cantidad}
                      </div>
                      <span className="text-[11px] text-black/20 font-black uppercase tracking-widest">
                        {mov.unidadMedida || "un."}
                      </span>
                    </div>
                  </div>

                  {mov.observacion && (
                    <div className="bg-black/40 p-4 rounded-2xl border border-black/5 relative z-10">
                      <p className="text-[13px] text-black/40 italic leading-snug font-medium line-clamp-3">
                        "{mov.observacion}"
                      </p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMovimientoAEliminar(mov);
                    }}
                    className="w-full py-4 rounded-md! bg-red-600/5 text-red-600/60 text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-red-600/10 active:bg-red-600/20  shadow-inner relative z-20 cursor-pointer"
                  >
                    <BorrarIcono size={16} />
                    Anular Registro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPaginas > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-black/5 shadow-2xl backdrop-blur-xl    ">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black/5 border border-black/10 text-[12px] font-black uppercase text-black tracking-widest hover:bg-black/10 disabled:opacity-20 disabled:cursor-not-allowed  active:scale-95 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Anterior
          </button>

          <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-inner">
            <span className="text-[14px] font-black text-[var(--primary)] leading-none">
              {pagina}
            </span>
            <span className="text-[12px] text-black/20 font-black uppercase tracking-tighter self-end mb-[1px]">
              de {totalPaginas}
            </span>
          </div>

          <button
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina >= totalPaginas}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black/5 border border-black/10 text-[12px] font-black uppercase text-black tracking-widest hover:bg-black/10 disabled:opacity-20 disabled:cursor-not-allowed  active:scale-95 cursor-pointer"
          >
            Siguiente
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ModalConfirmacion
        open={!!movimientoAEliminar}
        onClose={() => setMovimientoAEliminar(null)}
        onConfirm={handleEliminar}
        isPending={isEliminando}
        titulo="Eliminar Movimiento"
        mensaje={
          movimientoAEliminar?.origenMovimiento === "PRODUCCION"
            ? "⚠️ Este es un movimiento de PRODUCCIÓN. Al eliminarlo se revertirá el stock del producto Y de todas las materias primas utilizadas. ¿Estás seguro?"
            : `¿Estás seguro de que deseas eliminar este movimiento? El stock de ${movimientoAEliminar?.nombreArticulo} será revertido automáticamente.`
        }
        textoConfirmar="Eliminar y Revertir"
      />
    </div>
  );
};

export default ListaMovimientos;
