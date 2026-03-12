import { useState } from "react";
import { useObtenerMovimientos } from "../../../Backend/Articulos/queries/Movimientos/useObtenerMovimientos.query";
import { CargandoIcono, ProduccionIcono, BorrarIcono } from "../../../assets/Icons";
import FechaInput from "../FechaInput/FechaInput";

const ListaMovimientos = ({ codigoArticulo, tipoArticulo }) => {
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

  const { data: movimientos, isLoading } = useObtenerMovimientos(
    codigoArticulo, 
    tipoArticulo,
    fechaInicio,
    fechaFin
  );

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

  return (
    <div className="pt-2">
      {/* Filters - Glassmorphic Header */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-white/[0.03] p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex-1 w-full shrink-0">
          <FechaInput 
            label="Desde" 
            value={fechaInicio} 
            onChange={setFechaInicio}
            size="sm"
          />
        </div>
        <div className="flex-1 w-full shrink-0">
          <FechaInput 
            label="Hasta" 
            value={fechaFin} 
            onChange={setFechaFin}
            size="sm"
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            onClick={clearFilters}
            className="p-2 mt-4 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20 active:scale-95 flex items-center justify-center h-10 w-10 cursor-pointer"
            title="Limpiar filtros"
          >
            <BorrarIcono size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
        <h4 className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2.5">
            <ProduccionIcono size={14} className="opacity-60" />
            Stock Timeline
        </h4>
        <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <CargandoIcono size={32} className="animate-spin text-amber-500/60" />
          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Sincronizando log...</p>
        </div>
      ) : !movimientos || movimientos.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-[11px] text-white/30 font-medium italic px-6 flex flex-col gap-2">
          <span>No se registran eventos para este periodo</span>
          <span className="text-[9px] not-italic opacity-50">Intente ampliando el rango de fechas</span>
        </div>
      ) : (
        <div className="relative space-y-0 pb-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[11px] top-4 bottom-4 w-[1.5px] bg-white/[0.05]" />

          {movimientos.map((mov, idx) => {
            const config = getTipoConfig(mov.tipoMovimiento);
            return (
              <div key={idx} className="relative pl-9 pb-8 last:pb-0 group transition-all duration-500">
                {/* Timeline Marker (Bullet) */}
                <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full flex items-center justify-center bg-[#0a0a0a] border border-white/10 z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${config.bullet}`} />
                </div>

                {/* Event Content */}
                <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 backdrop-blur-sm group-hover:-translate-y-0.5 shadow-lg shadow-black/20">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest leading-none ${config.estilo}`}>
                        {mov.tipoMovimiento}
                      </span>
                      <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                        Evento #{movimientos.length - idx}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 bg-white/5 border border-white/5 px-2.5 py-1 rounded-xl font-bold tracking-tight">
                      {formatFecha(mov.fecha)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-lg font-black text-white tracking-tighter flex items-center gap-1.5">
                        <span className={mov.tipoMovimiento === "INGRESO" ? "text-emerald-400" : mov.tipoMovimiento === "EGRESO" ? "text-rose-400" : "text-amber-400"}>
                          {config.simbolo}
                        </span>
                        {mov.cantidad} 
                        <span className="text-[11px] text-white/30 font-black uppercase tracking-widest ml-1">{mov.unidadMedida || "un."}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-white/10" />
                        <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.15em]">
                          {mov.origenMovimiento?.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <div className="text-[10px] text-amber-500/60 font-black uppercase tracking-widest mb-1.5">
                          {mov.nombreUsuario}
                       </div>
                       {mov.observacion && (
                         <div className="text-[11px] text-white/30 italic max-w-[180px] line-clamp-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5" title={mov.observacion}>
                           {mov.observacion}
                         </div>
                       )}
                    </div>
                  </div>
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
