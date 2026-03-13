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
  DesplegadorIcono,
  MovimientoIcono
} from "../../../assets/Icons";

const ModalProduccion = ({ open, onClose, articulo, isStandalone = false, onSuccess }) => {
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
    if (open || isStandalone) {
      setFormData({
        cantidadProducida: "",
        observacion: `Producción ${articulo?.nombre || ""}`,
        insumos: [],
      });
      setNuevoInsumo({ codigoMateriaPrima: "", cantidad: "" });
      setErrorStock(null);
    }
  }, [open, isStandalone, articulo]);

  if ((!open && !isStandalone) || !articulo) return null;

  // Lógica para calcular el stock disponible real restando lo que ya está en la lista
  const getStockDisponibleReal = (codigoMP) => {
    const mp = materiasPrimas.find(m => m.codigoSecuencial === Number(codigoMP));
    if (!mp) return 0;

    const consumidoEnLista = formData.insumos
      .filter(i => i.codigoMateriaPrima === Number(codigoMP))
      .reduce((sum, i) => sum + parseFloat(i.cantidad || 0), 0);

    return Math.max(0, (mp.stock || 0) - consumidoEnLista);
  };

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
    const stockDisponibleReal = getStockDisponibleReal(nuevoInsumo.codigoMateriaPrima);

    if (cantidadRequerida > stockDisponibleReal) {
      return;
    }

    // Evitar duplicados, sumar si ya existe
    const existe = formData.insumos.findIndex(i => i.codigoMateriaPrima === mp.codigoSecuencial);

    if (existe >= 0) {
      const nuevosInsumos = [...formData.insumos];
      const nuevaCantidad = parseFloat(nuevosInsumos[existe].cantidad) + cantidadRequerida;

      // Validar también al sumar a un existente
      if (nuevaCantidad > mp.stock) return;

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

    crearProduccion(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        if (!isStandalone) onClose();
        else {
          setFormData({
            cantidadProducida: "",
            observacion: `Producción ${articulo?.nombre || ""}`,
            insumos: [],
          });
        }
      },
      onError: (error) => {
        const mensaje = error.response?.data?.message;
        const errorMsg = Array.isArray(mensaje) ? mensaje[0] : mensaje;
        const parsed = parseErrorStock(errorMsg);
        if (parsed) {
          setErrorStock(parsed);
        }
      }
    });
  };

  const mpSeleccionada = materiasPrimas.find(m => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima));
  const stockDisponibleReal = nuevoInsumo.codigoMateriaPrima ? getStockDisponibleReal(nuevoInsumo.codigoMateriaPrima) : 0;
  const excedeStock = nuevoInsumo.cantidad && parseFloat(nuevoInsumo.cantidad) > stockDisponibleReal;

  const content = (
    <div className={`${isStandalone ? "bg-transparent! rounded-md! overflow-hidden!" : "flex flex-col h-full md:h-auto md:max-h-[90vh]"}`}>
      {/* Header - Conditional for Standalone */}
      {!isStandalone && (
        <div className="p-3 flex justify-between items-center border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-600/10 p-1.5 rounded-md! border border-purple-500/20 text-purple-500 shadow-inner">
              <ProduccionIcono size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight uppercase">Producción</h3>
              <p className="text-white/30 text-[8px] uppercase font-black tracking-[0.2em]">Gestión de Lotes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/20 hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-md! transition-all active:scale-90"
          >
            <CerrarIcono size={16} />
          </button>
        </div>
      )}

      <div className={`${!isStandalone ? "overflow-y-auto custom-scrollbar flex-1" : ""}`}>
        <div className={`${isStandalone ? "p-3" : "p-5 md:p-6"} space-y-5`}>

          {/* Step 1: Batch Details */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-1.5 opacity-50">
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-md! bg-purple-600 text-[8px] font-black text-white">1</span>
              <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Detalles del Lote</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Info Card - Elegant & Compact */}
              <div className="bg-zinc-900/30 border border-white/5 rounded-md! p-3 relative overflow-hidden group">
                <div className="relative z-10 space-y-2.5">
                  <div>
                    <div className="text-[7px] text-white/20 font-black uppercase tracking-widest mb-0.5">Producto Base</div>
                    <div className="text-sm font-bold text-white tracking-tight uppercase line-clamp-1">{articulo.nombre}</div>
                    <div className="text-[7px] text-purple-500/60 font-black mt-0.5 tracking-tighter font-mono uppercase">CODE: #{articulo.codigoSecuencial}</div>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[7px] text-white/20 font-black uppercase tracking-widest mb-0.5">Inventario Actual</div>
                    <div className="text-xs font-black text-white/90">
                      {articulo.stock || 0}
                      <span className="text-[8px] font-normal text-white/30 ml-1.5">{articulo.unidadMedida}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-1">Cant. Producir</label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="w-full bg-black/40 border border-white/10 rounded-md! py-2 px-3 text-white focus:outline-none focus:border-purple-500/40 transition-all text-xs font-bold placeholder:text-white/5"
                      value={formData.cantidadProducida}
                      onChange={(e) => setFormData({ ...formData, cantidadProducida: e.target.value })}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-black text-white/10 uppercase tracking-widest pointer-events-none font-mono">
                      UNIT
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-1">Observación</label>
                  <input
                    placeholder="Ref. producción..."
                    className="w-full bg-black/40 border border-white/10 rounded-md! py-2 px-3 text-white focus:outline-none focus:border-purple-500/40 transition-all text-[10px] font-medium placeholder:text-white/5"
                    value={formData.observacion}
                    onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Consumption */}
          <section className="space-y-4 pt-1">
            <div className="flex items-center gap-2 mb-1.5 opacity-50">
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-md! bg-purple-600 text-[8px] font-black text-white">2</span>
              <h4 className="text-[9px] font-black text-white uppercase tracking-widest">Insumos Requeridos</h4>
            </div>

            <div className="bg-zinc-900/10 border border-white/5 rounded-md! p-3 space-y-3">

              {/* Add Insumo Flow */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <select
                    className="w-full bg-black/60 border border-white/10 rounded-md! py-2 px-3 text-white text-[10px] focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                    value={nuevoInsumo.codigoMateriaPrima}
                    onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, codigoMateriaPrima: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">Seleccionar Insumo...</option>
                    {materiasPrimas.map(mp => (
                      <option key={mp.codigoSecuencial} value={mp.codigoSecuencial} className="bg-[#0a0a0a]">
                        {mp.nombre} ({mp.unidadMedida})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <DesplegadorIcono size={10} />
                  </div>
                </div>

                <div className="flex gap-1.5 overflow-hidden">
                  <div className="relative w-full sm:w-20">
                    <input
                      type="number"
                      placeholder="Cant."
                      className={`w-full bg-black/60 border ${excedeStock ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white'} rounded-md! py-2 px-2 text-[10px] font-black focus:outline-none transition-all text-center placeholder:text-white/5`}
                      value={nuevoInsumo.cantidad}
                      onChange={(e) => setNuevoInsumo({ ...nuevoInsumo, cantidad: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!nuevoInsumo.codigoMateriaPrima || !nuevoInsumo.cantidad || excedeStock}
                    onClick={handleAgregarInsumo}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-20 text-white px-4 rounded-md! transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md"
                  >
                    <AgregarIcono size={16} />
                  </button>
                </div>
              </div>

              {/* REFINED REAL-TIME STOCK INDICATOR */}
              {nuevoInsumo.codigoMateriaPrima && (
                <div className="px-3 py-2 rounded-md! bg-black/40! border! border-white/5! flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${excedeStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Estatus de Material</span>
                    </div>
                    {excedeStock && (
                      <div className="flex items-center gap-1 text-red-500 font-bold animate-pulse">
                        <AdvertenciaIcono size={9} />
                        <span className="text-[7.5px] uppercase tracking-tighter">Inventario Insuficiente</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[7px] text-white/10 font-black uppercase tracking-widest leading-none font-mono">Stock Disponible</p>
                      <p className="text-[11px] font-black text-white/50 font-mono tracking-tighter">
                        {mpSeleccionada?.stock?.toFixed(1) || 0} <span className="text-[7px] font-normal opacity-40 uppercase">{mpSeleccionada?.unidadMedida}</span>
                      </p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div className="text-right">
                        <p className="text-[7px] text-white/10 font-black uppercase tracking-widest leading-none font-mono">Restante</p>
                        <p className={`text-base font-black ${excedeStock ? 'text-red-500' : 'text-emerald-500'} font-mono leading-none tracking-tighter`}>
                          {(stockDisponibleReal - (parseFloat(nuevoInsumo.cantidad) || 0)).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Style Indicator - Slimmer */}
                  <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${excedeStock ? 'bg-red-500' : 'bg-emerald-500/30'}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, ((stockDisponibleReal - (parseFloat(nuevoInsumo.cantidad) || 0)) / (mpSeleccionada?.stock || 1)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* List - Minimalist & Delicate */}
              <div className="bg-black/20 rounded-md! border border-white/5 overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-3 py-2 bg-white/10 border-b border-white/5">
                  <div className="col-span-6 text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Insumo</div>
                  <div className="col-span-3 text-[7px] font-black text-white/20 uppercase tracking-[0.2em] text-center">Cant.</div>
                  <div className="col-span-3 text-[7px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Saldo</div>
                </div>

                <div className="max-h-[160px] overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {formData.insumos.length === 0 ? (
                    <div className="p-6 flex flex-col items-center justify-center text-center opacity-10">
                      <MovimientoIcono size={28} className="mb-1" />
                      <p className="text-[8px] uppercase font-black tracking-widest italic">Cargar materiales</p>
                    </div>
                  ) : (
                    formData.insumos.map((i) => {
                      const mpRef = materiasPrimas.find(m => m.codigoSecuencial === i.codigoMateriaPrima);
                      const stockFinal = (mpRef?.stock || 0) - parseFloat(i.cantidad);

                      return (
                        <div key={i.codigoMateriaPrima} className="flex flex-col sm:grid sm:grid-cols-12 gap-1.5 sm:gap-4 px-3 py-2 hover:bg-white/[0.02] transition-colors items-center group">
                          <div className="col-span-6 w-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/20" />
                            <div className="text-[10px] font-bold text-white uppercase line-clamp-1">{i.nombre}</div>
                          </div>
                          <div className="col-span-3 w-full sm:text-center flex items-center sm:justify-center gap-1">
                            <span className="text-purple-400 font-black text-xs">{i.cantidad}</span>
                            <span className="text-[8px] font-bold text-white/10 uppercase font-mono">{i.unidad}</span>
                          </div>
                          <div className="col-span-3 w-full flex items-center justify-between sm:justify-end gap-2">
                            <span className={`text-[10px] font-mono font-black ${stockFinal < 0 ? 'text-red-500' : 'text-white/20'}`}>
                              {stockFinal.toFixed(1)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEliminarInsumo(i.codigoMateriaPrima)}
                              className="p-1 rounded-md! bg-red-500/10! hover:bg-red-500/20! text-red-500/40! hover:text-red-500! transition-all! border border-white/5 opacity-0 group-hover:opacity-100"
                            >
                              <BorrarIcono size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Error UI */}
          {errorStock && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-md! p-3 flex gap-3 items-start animate-in slide-in-from-top-2 shadow-lg">
              <div className="p-1 bg-red-500/20 rounded-md! text-red-500 shrink-0">
                <AdvertenciaIcono size={14} />
              </div>
              <div className="flex-1">
                <h5 className="text-red-500 font-black text-[8px] uppercase tracking-widest mb-0.5">Alerta de Stock</h5>
                <p className="text-white/50 text-[10px] leading-tight line-clamp-2">
                  Stock insuficiente para <span className="text-white font-bold">{errorStock.materiaPrima}</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Final Action */}
      <div className={`${isStandalone ? "p-3 bg-black/10" : "p-4 md:p-5 bg-[#0a0a0a]"} border-t border-white/5 flex flex-col sm:flex-row gap-2 shrink-0`}>
        {!isStandalone && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 bg-white/5 hover:bg-white/10 border border-white/5 text-white/30 hover:text-white font-black py-2.5 rounded-md! transition-all text-[9px] uppercase tracking-widest active:scale-95"
          >
            Cerrar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isPending || !formData.cantidadProducida || formData.insumos.length === 0}
          className={`${isStandalone ? "flex-1" : "flex-[2]"} order-1 sm:order-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-20 disabled:cursor-not-allowed text-white font-black py-2.5 rounded-md! transition-all text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-lg active:scale-95`}
        >
          {isPending ? (
            <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckIcono size={14} />
              Registrar Lote
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4 bg-black/20 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[var(--surface-active)] border md:border-white/10 w-full max-w-xl md:rounded-md! shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {content}
      </div>
    </div>
  );
};

export default ModalProduccion;
