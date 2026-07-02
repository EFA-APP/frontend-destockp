import React, { useState } from "react";
import DataTable from "../../UI/DataTable/DataTable";
import { columnasLogsArca } from "./ColumnasLogsArca";
import { accionesLogsArca } from "./AccionesLogsArca";

const TablaLogsArca = ({ logs, cargando, busqueda, onRefrescar, setPagina, setLimite, pagina, totalPaginas }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [logSeleccionado, setLogSeleccionado] = useState(null);

  const handleVerDetalle = (log) => {
    setLogSeleccionado(log);
    setModalAbierto(true);
  };

  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden flex flex-col h-full">
      <DataTable
        columnas={columnasLogsArca()}
        acciones={accionesLogsArca({ handleVerDetalle })}
        datos={logs || []}
        cargando={cargando}
        titulo="Historial de Peticiones"
        subtitulo="Registro detallado de transacciones con AFIP/ARCA"
        busqueda={busqueda}
        onRefrescar={onRefrescar}
        alturaFija={400}
        paginacion={{
            paginaActual: pagina,
            totalPaginas: totalPaginas,
            setPagina: setPagina,
        }}
        sinBuscador={true}
      />

      {modalAbierto && logSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
              <h2 className="text-lg font-black uppercase tracking-tight">Detalle de Respuesta JSON</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] text-[#ce9178] p-4 rounded-lg font-mono text-[12px] leading-relaxed shadow-inner">
              <pre>{JSON.stringify(logSeleccionado.response, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaLogsArca;
