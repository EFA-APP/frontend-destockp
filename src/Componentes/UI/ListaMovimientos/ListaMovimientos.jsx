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

  const getTipoEstilo = (tipo) => {
    switch (tipo) {
      case "INGRESO": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "EGRESO": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "AJUSTE": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="border-t border-white/10 pt-2">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-end gap-3 mb-2 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
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
            className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10 active:scale-95 flex items-center justify-center h-8 w-8"
            title="Limpiar filtros"
          >
            <BorrarIcono size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
            <ProduccionIcono size={13} />
            Historial de Stock
        </h4>
        <span className="text-[11px] text-purple-500 font-medium bg-purple-500/5 px-2.5 py-1 rounded-full border border-purple-500/5">
            {fechaInicio || fechaFin ? "Resultados filtrados" : "Últimos registros"}
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <CargandoIcono size={30} className="animate-spin text-amber-500" />
        </div>
      ) : !movimientos || movimientos.length === 0 ? (
        <div className="text-center py-8 bg-white/5 rounded-md border border-dashed border-white/10 text-xs text-white/50 italic px-4">
          No hay movimientos para el rango seleccionado
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {movimientos.map((mov, idx) => (
            <div key={idx} className="bg-white/5 rounded-md p-3 border border-white/10 group hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getTipoEstilo(mov.tipoMovimiento)}`}>
                  {mov.tipoMovimiento}
                </span>
                <span className="text-[10px] text-white/70 bg-white/5 px-2 py-0.5 rounded-md font-medium">
                  {formatFecha(mov.fecha)}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-white tracking-tight">
                    {mov.tipoMovimiento === "INGRESO" ? "+" : mov.tipoMovimiento === "EGRESO" ? "-" : ""}
                    {mov.cantidad} <span className="text-[11px] text-white/40 font-normal ml-0.5">{mov.unidadMedida || "un."}</span>
                  </div>
                  <div className="text-[11px] text-white/40 font-bold uppercase tracking-wide mt-0.5">
                    {mov.origenMovimiento?.replace(/_/g, " ")}
                  </div>
                </div>
                
                <div className="text-right">
                   <div className="text-[11px] text-amber-500/80 font-black uppercase tracking-tighter">
                      {mov.nombreUsuario}
                   </div>
                   {mov.observacion && (
                     <div className="text-[11px] text-white/20 italic max-w-[150px] truncate" title={mov.observacion}>
                       "{mov.observacion}"
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaMovimientos;
