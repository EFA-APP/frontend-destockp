import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import { useObtenerProductos } from "../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import { useObtenerMateriasPrimas } from "../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import { BuscadorIcono, GuardarIcono, MovimientoIcono } from "../../../assets/Icons";
import { Package, Search, Settings2, ClipboardList, Info, AlertCircle } from "lucide-react";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";

/**
 * Página de Ajuste de Stock - Refinada y Estandarizada
 */
const AjusteStockPage = () => {
  const { tipo = "PRODUCTO" } = useParams();
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const { mutateAsync: crearMovimiento } = useCrearMovimiento();

  const queryProductos = useObtenerProductos({});
  const queryMateriasPrimas = useObtenerMateriasPrimas({});

  const allItems = useMemo(() => {
    if (tipo === "PRODUCTO") {
      return Array.isArray(queryProductos.data?.data) ? queryProductos.data.data : [];
    } else {
      return Array.isArray(queryMateriasPrimas.data) ? queryMateriasPrimas.data : [];
    }
  }, [tipo, queryProductos.data, queryMateriasPrimas.data]);

  const [searchTerm, setSearchTerm] = useState("");
  const [ajustes, setAjustes] = useState({});
  const [processing, setProcessing] = useState(false);

  const [globalConfig, setGlobalConfig] = useState({
    tipoMovimiento: "AJUSTE",
    origenMovimiento: "AJUSTE_MANUAL",
    observacion: "",
  });

  useEffect(() => {
    if (globalConfig.tipoMovimiento === "AJUSTE") {
      setGlobalConfig(prev => ({ ...prev, origenMovimiento: "AJUSTE_MANUAL" }));
    } else if (globalConfig.tipoMovimiento === "EGRESO") {
      setGlobalConfig(prev => ({ ...prev, origenMovimiento: "VENTA" }));
    } else {
      setGlobalConfig(prev => ({ ...prev, origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO" }));
    }
  }, [globalConfig.tipoMovimiento, tipo]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allItems;
    return allItems.filter(item =>
      item.nombre?.toLowerCase().includes(term) ||
      String(item.codigoSecuencial).includes(term)
    );
  }, [searchTerm, allItems]);

  const handleUpdateQuantity = (codigo, value) => {
    setAjustes(prev => ({
      ...prev,
      [codigo]: value
    }));
  };

  const selectedEntries = Object.entries(ajustes).filter(([_, v]) => v !== "" && parseFloat(v) !== 0 && !isNaN(parseFloat(v)));
  const selectedCount = selectedEntries.length;

  const handleSubmit = async () => {
    if (selectedCount === 0 || processing) return;
    setProcessing(true);
    try {
      for (const [codigo, qty] of selectedEntries) {
        const payload = {
          codigoArticulo: parseInt(codigo),
          tipoArticulo: tipo,
          tipoMovimiento: globalConfig.tipoMovimiento,
          origenMovimiento: globalConfig.origenMovimiento,
          cantidad: Math.abs(parseFloat(qty)),
          observacion: globalConfig.observacion,
          codigoUsuario: usuario?.id || 1,
          nombreUsuario: usuario?.nombre || "Sistema",
        };
        await crearMovimiento(payload);
      }
      navigate(-1);
    } catch (error) {
      console.error("Error en ajuste masivo:", error);
    } finally {
      setProcessing(false);
    }
  };

  const labelClasses = "text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 ml-1";
  const inputClasses = "w-full bg-[var(--surface)] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-white/20";

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta={`Ajuste de ${tipo === "PRODUCTO" ? "Productos" : "Materia Prima"}`}
        icono={<MovimientoIcono size={20} />}
        volver={true}
        redireccionAnterior={-1}
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start pb-20 lg:pb-10 relative">

        {/* Left Panel: Configuration */}
        <aside className="space-y-4 lg:sticky lg:top-4 z-10">
          <div className="bg-[var(--surface)] border border-white/10 rounded-md p-4 lg:p-5">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <Settings2 size={16} className="text-amber-500" />
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/60">Configuración</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className={labelClasses}>Tipo Movimiento</label>
                <select
                  value={globalConfig.tipoMovimiento}
                  onChange={(e) => setGlobalConfig(prev => ({ ...prev, tipoMovimiento: e.target.value }))}
                  className={inputClasses}
                >
                  <option value="AJUSTE">Ajuste Manual</option>
                  <option value="INGRESO">Ingreso (+)</option>
                  <option value="EGRESO">Egreso (-)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className={labelClasses}>Origen / Destino</label>
                <select
                  value={globalConfig.origenMovimiento}
                  onChange={(e) => setGlobalConfig(prev => ({ ...prev, origenMovimiento: e.target.value }))}
                  className={inputClasses}
                >
                  {globalConfig.tipoMovimiento === "AJUSTE" && <option value="AJUSTE_MANUAL">Ajuste Manual</option>}
                  {globalConfig.tipoMovimiento === "INGRESO" && (
                    <>
                      <option value="PRODUCCION">Producción</option>
                      <option value="DEPOSITO">Depósito</option>
                      <option value="INGRESO_FRUTA_MP">Ingreso Fruta (MP)</option>
                    </>
                  )}
                  {globalConfig.tipoMovimiento === "EGRESO" && (
                    <>
                      <option value="VENTA">Venta</option>
                      <option value="DEPOSITO">Depósito</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex flex-col md:col-span-2 lg:col-span-1">
                <label className={labelClasses}>Observación</label>
                <textarea
                  value={globalConfig.observacion}
                  onChange={(e) => setGlobalConfig(prev => ({ ...prev, observacion: e.target.value }))}
                  placeholder="Ej: Auditoría..."
                  rows={2}
                  className={`${inputClasses} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Desktop Summary / Button Area */}
          <div className="hidden lg:flex flex-col gap-4">

            <button
              onClick={handleSubmit}
              disabled={processing || selectedCount === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed text-white rounded-md font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/10"
            >
              {processing ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GuardarIcono size={14} />
              )}
              {processing ? "Procesando..." : "Confirmar Ajustes"}
            </button>
          </div>
        </aside>

        {/* Right Panel: List & Search */}
        <section className="flex flex-col gap-4">

          {/* Search Bar */}
          <div className="relative group lg:sticky lg:top-4 z-20">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-amber-500 transition-colors z-[99]">
              <BuscadorIcono size={16} color="white" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre o código..."
              className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-md pl-11 pr-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-all shadow-xl"
            />
          </div>

          {/* List Area */}
          <div className="space-y-4">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-[70px_1fr_100px_120px] gap-4 px-6 py-3 border border-white/10 bg-white/5 items-center rounded-t-md">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Cód.</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Artículo</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Stock</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Ajuste</div>
            </div>

            <div className="flex flex-col gap-2 max-h-[600px] lg:max-h-[500px] overflow-y-auto custom-scrollbar divide-y lg:divide-y divide-white/[0.03] lg:border-x lg:border-b lg:border-white/10 lg:bg-white/[0.02] lg:rounded-b-md ">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/10">
                  <Package size={40} strokeWidth={1} className="mb-2 opacity-10" />
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Sin resultados</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const val = ajustes[item.codigoSecuencial];
                  const hasValue = val !== "" && val !== undefined;
                  const isNegative = hasValue && parseFloat(val) < 0;

                  return (
                    <div key={item.codigoSecuencial}>
                      {/* Desktop View */}
                      <div className={`hidden lg:grid lg:grid-cols-[70px_1fr_100px_120px] gap-4 px-6 py-2.5 items-center transition-all group ${hasValue ? 'bg-amber-500/[0.03]' : 'hover:bg-white/[0.01]'}`}>
                        <div className="text-[11px] font-mono text-white/20">
                          #{item.codigoSecuencial.toString().padStart(3, '0')}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white/80 group-hover:text-amber-500 transition-colors truncate">
                            {item.nombre.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-white/40">{item.stock}</span>
                          <span className="text-[9px] font-bold text-[var(--primary-light)] ml-1 uppercase">{item.unidadMedida}</span>
                        </div>
                        <div className="flex justify-end">
                          <input
                            type="number"
                            value={ajustes[item.codigoSecuencial] || ""}
                            onChange={(e) => handleUpdateQuantity(item.codigoSecuencial, e.target.value)}
                            placeholder="—"
                            className={`w-24 bg-black/20 border rounded px-3 py-1 text-xs text-right font-bold transition-all focus:outline-none ${hasValue ? (isNegative ? 'border-rose-500/30 text-rose-500 ring-4 ring-rose-500/5' : 'border-amber-500/30 text-amber-500 ring-4 ring-amber-500/5') : 'border-white/5 text-white/30 group-hover:border-white/10'}`}
                          />
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className={`lg:hidden p-4 rounded-md border transition-all ${hasValue ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.02] border-white/5 active:bg-white/[0.04]'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-white/20 mb-1">#{item.codigoSecuencial.toString().padStart(3, '0')}</span>
                            <span className="text-[12px] font-bold text-white/90 leading-tight pr-2">
                              {item.nombre.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Stock</div>
                            <div className="text-sm font-medium text-white/50">{item.stock} <span className="text-[9px] text-[var(--primary-light)]">{item.unidadMedida}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 text-[10px] font-bold text-white/20 uppercase tracking-widest">Ingrese Ajuste:</div>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={ajustes[item.codigoSecuencial] || ""}
                            onChange={(e) => handleUpdateQuantity(item.codigoSecuencial, e.target.value)}
                            placeholder="0.00"
                            className={`w-32 bg-black/30 border rounded px-4 py-2 text-xs text-right font-black transition-all focus:outline-none ${hasValue ? (isNegative ? 'border-rose-500/50 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]') : 'border-white/10 text-white/40'}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Mobile Sticky Confirmation Bar */}
        <div className="lg:hidden bottom-20 left-4 right-4 p-1 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-4 z-50 rounded-xl shadow-2xl">
          <button
            onClick={handleSubmit}
            disabled={processing || selectedCount === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 disabled:opacity-20 text-white rounded-md font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-amber-500/20"
          >
            {processing ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GuardarIcono size={14} />
            )}
            {processing ? "Procesando" : "Confirmar"}
          </button>
        </div>
      </div>
    </ContenedorSeccion>
  );
};

export default AjusteStockPage;
