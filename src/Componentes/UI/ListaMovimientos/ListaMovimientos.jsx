import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { useEliminarMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useEliminarMovimiento.mutation";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { CargandoIcono, ProduccionIcono, BorrarIcono, DescargarIcono } from "../../../assets/Icons";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReporteMovimientosPDF from "./ReporteMovimientosPDF";
import FechaInput from "../FechaInput/FechaInput";
import ModalConfirmacion from "../ModalConfirmacion/ModalConfirmacion";

const ListaMovimientos = ({ codigoArticulo, tipoArticulo, filtroOrigen = null }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const [movimientoAEliminar, setMovimientoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateForInput(d);
  });
  const [fechaFin, setFechaFin] = useState(() => formatDateForInput(new Date()));

  const { data: rawMovimientos, isLoading } = useObtenerMovimientos(
    codigoArticulo,
    tipoArticulo,
    fechaInicio,
    fechaFin,
    busqueda
  );

  const { mutate: eliminarMovimiento, isPending: isEliminando } = useEliminarMovimiento();

  const movimientos = filtroOrigen 
    ? rawMovimientos?.filter(m => m.origenMovimiento === filtroOrigen)
    : rawMovimientos;

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
    setBusqueda("");
  };

  const handleEliminar = () => {
    if (!movimientoAEliminar) return;
    
    eliminarMovimiento({
      codigoEmpresa: usuario?.codigoEmpresa,
      codigoSecuencial: movimientoAEliminar.codigoSecuencial,
      tipoArticulo: tipoArticulo
    }, {
      onSuccess: () => setMovimientoAEliminar(null)
    });
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
      case "INGRESO": return {
        estilo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        bullet: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]",
        line: "bg-emerald-500/20",
        simbolo: "+"
      };
      case "EGRESO": return {
        estilo: "text-rose-400 bg-rose-400/10 border-rose-400/20",
        bullet: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
        line: "bg-rose-500/20",
        simbolo: "-"
      };
      case "AJUSTE": return {
        estilo: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        bullet: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
        line: "bg-amber-500/20",
        simbolo: "±"
      };
      default: return {
        estilo: "text-gray-400 bg-gray-400/10 border-gray-400/20",
        bullet: "bg-gray-400",
        line: "bg-gray-400/20",
        simbolo: ""
      };
    }
  };

  const inputClasses = "w-full bg-[var(--surface)] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-white/20 px-4! py-2.5!";

  return (
    <div className="pt-2">
      {/* Filters - Formal Implementation */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search Bar - Premium Style */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-amber-500/50 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por artículo, usuario u observación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Date Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-inner">
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
              className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/10 active:scale-95 flex items-center justify-center h-[42px] w-[42px] cursor-pointer group"
              title="Limpiar filtros"
            >
              <BorrarIcono size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
        <div className="flex items-center gap-3">
          <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2.5">
            <ProduccionIcono size={12} color="var(--primary-light)" />
            {tipoArticulo === "PRODUCTO" ? "Historial de Productos" : "Historial de Materia Prima"}
          </h4>
          {movimientos?.length > 0 && (
            <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 animate-in zoom-in duration-300">
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
            fileName={`reporte_${tipoArticulo.toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading, error }) => (
              <button
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer group whitespace-nowrap"
                title={error ? "Error al generar PDF" : "Descargar Reporte PDF"}
              >
                {loading ? (
                  <CargandoIcono size={14} className="animate-spin" />
                ) : (
                  <DescargarIcono size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                )}
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {loading ? "Generando..." : "Descargar Reporte"}
                </span>
              </button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <CargandoIcono size={32} className="animate-spin text-amber-500/40" />
          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Sincronizando log...</p>
        </div>
      ) : !movimientos || movimientos.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.01] rounded-md border border-dashed border-white/5 text-[10px] text-white/20 font-bold uppercase tracking-widest px-6 flex flex-col gap-2">
          <span>No se registran eventos</span>
          <span className="text-[8px] normal-case font-medium opacity-50">Ajuste el rango de fechas para ver resultados</span>
        </div>
      ) : (
        <div className="relative space-y-6 pb-4 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar pl-4">
          {/* Vertical Line for Timeline */}
          <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/20 via-white/5 to-transparent hidden md:block" />

          {movimientos.map((mov, idx) => {
            const config = getTipoConfig(mov.tipoMovimiento);
            return (
              <div key={idx} className="relative group animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                {/* Timeline Bullet (Desktop) */}
                <div className={`absolute left-[29px] top-6 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${config.bullet} z-10 hidden md:block shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />

                {/* Desktop View: Timeline Card */}
                <div className="hidden md:grid grid-cols-[120px_1fr_140px_150px_auto] gap-6 p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/20 rounded-2xl transition-all duration-500 items-center ml-12 backdrop-blur-sm group-hover:translate-x-1 shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">
                      {formatFecha(mov.fecha).split(',')[0]}
                    </span>
                    <span className="text-sm text-white font-black font-mono tracking-tighter">
                      {formatFecha(mov.fecha).split(',')[1]}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-col items-start gap-1">
                      <div className="text-[13px] text-white font-bold tracking-tight mb-0.5 group-hover:text-amber-500 transition-colors">
                        {mov.nombreArticulo}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-[0.1em] ${config.estilo}`}>
                          {mov.tipoMovimiento}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                          {mov.origenMovimiento?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    {mov.observacion && (
                      <span className="text-[11px] text-white/30 italic mt-2 line-clamp-1 max-w-[400px] font-medium" title={mov.observacion}>
                        "{mov.observacion}"
                      </span>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end px-4 border-r border-white/5">
                    <div className="text-xl font-black text-white tracking-tighter flex items-center gap-1.5">
                      <span className={mov.tipoMovimiento === "INGRESO" ? "text-emerald-400" : mov.tipoMovimiento === "EGRESO" ? "text-rose-400" : "text-amber-400"}>
                        {config.simbolo}{mov.cantidad}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                      {mov.unidadMedida || "unidades"}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-amber-500/70 font-black uppercase tracking-widest mb-0.5">
                      {mov.nombreUsuario}
                    </span>
                    <span className="text-[8px] text-white/10 font-bold uppercase tracking-[0.2em]">Responsable</span>
                  </div>

                  <div className="pl-4">
                    <button 
                      onClick={() => setMovimientoAEliminar(mov)}
                      className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-500/20 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer group/del flex items-center justify-center border border-transparent hover:border-rose-500/20"
                      title="Eliminar registro"
                    >
                      <BorrarIcono size={18} />
                    </button>
                  </div>
                </div>

                {/* Mobile View: High Impact Card */}
                <div className="md:hidden p-5 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md active:scale-[0.98] transition-transform">
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12 ${config.bullet}`} />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest self-start mb-2 ${config.estilo}`}>
                        {mov.tipoMovimiento}
                      </span>
                      <h3 className="text-white font-black text-sm tracking-tight mb-1">{mov.nombreArticulo}</h3>
                      <span className="text-[10px] text-white/40 font-bold">
                        {formatFecha(mov.fecha)}
                      </span>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black text-white tracking-tighter">
                        <span className={mov.tipoMovimiento === "INGRESO" ? "text-emerald-400" : mov.tipoMovimiento === "EGRESO" ? "text-rose-400" : "text-amber-400"}>
                          {config.simbolo}{mov.cantidad}
                        </span>
                      </div>
                      <span className="text-[9px] text-white/20 font-black uppercase">{mov.unidadMedida || "un."}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 relative z-10">
                    <div>
                      <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block mb-0.5">Origen</span>
                      <span className="text-[10px] text-white/60 font-black uppercase tracking-tighter">{mov.origenMovimiento?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-white/20 font-black uppercase tracking-widest block mb-0.5">Usuario</span>
                      <span className="text-[10px] text-amber-500/80 font-black uppercase tracking-tighter">{mov.nombreUsuario}</span>
                    </div>
                  </div>

                  {mov.observacion && (
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 border-dashed relative z-10">
                      <p className="text-[11px] text-white/40 italic leading-snug font-medium">
                        "{mov.observacion}"
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => setMovimientoAEliminar(mov)}
                    className="w-full py-3 rounded-2xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-rose-500/20 active:bg-rose-500/20 transition-colors"
                  >
                    <BorrarIcono size={14} />
                    Eliminar Registro
                  </button>
                </div>
              </div>
            );
          })}
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
