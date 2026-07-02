import React, { useState } from "react";
import TablaLogsArca from "../../../Tablas/Sistema/TablaLogsArca";
import { useConsultarLogsArca } from "../../../../Backend/Arca/queries/useConsultarLogsArca.query";
import { VolverIcono } from "../../../../assets/Icons";

const VistaLogsArca = ({ empresa, onClose }) => {
  const [categoria, setCategoria] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pagina, setPagina] = useState(1);
  const limite = 10;

  const { data, isLoading, refetch } = useConsultarLogsArca({
    codigoEmpresa: empresa.codigo || empresa.codigoSecuencial,
    categoria: categoria || undefined,
    estado: estado || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    pagina,
    limite,
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* HEADER DE LA VISTA */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-all group"
          >
            <VolverIcono size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase leading-none">
              Historial ARCA
            </h1>
            <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-1">
              Transacciones de <span className="text-black">{empresa.nombre}</span>
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-6 bg-black/5 p-4 rounded-lg flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] font-black tracking-widest uppercase text-black/60">
            Categoría
          </label>
          <select 
            value={categoria} 
            onChange={(e) => { setCategoria(e.target.value); setPagina(1); }}
            className="w-full px-3 py-2 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30"
          >
            <option value="">Todas</option>
            <option value="LOGIN">LOGIN</option>
            <option value="AUTORIZAR_COMPROBANTE">AUTORIZAR COMPROBANTE</option>
            <option value="OBTENER_PUNTOS_VENTA">OBTENER PUNTOS VENTA</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] font-black tracking-widest uppercase text-black/60">
            Estado
          </label>
          <select 
            value={estado} 
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
            className="w-full px-3 py-2 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30"
          >
            <option value="">Todos</option>
            <option value="EXITO">ÉXITO</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] font-black tracking-widest uppercase text-black/60">
            Fecha Desde
          </label>
          <input 
            type="date" 
            value={fechaDesde} 
            onChange={(e) => { setFechaDesde(e.target.value); setPagina(1); }}
            className="w-full px-3 py-2 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
          <label className="text-[10px] font-black tracking-widest uppercase text-black/60">
            Fecha Hasta
          </label>
          <input 
            type="date" 
            value={fechaHasta} 
            onChange={(e) => { setFechaHasta(e.target.value); setPagina(1); }}
            className="w-full px-3 py-2 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30"
          />
        </div>

        <button 
          onClick={() => { setCategoria(""); setEstado(""); setFechaDesde(""); setFechaHasta(""); setPagina(1); }}
          className="px-4 py-2 bg-black/10 hover:bg-black/20 text-black rounded-md text-[12px] font-black uppercase tracking-widest transition-colors h-[38px]"
        >
          Limpiar
        </button>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-hidden">
        <TablaLogsArca
          logs={data?.data || []}
          cargando={isLoading}
          busqueda=""
          onRefrescar={refetch}
          pagina={pagina}
          setPagina={setPagina}
          totalPaginas={data?.totalPaginas || 1}
        />
      </div>
    </div>
  );
};

export default VistaLogsArca;
