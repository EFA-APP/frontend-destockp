import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { CargandoIcono, ProduccionIcono, BorrarIcono } from "../../../assets/Icons";
import FechaInput from "../FechaInput/FechaInput";

const ListaMovimientos = ({ codigoArticulo, tipoArticulo, filtroOrigen = null }) => {
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
    fechaFin
  );

  const movimientos = filtroOrigen 
    ? rawMovimientos?.filter(m => m.origenMovimiento === filtroOrigen)
    : rawMovimientos;

  const clearFilters = () => {
    setFechaInicio("");
    setFechaFin("");
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
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3 mb-8 bg-white/[0.02] p-4 rounded-md border border-white/5 shadow-inner">
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
        {(fechaInicio || fechaFin) && (
          <button
            onClick={clearFilters}
            className="p-2.5 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/10 active:scale-95 flex items-center justify-center h-[38px] w-[38px] cursor-pointer group"
            title="Limpiar filtros"
          >
            <BorrarIcono size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <h4 className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2.5">
          <ProduccionIcono size={12} className="opacity-40" />
          {tipoArticulo === "PRODUCTO" ? "Movimientos Global de Productos" : "Movimientos Global de Materia Prima"}
        </h4>
        <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />
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
        <div className="relative space-y-3 pb-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {movimientos.map((mov, idx) => {
            const config = getTipoConfig(mov.tipoMovimiento);
            return (
              <div key={idx} className="group">
                {/* Desktop View: Formal Row */}
                <div className="hidden md:grid grid-cols-[100px_1fr_120px_140px] gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-md transition-all duration-300 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mb-1">
                      {formatFecha(mov.fecha).split(',')[0]}
                    </span>
                    <span className="text-[11px] text-white/80 font-black font-mono">
                      {formatFecha(mov.fecha).split(',')[1]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-8 rounded-full ${config.bullet} opacity-50`} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${config.estilo}`}>
                          {mov.tipoMovimiento}
                        </span>
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                          {mov.origenMovimiento?.replace(/_/g, " ")}
                        </span>
                      </div>
                      {mov.observacion && (
                        <span className="text-[11px] text-white/40 italic mt-1 line-clamp-1 truncate max-w-[300px]" title={mov.observacion}>
                          "{mov.observacion}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <div className="text-base font-black text-white tracking-tighter flex items-center gap-1">
                      <span className={mov.tipoMovimiento === "INGRESO" ? "text-emerald-400" : mov.tipoMovimiento === "EGRESO" ? "text-rose-400" : "text-amber-400"}>
                        {config.simbolo}
                      </span>
                      {mov.cantidad}
                    </div>
                    <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest underline decoration-white/10 underline-offset-2">
                      {mov.unidadMedida || "unidades"}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end border-l border-white/5 pl-4">
                    <span className="text-[10px] text-amber-500/50 font-black uppercase tracking-widest mb-0.5">
                      {mov.nombreUsuario}
                    </span>
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">OPERADOR</span>
                  </div>
                </div>

                {/* Mobile View: Premium Card */}
                <div className="md:hidden p-4 bg-white/[0.03] border border-white/10 rounded-md shadow-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-black px-2.5 py-1 rounded border uppercase tracking-widest self-start mb-2 ${config.estilo}`}>
                        {mov.tipoMovimiento}
                      </span>
                      <span className="text-[10px] text-white/80 font-black">
                        {formatFecha(mov.fecha)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white tracking-tighter">
                        <span className={mov.tipoMovimiento === "INGRESO" ? "text-emerald-400" : mov.tipoMovimiento === "EGRESO" ? "text-rose-400" : "text-amber-400"}>
                          {config.simbolo}
                        </span>
                        {mov.cantidad}
                        <span className="text-[9px] text-white/30 ml-1 font-bold uppercase">{mov.unidadMedida || "un."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    <div className="flex-1">
                      <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest block mb-1">Origen / Destino</span>
                      <span className="text-[10px] text-white/60 font-black uppercase">{mov.origenMovimiento?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest block mb-1">Usuario</span>
                      <span className="text-[10px] text-amber-500/60 font-black uppercase">{mov.nombreUsuario}</span>
                    </div>
                  </div>

                  {mov.observacion && (
                    <div className="bg-black/20 p-3 rounded border border-white/5 border-dashed">
                      <p className="text-[10px] text-white/40 italic leading-relaxed">
                        {mov.observacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListaMovimientos;
