import { useState, useEffect } from "react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearProduccion } from "../../../Backend/Articulos/queries/Produccion/useCrearProduccion.mutation";
import { useObtenerMateriasPrimas } from "../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import { 
  ProduccionIcono, 
  CerrarIcono,
  CheckIcono,
  AdvertenciaIcono,
  AgregarIcono,
  BorrarIcono,
  DesplegadorIcono
} from "../../../assets/Icons";

const ModalProduccion = ({ open, onClose, articulo }) => {
  const { usuario } = useAuthStore();
  const { mutate: crearProduccion, isPending } = useCrearProduccion();
  
  // Fetch materias primas para la seleccion de insumos
  const { data: materiasPrimas = [] } = useObtenerMateriasPrimas();
  
  const [formData, setFormData] = useState({
    cantidadProducida: "",
    observacion: "",
    insumos: [], // [{ codigoMateriaPrima, cantidad, nombre, unidad }]
  });

  // State local para el insumo que se esta agregando
  const [nuevoInsumo, setNuevoInsumo] = useState({
    codigoMateriaPrima: "",
    cantidad: "",
  });

  const [errorStock, setErrorStock] = useState(null);

  // Reset form when modal opens with a new article
  useEffect(() => {
    if (open) {
      setFormData({
        cantidadProducida: "",
        observacion: `Producción ${articulo?.nombre || ""}`,
        insumos: [],
      });
      setNuevoInsumo({ codigoMateriaPrima: "", cantidad: "" });
      setErrorStock(null);
    }
  }, [open, articulo]);

  if (!open || !articulo) return null;

  const parseErrorStock = (msg) => {
    if (!msg || typeof msg !== "string") return null;
    if (!msg.includes("Stock insuficiente")) return null;

    try {
      const materiaPrima = msg.match(/'(.*?)'/)?.[1] || "Materia Prima";
      const actual = parseFloat(msg.match(/actual: (\d+)/)?.[1]) || 0;
      const necesario = parseFloat(msg.match(/Necesario: (\d+)/)?.[1]) || 0;
      
      return {
        materiaPrima,
        actual,
        necesario,
        faltante: necesario - actual
      };
    } catch (e) {
      return null;
    }
  };

  const handleAgregarInsumo = () => {
    if (!nuevoInsumo.codigoMateriaPrima || !nuevoInsumo.cantidad) return;

    const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
    if (!mp) return;

    const cantidadRequerida = parseFloat(nuevoInsumo.cantidad);
    const stockDisponible = mp.stock || 0;

    if (cantidadRequerida > stockDisponible) {
      // Opcional: podrías poner una alerta aquí o manejarlo con el estado visual
      return; 
    }

    // Evitar duplicados, sumar si ya existe
    const existe = formData.insumos.findIndex(i => i.codigoMateriaPrima === mp.codigoSecuencial);
    
    if (existe >= 0) {
      const nuevosInsumos = [...formData.insumos];
      const nuevaCantidad = parseFloat(nuevosInsumos[existe].cantidad) + cantidadRequerida;
      
      // Validar también al sumar a un existente
      if (nuevaCantidad > stockDisponible) return;

      nuevosInsumos[existe].cantidad = nuevaCantidad.toString();
      setFormData({ ...formData, insumos: nuevosInsumos });
    } else {
      setFormData({
        ...formData,
        insumos: [...formData.insumos, {
          codigoMateriaPrima: mp.codigoSecuencial,
          nombre: mp.nombre,
          unidad: mp.unidadMedida,
          cantidad: nuevoInsumo.cantidad
        }]
      });
    }

    setNuevoInsumo({ codigoMateriaPrima: "", cantidad: "" });
  };

  const handleEliminarInsumo = (codigo) => {
    setFormData({
      ...formData,
      insumos: formData.insumos.filter(i => i.codigoMateriaPrima !== codigo)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorStock(null);
    
    const payload = {
      codigoProducto: Number(articulo.codigoSecuencial),
      cantidadProducida: parseFloat(formData.cantidadProducida),
      codigoUsuario: usuario?.codigoUsuario || usuario?.id || 1,
      nombreUsuario: usuario?.nombre || "Usuario",
      observacion: formData.observacion,
      insumos: formData.insumos.map(i => ({
        codigoMateriaPrima: Number(i.codigoMateriaPrima),
        cantidad: parseFloat(i.cantidad)
      }))
    };

    console.log("Enviando producción con insumos:", payload);

    crearProduccion(payload, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
        console.error("Error en producción:", error);
        const mensaje = error.response?.data?.message;
        const errorMsg = Array.isArray(mensaje) ? mensaje[0] : mensaje;
        const parsed = parseErrorStock(errorMsg);
        if (parsed) {
          setErrorStock(parsed);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--surface-active)] border-y md:border border-white/10 w-full max-w-2xl md:rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-full md:h-auto md:max-h-[90vh]">
        
        {/* Header - More Formal */}
        <div className="p-5 flex justify-between items-center border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600/10 p-2.5 rounded-lg border border-purple-500/20 text-purple-500 shadow-inner">
              <ProduccionIcono size={22} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight">Registro de Producción</h3>
              <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em]">Gestión de Lotes e Insumos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/20 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all active:scale-90"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-5 md:p-8 space-y-8">
            
            {/* Step 1: Batch Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-[10px] font-black text-white">1</span>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Detalles del Lote</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Info Card - Elegant */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 bg-purple-600/5 rounded-full -mr-4 -mt-4 blur-2xl group-hover:bg-purple-600/10 transition-colors" />
                  <div className="relative z-10 space-y-4">
                    <div>
                      <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Producto Base</div>
                      <div className="text-xl font-bold text-white tracking-tight leading-tight">{articulo.nombre}</div>
                      <div className="text-[10px] text-purple-500/60 font-black mt-1 tracking-tighter">SKU: #{articulo.codigoSecuencial}</div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-end">
                      <div>
                        <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-0.5">Disponibilidad Actual</div>
                        <div className="text-lg font-black text-white/90">
                          {articulo.stock || 0}
                          <span className="text-[10px] font-normal text-white/30 ml-1.5">{articulo.unidadMedida}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Inputs */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Cantidad Producida</label>
                    <div className="relative">
                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all text-base font-bold placeholder:text-white/10"
                        value={formData.cantidadProducida}
                        onChange={(e) => setFormData({ ...formData, cantidadProducida: e.target.value })}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-white/20 uppercase tracking-widest pointer-events-none">
                        FRASCOS
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Observaciones</label>
                    <textarea
                      rows="2"
                      placeholder="Ej: Lote de producción artesanal..."
                      className="w-full bg-zinc-900/80 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all text-sm font-medium resize-none placeholder:text-white/10"
                      value={formData.observacion}
                      onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Consumption */}
            <section className="space-y-6 pt-2">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-[10px] font-black text-white">2</span>
                <h4 className="text-xs font-black text-white/40 uppercase tracking-widest">Consumo de Insumos</h4>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4 md:p-6 space-y-6">
                
                {/* Add Insumo Flow - More Intuitive */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                      value={nuevoInsumo.codigoMateriaPrima}
                      onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, codigoMateriaPrima: e.target.value })}
                    >
                      <option value="" disabled className="bg-[#0a0a0a]">Seleccionar Materia Prima...</option>
                      {materiasPrimas.map(mp => (
                        <option key={mp.codigoSecuencial} value={mp.codigoSecuencial} className="bg-[#0a0a0a]">
                          {mp.nombre} ({mp.unidadMedida})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                      <DesplegadorIcono size={14} />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative w-full sm:w-32">
                      <input
                        type="number"
                        placeholder="Cant."
                        className={`w-full h-full bg-black/40 border ${
                          (() => {
                            const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
                            return mp && parseFloat(nuevoInsumo.cantidad) > mp.stock ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white'
                          })()
                        } rounded-xl py-3.5 px-4 text-sm font-black focus:outline-none focus:border-purple-500/40 transition-all text-center placeholder:text-white/10`}
                        value={nuevoInsumo.cantidad}
                        onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, cantidad: e.target.value })}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={(() => {
                        const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
                        return !nuevoInsumo.codigoMateriaPrima || !nuevoInsumo.cantidad || (mp && parseFloat(nuevoInsumo.cantidad) > mp.stock);
                      })()}
                      onClick={handleAgregarInsumo}
                      className="bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-white/10 text-white px-5 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/10"
                    >
                      <AgregarIcono size={20} />
                    </button>
                  </div>
                </div>

                {/* Real-time Indicator */}
                {nuevoInsumo.codigoMateriaPrima && (
                  <div className="px-1 flex items-center justify-between animate-in fade-in slide-in-from-left-2 transition-all">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        (() => {
                          const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
                          return mp && parseFloat(nuevoInsumo.cantidad) > mp.stock ? 'bg-red-500 animate-pulse' : 'bg-purple-500'
                        })()
                      }`} />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                        Stock Disp: {materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima))?.stock || 0}
                      </span>
                    </div>
                    {(() => {
                      const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
                      return mp && parseFloat(nuevoInsumo.cantidad) > mp.stock && (
                        <div className="flex items-center gap-1.5 text-red-500 font-black animate-pulse">
                          <AdvertenciaIcono size={12} />
                          <span className="text-[9px] uppercase tracking-tighter">Excede disponibilidad</span>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* List - Professional Table Look */}
                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-white/5 border-b border-white/5">
                    <div className="col-span-7 text-[9px] font-black text-white/20 uppercase tracking-widest">Insumo</div>
                    <div className="col-span-3 text-[9px] font-black text-white/20 uppercase tracking-widest text-right">Cantidad</div>
                    <div className="col-span-2"></div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    {formData.insumos.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-center text-[var(--text-theme)]/20">
                          <ProduccionIcono size={40} className="mb-4"/>
                          <p className="text-xs font-medium italic">Esperando selección de materiales...</p>
                        </div>
                    ) : (
                      formData.insumos.map((i) => (
                        <div key={i.codigoMateriaPrima} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 p-4 sm:px-5 sm:py-3 hover:bg-white/[0.02] transition-colors items-center group">
                          <div className="col-span-7 w-full flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-white/20 border border-white/5">
                                #{i.codigoMateriaPrima}
                            </div>
                            <div className="font-bold text-white text-sm">{i.nombre}</div>
                          </div>
                          <div className="col-span-3 w-full sm:text-right flex items-center sm:justify-end gap-2 px-11 sm:px-0">
                            <span className="text-purple-400 font-black text-base">{i.cantidad}</span>
                            <span className="text-[10px] font-black text-white/20 uppercase">{i.unidad}</span>
                          </div>
                          <div className="col-span-2 w-full flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleEliminarInsumo(i.codigoMateriaPrima)}
                              className="w-full sm:w-auto p-2.5 rounded-md! bg-red-500/20! hover:bg-red-500/30! text-red-500/40! hover:text-red-500! transition-all! flex items-center justify-center sm:opacity-0 group-hover:opacity-100! border border-white/5"
                            >
                              <BorrarIcono size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Error UI */}
            {errorStock && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex gap-4 items-start animate-in slide-in-from-top-4">
                <div className="p-2 bg-red-500/20 rounded-lg text-red-500 shrink-0">
                  <AdvertenciaIcono size={20} />
                </div>
                <div>
                  <h5 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-1">Conflicto de Inventario</h5>
                  <p className="text-white/60 text-xs leading-relaxed">
                    No es posible completar el proceso. Se requieren <span className="text-white font-bold">{errorStock.necesario}</span> unidades de <span className="text-white font-bold">{errorStock.materiaPrima}</span> y solo dispone de <span className="text-red-400 font-black underline">{errorStock.actual}</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - More Premium */}
        <div className="p-5 md:p-6 bg-[#0a0a0a] border-t border-white/5 flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold py-4 rounded-xl transition-all text-xs uppercase tracking-widest active:scale-95"
          >
            Cancelar trámite
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !formData.cantidadProducida || formData.insumos.length === 0}
            className="flex-[2] order-1 sm:order-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-purple-900/10 active:scale-95"
          >
            {isPending ? (
              <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckIcono size={18} />
                Finalizar Producción
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export default ModalProduccion;
