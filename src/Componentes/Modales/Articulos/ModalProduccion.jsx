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
  MovimientoIcono,
} from "../../../assets/Icons";
import { Layers } from "lucide-react";

const ModalProduccion = ({
  open,
  onClose,
  articulo,
  isStandalone = false,
  onSuccess,
}) => {
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
    const mp = materiasPrimas.find(
      (m) => m.codigoSecuencial === Number(codigoMP),
    );
    if (!mp) return 0;

    const consumidoEnLista = formData.insumos
      .filter((i) => i.codigoMateriaPrima === Number(codigoMP))
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
        faltante: necesario - actual,
      };
    } catch (e) {
      return null;
    }
  };

  const handleAgregarInsumo = () => {
    if (!nuevoInsumo.codigoMateriaPrima || !nuevoInsumo.cantidad) return;

    const mp = materiasPrimas.find(
      (m) => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima),
    );
    if (!mp) return;

    const cantidadRequerida = parseFloat(nuevoInsumo.cantidad);
    const stockDisponibleReal = getStockDisponibleReal(
      nuevoInsumo.codigoMateriaPrima,
    );

    if (cantidadRequerida > stockDisponibleReal) {
      return;
    }

    // Evitar duplicados, sumar si ya existe
    const existe = formData.insumos.findIndex(
      (i) => i.codigoMateriaPrima === mp.codigoSecuencial,
    );

    if (existe >= 0) {
      const nuevosInsumos = [...formData.insumos];
      const nuevaCantidad =
        parseFloat(nuevosInsumos[existe].cantidad) + cantidadRequerida;

      // Validar también al sumar a un existente
      if (nuevaCantidad > mp.stock) return;

      nuevosInsumos[existe].cantidad = nuevaCantidad.toString();
      setFormData({ ...formData, insumos: nuevosInsumos });
    } else {
      setFormData({
        ...formData,
        insumos: [
          ...formData.insumos,
          {
            codigoMateriaPrima: mp.codigoSecuencial,
            nombre: mp.nombre,
            unidad: mp.unidadMedida,
            cantidad: nuevoInsumo.cantidad,
          },
        ],
      });
    }

    setNuevoInsumo({ codigoMateriaPrima: "", cantidad: "" });
  };

  const handleEliminarInsumo = (codigo) => {
    setFormData({
      ...formData,
      insumos: formData.insumos.filter((i) => i.codigoMateriaPrima !== codigo),
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
      insumos: formData.insumos.map((i) => ({
        codigoMateriaPrima: Number(i.codigoMateriaPrima),
        cantidad: parseFloat(i.cantidad),
      })),
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
      },
    });
  };

  const mpSeleccionada = materiasPrimas.find(
    (m) => m.codigoSecuencial === Number(nuevoInsumo.codigoMateriaPrima),
  );
  const stockDisponibleReal = nuevoInsumo.codigoMateriaPrima
    ? getStockDisponibleReal(nuevoInsumo.codigoMateriaPrima)
    : 0;
  const excedeStock =
    nuevoInsumo.cantidad &&
    parseFloat(nuevoInsumo.cantidad) > stockDisponibleReal;

  const content = (
    <div
      className={`${isStandalone ? "bg-transparent! rounded-md! overflow-hidden!" : "flex flex-col h-full md:h-auto md:max-h-[90vh]"}`}
    >
      {/* Header - Conditional for Standalone */}
      {!isStandalone && (
        <div className="p-3 flex justify-between items-center border-b border-black/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-purple-600/10 p-1.5 rounded-md! border border-purple-700/20 text-purple-700 shadow-inner">
              <ProduccionIcono size={18} />
            </div>
            <div>
              <h3 className="text-black font-bold text-sm tracking-tight uppercase">
                Producción
              </h3>
              <p className="text-black/85 text-[10px] uppercase font-black tracking-[0.2em]">
                Gestión de Lotes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black/85 hover:text-black bg-black/5 hover:bg-black/10 p-1 rounded-md!  active:scale-90"
          >
            <CerrarIcono size={16} />
          </button>
        </div>
      )}

      <div
        className={`${!isStandalone ? "overflow-y-auto custom-scrollbar flex-1" : ""}`}
      >
        <div className={`${isStandalone ? "p-3" : "p-5 md:p-6"} space-y-5`}>
          {/* Step 1: Batch Details */}
          <section className="space-y-4    ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 opacity-80">
                <span className="flex items-center justify-center w-5 h-5 rounded-md! bg-purple-600/20 text-purple-400 text-[12px] font-black border border-purple-700/20">
                  01
                </span>
                <h4 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">
                  Configuración de Lote
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Product Insight Card - Premium Glassmorphism */}
              <div className="md:col-span-5 bg-white/[0.03] border border-black/10 rounded-md p-4 relative overflow-hidden group hover:border-purple-700/30   shadow-2xl shadow-purple-700/5">
                <div className="absolute top-0 right-0 p-8 bg-purple-600/10 blur-[60px] rounded-full -mr-10 -mt-10 group-hover:bg-purple-600/20  " />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-700 " />
                      <span className="text-[10px] text-black/85 font-black uppercase tracking-[0.2em]">
                        Producto Base
                      </span>
                    </div>
                    <div className="text-base font-bold text-black tracking-tight uppercase leading-tight">
                      {articulo.nombre}
                    </div>
                    <div className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/5 border border-black/5 text-[11px] font-mono font-black text-purple-400/80 uppercase mt-1 tracking-tighter">
                      SKU: #
                      {articulo.codigoSecuencial?.toString().padStart(4, "0")}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-black/85 font-black uppercase tracking-[0.2em] mb-1">
                        Stock Disponible
                      </div>
                      <div className="text-lg font-black text-black flex items-baseline gap-1">
                        {articulo.stock || 0}
                        <span className="text-[12px] font-bold text-black/85 lowercase font-sans">
                          {articulo.unidadMedida}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-md bg-black/5 border border-black/5 flex items-center justify-center text-black/85 group-hover:text-purple-700/50 ">
                      <ProduccionIcono size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Inputs */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-black/20 border border-black/5 rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-black/85 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-purple-700" />
                      Cantidad a Producir
                    </label>
                    <div className="relative group/input">
                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full bg-black/40 border border-black/10 group-focus-within/input:border-purple-700/40 rounded-md py-3 px-4 text-sm font-black text-black focus:outline-none  placeholder:text-black/5 pr-16"
                        value={formData.cantidadProducida}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cantidadProducida: e.target.value,
                          })
                        }
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-black/5 border border-black/5 text-[10px] font-black text-black/85 uppercase tracking-widest font-mono">
                        {articulo.unidadMedida || "UNIT"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-black/85 uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-black/20" />
                      Observación / Referencia
                    </label>
                    <input
                      placeholder="Escriba una nota para este lote..."
                      className="w-full bg-black/40 border border-black/10 focus:border-purple-700/20 rounded-md py-2.5 px-4 text-[13px] font-medium text-black/70 focus:outline-none  placeholder:text-black/5"
                      value={formData.observacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observacion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Consumption */}
          <section className="space-y-4 pt-2     delay-150">
            <div className="flex items-center gap-2 opacity-80">
              <span className="flex items-center justify-center w-5 h-5 rounded-md! bg-purple-600/20 text-purple-400 text-[12px] font-black border border-purple-700/20">
                02
              </span>
              <h4 className="text-[12px] font-black text-black uppercase tracking-[0.2em]">
                Desglose de Materia Prima
              </h4>
            </div>

            <div className="bg-zinc-900/20 border border-black/5 rounded-md p-5 space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/[0.02] to-transparent pointer-events-none" />

              {/* Add Insumo Header-style UI */}
              <div className="relative flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/85 group-focus-within:text-purple-700  pointer-events-none">
                    <Layers size={14} />
                  </div>
                  <select
                    className="w-full bg-black/20 border border-black/10 rounded-md! py-3 pl-10 pr-10 text-black text-[13px] font-bold focus:outline-none focus:border-purple-700/40  appearance-none cursor-pointer shadow-inner"
                    value={nuevoInsumo.codigoMateriaPrima}
                    onChange={(e) =>
                      setNuevoInsumo({
                        ...nuevoInsumo,
                        codigoMateriaPrima: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">
                      Seleccionar Insumo...
                    </option>
                    {materiasPrimas.map((mp) => (
                      <option
                        key={mp.codigoSecuencial}
                        value={mp.codigoSecuencial}
                        className="bg-[#0a0a0a]"
                      >
                        {mp.nombre} ({mp.unidadMedida})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/85">
                    <DesplegadorIcono size={12} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-full md:w-28 group">
                    <input
                      type="number"
                      placeholder="0.0"
                      className={`w-full bg-black/20 border ${excedeStock ? "border-red-700/50 text-red-400" : "border-black/10 group-focus-within:border-purple-700/40 text-black"} rounded-md! py-3 px-4 text-sm font-black focus:outline-none  text-center placeholder:text-black/5 shadow-inner`}
                      value={nuevoInsumo.cantidad}
                      onChange={(e) =>
                        setNuevoInsumo({
                          ...nuevoInsumo,
                          cantidad: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    disabled={
                      !nuevoInsumo.codigoMateriaPrima ||
                      !nuevoInsumo.cantidad ||
                      excedeStock
                    }
                    onClick={handleAgregarInsumo}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-20 disabled:grayscale text-black px-6 rounded-md!  active:scale-95 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/20"
                  >
                    <AgregarIcono size={18} />
                  </button>
                </div>
              </div>

              {/* REFINED REAL-TIME STOCK INDICATOR - Glassy & High Info Density */}
              {nuevoInsumo.codigoMateriaPrima && (
                <div className="relative px-4 py-3 rounded-md bg-white/[0.02] border border-black/10 flex flex-col gap-3    ">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${excedeStock ? "bg-red-700 " : "bg-emerald-700"}`}
                      />
                      <span className="text-[11px] font-black text-black/85 uppercase tracking-[0.2em]">
                        Estatus de Disponibilidad
                      </span>
                    </div>
                    {excedeStock ? (
                      <div className="px-2 py-0.5 bg-red-700/10 border border-red-700/20 rounded text-red-700  flex items-center gap-1.5">
                        <AdvertenciaIcono size={10} />
                        <span className="text-[10px] font-black uppercase tracking-tight">
                          Inventario Insuficiente
                        </span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 bg-emerald-700/10 border border-emerald-700/20 rounded text-emerald-700 flex items-center gap-1.5">
                        <CheckIcono size={10} />
                        <span className="text-[10px] font-black uppercase tracking-tight">
                          Stock Verificado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] text-black/85 font-black uppercase tracking-widest leading-none font-mono">
                        Stock en Almacén
                      </p>
                      <p className="text-sm font-black text-black/70 font-mono tracking-tighter">
                        {mpSeleccionada?.stock?.toFixed(2) || 0}{" "}
                        <span className="text-[11px] font-normal opacity-40 uppercase">
                          {mpSeleccionada?.unidadMedida}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-baseline gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-black/85 font-black uppercase tracking-widest leading-none font-mono">
                          Restante Proyectado
                        </p>
                        <p
                          className={`text-xl font-black ${excedeStock ? "text-red-700" : "text-emerald-400"} font-mono leading-none tracking-tighter mt-1`}
                        >
                          {(
                            stockDisponibleReal -
                            (parseFloat(nuevoInsumo.cantidad) || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-1.5 w-full bg-black/5 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full    shadow-[0_0_10px_rgba(168,85,247,0.3)] ${excedeStock ? "bg-red-700" : "bg-gradient-to-r from-purple-600 to-purple-400"}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, ((stockDisponibleReal - (parseFloat(nuevoInsumo.cantidad) || 0)) / (mpSeleccionada?.stock || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* List - Minimalist & Delicate */}
              <div className="bg-black/40 rounded-md border border-black/5 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.03] border-b border-black/5">
                  <div className="col-span-6 text-[10px] font-black text-black/85 uppercase tracking-[0.2em]">
                    Insumo Seleccionado
                  </div>
                  <div className="col-span-3 text-[10px] font-black text-black/85 uppercase tracking-[0.2em] text-center">
                    Consumo
                  </div>
                  <div className="col-span-3 text-[10px] font-black text-black/85 uppercase tracking-[0.2em] text-right">
                    Saldo Final
                  </div>
                </div>

                <div className="max-h-[220px] overflow-y-auto custom-scrollbar divide-y divide-white/[0.03]">
                  {formData.insumos.length === 0 ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-dashed border-black/10 flex items-center justify-center mb-4 text-black/5 ">
                        <MovimientoIcono size={24} />
                      </div>
                      <p className="text-[12px] uppercase font-black tracking-[0.3em] text-black/10 italic">
                        Sin materiales agregados
                      </p>
                    </div>
                  ) : (
                    formData.insumos.map((i, index) => {
                      const mpRef = materiasPrimas.find(
                        (m) => m.codigoSecuencial === i.codigoMateriaPrima,
                      );
                      const stockFinal =
                        (mpRef?.stock || 0) - parseFloat(i.cantidad);
                      const isLast = index === formData.insumos.length - 1;

                      return (
                        <div
                          key={i.codigoMateriaPrima}
                          className={`grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-white/[0.02]  items-center group    `}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-purple-600/5 border border-purple-700/10 flex items-center justify-center text-purple-400  ">
                              <span className="text-[12px] font-black">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-black uppercase tracking-tight line-clamp-1">
                                {i.nombre}
                              </div>
                              <div className="text-[10px] font-black text-black/85 uppercase tracking-widest">
                                Insumo Base
                              </div>
                            </div>
                          </div>

                          <div className="col-span-3 text-center flex flex-col items-center">
                            <span className="text-purple-400 font-black text-xs leading-none">
                              {i.cantidad}
                            </span>
                            <span className="text-[10px] font-bold text-black/20 uppercase font-mono mt-1">
                              {i.unidad}
                            </span>
                          </div>

                          <div className="col-span-3 flex items-center justify-end gap-3">
                            <div className="text-right">
                              <div
                                className={`text-[13px] font-mono font-black leading-none ${stockFinal < 0 ? "text-red-700" : "text-black/40"}`}
                              >
                                {stockFinal.toFixed(2)}
                              </div>
                              <div className="text-[9px] font-black text-black/85 uppercase tracking-widest mt-1">
                                Estimado
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminarInsumo(i.codigoMateriaPrima)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-red-700/5 hover:bg-red-700/20 text-red-700/20 hover:text-red-700  border border-black/5 group-hover:opacity-100 sm:opacity-0"
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

          {/* Error UI - Premium Alert */}
          {errorStock && (
            <div className="bg-red-700/5 border border-red-700/20 rounded-md p-4 flex gap-4 items-center   shadow-2xl shadow-red-700/5">
              <div className="w-10 h-10 bg-red-700/10 rounded-md text-red-700 shrink-0 flex items-center justify-center border border-red-700/20">
                <AdvertenciaIcono size={20} />
              </div>
              <div className="flex-1">
                <h5 className="text-red-700 font-black text-[11px] uppercase tracking-[0.2em] mb-0.5">
                  Fallo de Validación Operativa
                </h5>
                <p className="text-black/60 text-[13px] leading-tight font-medium">
                  Se requiere mayor disponibilidad para{" "}
                  <span className="text-black font-bold">
                    {errorStock.materiaPrima}
                  </span>
                  . Falta:{" "}
                  <span className="text-red-400 font-black">
                    {errorStock.faltante.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Final Action */}
      <div
        className={`${isStandalone ? "p-4 bg-black/20" : "p-5 md:p-6 bg-[#0a0a0a]"} border-t border-black/5 flex flex-col sm:flex-row gap-3 shrink-0`}
      >
        {!isStandalone && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 bg-black/5 hover:bg-black/10 border border-black/10 text-black/85 hover:text-black font-black py-3 rounded-md  text-[12px] uppercase tracking-[0.2em] active:scale-90"
          >
            Cancelar Operación
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={
            isPending ||
            !formData.cantidadProducida ||
            formData.insumos.length === 0
          }
          className={`${isStandalone ? "flex-1" : "flex-[2]"} order-1 sm:order-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed text-black font-black py-3 rounded-md  text-[12px] uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 shadow-xl shadow-purple-900/20 active:scale-95 group/submit`}
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-black/20 border-t-white rounded-full " />
          ) : (
            <>
              <CheckIcono size={16} className="group-hover/submit:scale-125 " />
              Finalizar Registro de Lote
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4 bg-black/20 backdrop-blur-md   ">
      <div className="bg-[var(--surface-active)] border md:border-black/10 w-full max-w-xl md:rounded-md! shadow-2xl overflow-hidden   ">
        {content}
      </div>
    </div>
  );
};

export default ModalProduccion;
