import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import { useObtenerProductos } from "../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import { useObtenerMateriasPrimas } from "../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import ModalDetalleBase from "../../UI/ModalDetalleBase/ModalDetalleBase";
import ModalDetalle from "../../UI/ModalDetalleBase/ModalDetalle";
import { GuardarIcono, MovimientoIcono, ProduccionIcono, AgregarIcono, BuscadorIcono } from "../../../assets/Icons";
import { Trash2, Package, Plus, ChevronRight, AlertCircle } from "lucide-react";

const ModalCargaMasivaMovimientos = ({ open, onClose, tipo = "PRODUCTO" }) => {
  const usuario = useAuthStore((state) => state.usuario);
  const { mutateAsync: crearMovimiento } = useCrearMovimiento();

  // Queries para obtener items según el tipo
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [processing, setProcessing] = useState(false);

  const [globalConfig, setGlobalConfig] = useState({
    tipoMovimiento: "INGRESO",
    origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
    observacion: "",
  });

  // Resetear origen según el tipo de movimiento global
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
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return allItems
      .filter(item =>
        (item.nombre?.toLowerCase().includes(term) || String(item.codigoSecuencial).includes(term)) &&
        !selectedItems.find(selected => selected.codigoSecuencial === item.codigoSecuencial)
      )
      .slice(0, 5); // Limitar resultados sugeridos
  }, [searchTerm, allItems, selectedItems]);

  const handleAddItem = (item) => {
    setSelectedItems(prev => [...prev, { ...item, cantidadCarga: "" }]);
    setSearchTerm("");
  };

  const handleRemoveItem = (codigo) => {
    setSelectedItems(prev => prev.filter(item => item.codigoSecuencial !== codigo));
  };

  const handleUpdateQuantity = (codigo, value) => {
    setSelectedItems(prev => prev.map(item =>
      item.codigoSecuencial === codigo ? { ...item, cantidadCarga: value } : item
    ));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || processing) return;

    // Validar que todos tengan cantidad
    const invalid = selectedItems.some(item => !item.cantidadCarga || parseFloat(item.cantidadCarga) <= 0);
    if (invalid) return;

    setProcessing(true);
    try {
      for (const item of selectedItems) {
        const payload = {
          codigoArticulo: item.codigoSecuencial,
          tipoArticulo: tipo,
          tipoMovimiento: globalConfig.tipoMovimiento,
          origenMovimiento: globalConfig.origenMovimiento,
          cantidad: parseFloat(item.cantidadCarga),
          observacion: globalConfig.observacion,
          codigoUsuario: usuario?.id || 1,
          nombreUsuario: usuario?.nombre || "Sistema",
        };
        await crearMovimiento(payload);
      }
      onClose();
      setSelectedItems([]);
      setGlobalConfig({
        tipoMovimiento: "INGRESO",
        origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
        observacion: "",
      });
    } catch (error) {
      console.error("Error en carga masiva:", error);
    } finally {
      setProcessing(false);
    }
  };

  const content = (
    <div className="space-y-6 py-2">
      {/* Configuración Global */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Tipo de Movimiento</label>
          <select
            value={globalConfig.tipoMovimiento}
            onChange={(e) => setGlobalConfig(prev => ({ ...prev, tipoMovimiento: e.target.value }))}
            className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
          >
            <option value="INGRESO">Ingreso (+)</option>
            <option value="EGRESO">Egreso (-)</option>
            <option value="AJUSTE">Ajuste (Manual)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Origen / Destino</label>
          <select
            value={globalConfig.origenMovimiento}
            onChange={(e) => setGlobalConfig(prev => ({ ...prev, origenMovimiento: e.target.value }))}
            className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all cursor-pointer"
          >
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
            {globalConfig.tipoMovimiento === "AJUSTE" && (
              <option value="AJUSTE_MANUAL">Ajuste Manual</option>
            )}
          </select>
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold text-white/50 uppercase ml-1">Observación General (Opcional)</label>
          <textarea
            value={globalConfig.observacion}
            onChange={(e) => setGlobalConfig(prev => ({ ...prev, observacion: e.target.value }))}
            rows="1"
            placeholder="Razón del movimiento masivo..."
            className="w-full bg-[#1a1c1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none"
          />
        </div>
      </div>

      {/* Buscador de Items */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50 group-focus-within:text-amber-500 transition-colors">
          <BuscadorIcono size={18} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Buscar ${tipo === "PRODUCTO" ? "productos" : "materias primas"} por nombre o código...`}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all"
        />

        {/* Sugerencias */}
        {filteredItems.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-[#1a1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {filteredItems.map(item => (
              <button
                key={item.codigoSecuencial}
                onClick={() => handleAddItem(item)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Package size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.nombre}</div>
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">#{item.codigoSecuencial} • Stock: {item.stock} {item.unidadMedida}</div>
                  </div>
                </div>
                <Plus size={18} className="text-amber-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Seleccionados */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {selectedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
            <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">No hay items seleccionados</p>
            <p className="text-[10px] uppercase tracking-[0.2em] mt-1">Usa el buscador para añadir artículos</p>
          </div>
        ) : (
          selectedItems.map((item) => (
            <div
              key={item.codigoSecuencial}
              className="group flex items-center gap-4 bg-white/5 hover:bg-white/[0.08] p-4 rounded-2xl border border-white/10 transition-all animate-in slide-in-from-right-4 duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{item.nombre}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">#{item.codigoSecuencial}</span>
                  <span className="text-[10px] text-white/30">•</span>
                  <span className="text-[10px] text-white/40 font-medium">Stock: {item.stock} {item.unidadMedida}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    value={item.cantidadCarga}
                    onChange={(e) => handleUpdateQuantity(item.codigoSecuencial, e.target.value)}
                    placeholder="Cant."
                    className="w-24 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 text-center font-bold transition-all"
                  />
                  {!item.cantidadCarga && (
                    <div className="absolute -top-1 -right-1">
                      <AlertCircle size={12} className="text-rose-500" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveItem(item.codigoSecuencial)}
                  className="p-2 text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {selectedItems.length} {selectedItems.length === 1 ? 'Artículo' : 'Artículos'}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-xs font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={processing || selectedItems.length === 0 || selectedItems.some(i => !i.cantidadCarga || parseFloat(i.cantidadCarga) <= 0)}
          className="flex items-center gap-3 px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <GuardarIcono size={16} />
          )}
          {processing ? "Procesando..." : "Registrar Carga Masiva"}
        </button>
      </div>
    </div>
  );

  return (
    <ModalDetalleBase open={open} onClose={onClose}>
      <ModalDetalle
        title={`Carga Masiva de ${tipo === "PRODUCTO" ? "Productos" : "Insumos"}`}
        icon={<MovimientoIcono size={20} />}
        onClose={onClose}
        footer={footer}
        width="max-w-2xl"
      >
        {content}
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalCargaMasivaMovimientos;
