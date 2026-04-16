import React, { useState, useEffect, useMemo } from "react";
import ModalDetalleBase from "../../../UI/ModalDetalleBase/ModalDetalleBase";
import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import {
  ComprobanteIcono,
  CerrarIcono,
  CheckIcono,
} from "../../../../assets/Icons";

const SelectorComprobantesModal = ({ open, onClose, onSelect }) => {
  const { usuario } = useAuthStore();
  const {
    facturas,
    isLoading,
    busqueda,
    setBusqueda,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,
    setIsFiscal,
    condicionVenta,
    setCondicionVenta,
    tipoFactura,
    setTypeFactura,
    setPagina,
    pagina,
    meta,
  } = useFacturas("selector_");

  // --- LOGICA DE TIPOS ARCA IGUAL A TABLA ---
  const [tiposARCA, setTiposARCA] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  useEffect(() => {
    const fetchDatosArca = async () => {
      if (usuario?.conexionArca && open) {
        setCargandoTipos(true);
        try {
          const resTipos = await ObtenerTiposComprobanteApi();
          const dataRaw = Array.isArray(resTipos) ? resTipos : resTipos?.data || [];
          const vouchersReal = Array.isArray(dataRaw) ? dataRaw : dataRaw?.data || [];
          if (Array.isArray(vouchersReal)) {
            setTiposARCA(vouchersReal.map((t) => ({ valor: String(t.Id), texto: t.Desc })));
          }
        } catch (e) {
          console.error("Error cargando tipos de ARCA:", e);
        } finally {
          setCargandoTipos(false);
        }
      }
    };
    fetchDatosArca();
  }, [usuario?.id, open]);

  const opcionesClase = useMemo(() => {
    if (tiposARCA.length > 0) {
      return [{ valor: "TODAS", texto: "TODOS LOS TIPOS" }, ...tiposARCA];
    }
    return [
      { valor: "TODAS", texto: "Todos los Tipos" },
      { valor: "99", texto: "Ticket No Fiscal" },
    ];
  }, [tiposARCA]);

  const CondicionVentaTabs = () => {
    const options = [
      { id: "TODAS", label: "Todos" },
      { id: "contado", label: "Contado" },
      { id: "cuenta_corriente", label: "Cta. Cte." },
    ];

    return (
      <div className="flex p-0.5 bg-white/5 border border-white/5 rounded-lg gap-0.5">
        {options.map((opt) => {
          const active = condicionVenta === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setCondicionVenta(opt.id)}
              className={`
                px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer
                ${active ? "bg-[var(--primary)] text-black" : "text-white/30 hover:text-white/60 hover:bg-white/5"}
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <ModalDetalleBase open={open} onClose={onClose} width="max-w-[700px]">
      <div className="flex flex-col h-[85vh] bg-[#080808]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)]">
              <ComprobanteIcono size={18} />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-widest">
                Seleccionar Comprobante
              </h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                Vincular factura origen para nota de crédito/débito
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 cursor-pointer rounded-md transition-colors text-white/20 hover:text-red-500 hover:bg-red-500/10"
          >
            <CerrarIcono size={18} />
          </button>
        </div>

        {/* Filtros Avanzados */}
        <div className="p-4 bg-white/[0.01] border-b border-white/5 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Buscar por cliente, número o documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-[var(--primary)] transition-all placeholder:text-white/20"
              />
            </div>
            <CondicionVentaTabs />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[150px]">
               <Select
                  valor={isFiscal}
                  setValor={setIsFiscal}
                  options={[
                    { valor: "TODAS", texto: "TODOS LOS REGISTROS" },
                    { valor: "FISCAL", texto: "VÍA AFIP" },
                    { valor: "INTERNA", texto: "INTERNAS" },
                  ]}
                  size="sm"
                />
            </div>
            {isFiscal !== "INTERNA" && (
                <div className="flex-1 min-w-[150px]">
                    <Select
                        valor={tipoFactura}
                        setValor={setTypeFactura}
                        options={opcionesClase}
                        cargando={cargandoTipos}
                        size="sm"
                    />
                </div>
            )}
            <div className="flex items-center gap-1 border border-white/5 p-1 rounded-md bg-white/[0.02]">
                <FechaInput
                  value={fechaDesde}
                  onChange={setFechaDesde}
                  size="sm"
                  className="bg-transparent! border-none! text-[10px]! w-[100px]!"
                />
                <div className="w-px h-4 bg-white/10 mx-1"></div>
                <FechaInput
                  value={fechaHasta}
                  onChange={setFechaHasta}
                  size="sm"
                  className="bg-transparent! border-none! text-[10px]! w-[100px]!"
                />
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white/[0.02] border border-white/5 rounded-md animate-pulse"
                />
              ))}
            </div>
          ) : facturas.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {facturas.map((f) => {
                const ptoVta = String(f.puntoVenta || 1).padStart(4, "0");
                const nro = String(f.numeroComprobante || 0).padStart(8, "0");
                const nroCompleto = `${ptoVta}-${nro}`;

                // RESOLUCIÓN DE NOMBRE DE CLIENTE (Según feedback USER)
                const nombreCliente = f.receptor?.razonSocial || 
                                     (f.receptor?.nombre ? `${f.receptor.nombre} ${f.receptor.apellido || ""}` : "") ||
                                     f.cliente || // Fallback a propiedad cliente si existe
                                     "CONSUMIDOR FINAL";

                return (
                  <button
                    key={f.codigoSecuencial || f.id}
                    onClick={() => {
                      onSelect(f);
                      onClose();
                    }}
                    className="group w-full flex items-center justify-between p-3 rounded-md border border-transparent hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all text-left animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                            f.fiscal
                              ? "bg-emerald-500 shadow-emerald-500/50"
                              : "bg-blue-500 shadow-blue-500/50"
                          }`}
                        ></div>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black text-white/60">
                          {f.letraComprobante || "X"}
                        </span>
                        <span className="text-xs font-black text-white tracking-tighter">
                          {nroCompleto}
                        </span>
                        <span className="text-[9px] font-bold text-white/20 uppercase">
                          {new Date(f.fechaEmision).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white/80 uppercase truncate max-w-[300px]">
                          {nombreCliente}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-bold text-white/30">
                             {f.receptor?.DocNro || "S/D"}
                           </span>
                           <span className="text-[8px] font-black uppercase text-[var(--primary)]/40 px-1 border border-[var(--primary)]/10 rounded">
                              {f.condicionVenta?.replace('_', ' ')}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-emerald-400 tracking-tighter">
                        ${f.total?.toLocaleString()}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
                          <CheckIcono size={12} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/10 gap-2">
              <ComprobanteIcono size={48} />
              <p className="text-xs font-black uppercase tracking-widest text-center">
                No hay comprobantes que coincidan <br /> con los filtros seleccionados
              </p>
            </div>
          )}
        </div>

        {/* Footer / Pagination Simple */}
        {meta.totalItems > 0 && (
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <button
              disabled={pagina === 1}
              onClick={() => setPagina((p) => p - 1)}
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white disabled:opacity-10"
            >
              Anterior
            </button>
            <span className="text-[10px] font-black text-white/20">
              Página {pagina} de {meta.totalPaginas || 1} ({meta.totalItems} registros)
            </span>
            <button
              disabled={pagina === (meta.totalPaginas || 1)}
              onClick={() => setPagina((p) => p + 1)}
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white disabled:opacity-10"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </ModalDetalleBase>
  );
};

export default SelectorComprobantesModal;
