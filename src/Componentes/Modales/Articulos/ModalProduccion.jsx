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
      (m) => m.codigo === Number(codigoMP),
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
      (m) => m.codigo === Number(nuevoInsumo.codigoMateriaPrima),
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
      (i) => i.codigoMateriaPrima === mp.codigo,
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
            codigoMateriaPrima: mp.codigo,
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
      codigoProducto: Number(articulo.codigo),
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
    (m) => m.codigo === Number(nuevoInsumo.codigoMateriaPrima),
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
        <div className="p-4 md:p-5 flex justify-between items-center border-b border-[var(--color-neutral-border)] bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--color-brand-soft)] p-2 rounded-[10px] border border-[var(--color-brand-primary)]/20 text-[var(--color-brand-primary)] shadow-sm">
              <ProduccionIcono size={20} />
            </div>
            <div>
              <h3 className="text-[var(--color-neutral-text-main)] font-bold text-[15px] uppercase tracking-wide">
                Producción
              </h3>
              <p className="text-[var(--color-neutral-text-muted)] text-[11px] font-semibold uppercase tracking-widest mt-0.5">
                Gestión de Lotes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] bg-white hover:bg-gray-100 p-2 rounded-md border border-transparent hover:border-[var(--color-neutral-border)] transition-colors active:scale-95"
          >
            <CerrarIcono size={18} />
          </button>
        </div>
      )}

      <div
        className={`${!isStandalone ? "overflow-y-auto custom-scrollbar flex-1 bg-white" : ""}`}
      >
        <div className={`${isStandalone ? "p-3" : "p-5 md:p-6"} space-y-6`}>
          {/* Step 1: Batch Details */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-[8px] bg-[var(--color-brand-primary)] text-white text-[12px] font-bold shadow-sm">
                  1
                </span>
                <h4 className="text-[13px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
                  Configuración de Lote
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Product Insight Card - Premium Glassmorphism */}
              <div className="md:col-span-5 rounded-[12px] p-5 relative overflow-hidden border border-[var(--color-brand-primary)] bg-[var(--color-brand-soft)] shadow-sm">
                <div className="absolute top-0 right-0 p-8 bg-[var(--color-brand-primary)]/10 blur-[40px] rounded-full -mr-10 -mt-10" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)]" />
                      <span className="text-[11px] text-[var(--color-brand-primary)] font-bold uppercase tracking-wider">
                        Producto Base
                      </span>
                    </div>
                    <div className="text-[18px] font-bold text-[var(--color-neutral-text-main)] uppercase leading-tight">
                      {articulo.nombre}
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded-[6px] bg-white border border-[var(--color-neutral-border)] text-[12px] font-mono font-bold text-[var(--color-neutral-text-muted)] uppercase mt-2 shadow-sm">
                      SKU: #
                      {articulo.codigo?.toString().padStart(4, "0")}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--color-neutral-border)] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[var(--color-neutral-text-muted)] font-semibold uppercase tracking-wider mb-1">
                        Stock Disponible
                      </div>
                      <div className="text-[20px] font-bold text-[var(--color-neutral-text-main)] flex items-baseline gap-1">
                        {articulo.stock || 0}
                        <span className="text-[13px] font-medium text-[var(--color-neutral-text-muted)] lowercase font-sans">
                          {articulo.unidadMedida}
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-[10px] bg-white border border-[var(--color-neutral-border)] flex items-center justify-center text-[var(--color-brand-primary)] shadow-sm">
                      <ProduccionIcono size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Inputs */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-gray-50 border border-[var(--color-neutral-border)] rounded-[12px] p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide flex items-center gap-2">
                      Cantidad a Producir
                    </label>
                    <div className="relative group/input">
                      <input
                        required
                        type="number"
                        step="any"
                        placeholder="0.00"
                        className="w-full bg-white border border-[var(--color-neutral-border)] focus:border-[var(--color-brand-primary)] rounded-[8px] py-3 px-4 text-[15px] font-bold text-[var(--color-neutral-text-main)] focus:outline-none transition-colors shadow-sm pr-20"
                        value={formData.cantidadProducida}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cantidadProducida: e.target.value,
                          })
                        }
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-100 border border-[var(--color-neutral-border)] text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-widest font-mono">
                        {articulo.unidadMedida || "UNIT"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide flex items-center gap-2">
                      Observación / Referencia
                    </label>
                    <input
                      placeholder="Escriba una nota para este lote..."
                      className="w-full bg-white border border-[var(--color-neutral-border)] focus:border-[var(--color-brand-primary)] rounded-[8px] py-3 px-4 text-[14px] font-medium text-[var(--color-neutral-text-main)] focus:outline-none transition-colors shadow-sm"
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
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-[8px] bg-[var(--color-brand-primary)] text-white text-[12px] font-bold shadow-sm">
                2
              </span>
              <h4 className="text-[13px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-wide">
                Desglose de Materia Prima
              </h4>
            </div>

            <div className="bg-gray-50 border border-[var(--color-neutral-border)] rounded-[12px] p-5 space-y-4 relative overflow-hidden">

              {/* Add Insumo Header-style UI */}
              <div className="relative flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-text-muted)] pointer-events-none">
                    <Layers size={16} />
                  </div>
                  <select
                    className="w-full bg-white border border-[var(--color-neutral-border)] focus:border-[var(--color-brand-primary)] rounded-[8px] py-3 pl-12 pr-10 text-[var(--color-neutral-text-main)] text-[14px] font-semibold focus:outline-none transition-colors appearance-none cursor-pointer shadow-sm"
                    value={nuevoInsumo.codigoMateriaPrima}
                    onChange={(e) =>
                      setNuevoInsumo({
                        ...nuevoInsumo,
                        codigoMateriaPrima: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled className="text-[var(--color-neutral-text-muted)]">
                      Seleccionar Insumo...
                    </option>
                    {materiasPrimas.map((mp) => (
                      <option
                        key={mp.codigo}
                        value={mp.codigo}
                        className="text-[var(--color-neutral-text-main)]"
                      >
                        {mp.nombre} ({mp.unidadMedida})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-neutral-text-muted)]">
                    <DesplegadorIcono size={14} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="relative w-full md:w-32 group">
                    <input
                      type="number"
                      placeholder="0.0"
                      className={`w-full bg-white border ${excedeStock ? "border-rose-400 focus:border-rose-500 text-rose-600" : "border-[var(--color-neutral-border)] focus:border-[var(--color-brand-primary)] text-[var(--color-neutral-text-main)]"} rounded-[8px] py-3 px-4 text-[15px] font-bold focus:outline-none transition-colors text-center shadow-sm`}
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
                    className="bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:bg-gray-300 disabled:text-gray-500 px-6 rounded-[8px] transition-colors active:scale-95 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  >
                    <AgregarIcono size={20} />
                  </button>
                </div>
              </div>

              {/* REFINED REAL-TIME STOCK INDICATOR - Glassy & High Info Density */}
              {nuevoInsumo.codigoMateriaPrima && (
                <div className="relative px-4 py-3 rounded-[10px] bg-white border border-[var(--color-neutral-border)] flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${excedeStock ? "bg-rose-500" : "bg-[var(--color-brand-primary)]"}`}
                      />
                      <span className="text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-wider">
                        Validación de Inventario
                      </span>
                    </div>
                    {excedeStock ? (
                      <div className="px-2 py-1 bg-rose-50 border border-rose-200 rounded-[6px] text-rose-600 flex items-center gap-1.5">
                        <AdvertenciaIcono size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Stock Insuficiente
                        </span>
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-[6px] text-emerald-600 flex items-center gap-1.5">
                        <CheckIcono size={12} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Material Disponible
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[11px] text-[var(--color-neutral-text-muted)] font-bold uppercase tracking-wide leading-none font-mono">
                        En Almacén
                      </p>
                      <p className="text-[15px] font-bold text-[var(--color-neutral-text-main)] font-mono">
                        {mpSeleccionada?.stock?.toFixed(2) || 0}{" "}
                        <span className="text-[12px] font-medium text-[var(--color-neutral-text-muted)] uppercase font-sans">
                          {mpSeleccionada?.unidadMedida}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-baseline gap-4">
                      <div className="text-right">
                        <p className="text-[11px] text-[var(--color-neutral-text-muted)] font-bold uppercase tracking-wide leading-none font-mono">
                          Proyección Final
                        </p>
                        <p
                          className={`text-[20px] font-bold ${excedeStock ? "text-rose-600" : "text-[var(--color-brand-primary)]"} font-mono leading-none tracking-tight mt-1`}
                        >
                          {(
                            stockDisponibleReal -
                            (parseFloat(nuevoInsumo.cantidad) || 0)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${excedeStock ? "bg-rose-500" : "bg-[var(--color-brand-primary)]"}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, ((stockDisponibleReal - (parseFloat(nuevoInsumo.cantidad) || 0)) / (mpSeleccionada?.stock || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* List - Minimalist & Delicate */}
              <div className="bg-white rounded-[12px] border border-[var(--color-neutral-border)] overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-[var(--color-neutral-border)]">
                  <div className="col-span-6 text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-wider">
                    Insumo Seleccionado
                  </div>
                  <div className="col-span-3 text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-wider text-center">
                    Consumo
                  </div>
                  {/* <div className="col-span-3 text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase tracking-wider text-right">
                    Saldo Final
                  </div> */}
                </div>

                <div className="max-h-[220px] overflow-y-auto custom-scrollbar divide-y divide-[var(--color-neutral-border)] bg-white">
                  {formData.insumos.length === 0 ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-dashed border-[var(--color-neutral-border)] flex items-center justify-center mb-4 text-[var(--color-neutral-text-muted)]">
                        <MovimientoIcono size={24} />
                      </div>
                      <p className="text-[13px] uppercase font-bold text-[var(--color-neutral-text-muted)] italic">
                        Sin materiales agregados
                      </p>
                    </div>
                  ) : (
                    formData.insumos.map((i, index) => {
                      const mpRef = materiasPrimas.find(
                        (m) => m.codigo === i.codigoMateriaPrima,
                      );
                      const stockFinal =
                        (mpRef?.stock || 0) - parseFloat(i.cantidad);

                      return (
                        <div
                          key={i.codigoMateriaPrima}
                          className={`grid grid-cols-12 gap-4 px-4 py-3.5 hover:bg-gray-50 items-center group transition-colors`}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="col-span-6 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[var(--color-brand-soft)] border border-[var(--color-brand-primary)]/20 flex items-center justify-center text-[var(--color-brand-primary)]">
                              <span className="text-[12px] font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-[var(--color-neutral-text-main)] uppercase tracking-tight line-clamp-1">
                                {i.nombre}
                              </div>
                              <div className="text-[11px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wider">
                                Insumo Base
                              </div>
                            </div>
                          </div>

                          <div className="col-span-3 text-center flex flex-col items-center">
                            <span className="text-[var(--color-neutral-text-main)] font-bold text-[13px] leading-none">
                              {i.cantidad}
                            </span>
                            <span className="text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase font-mono mt-1">
                              {i.unidad}
                            </span>
                          </div>

                          <div className="col-span-3 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleEliminarInsumo(i.codigoMateriaPrima)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 border border-rose-200 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <BorrarIcono size={14} />
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
            <div className="bg-rose-50 border border-rose-200 rounded-[12px] p-4 flex gap-4 items-center shadow-sm">
              <div className="w-10 h-10 bg-white rounded-md text-rose-500 shrink-0 flex items-center justify-center border border-rose-100">
                <AdvertenciaIcono size={20} />
              </div>
              <div className="flex-1">
                <h5 className="text-rose-600 font-bold text-[12px] uppercase tracking-wide mb-0.5">
                  Fallo de Validación Operativa
                </h5>
                <p className="text-[var(--color-neutral-text-main)] text-[13px] leading-tight font-medium">
                  Se requiere mayor disponibilidad para{" "}
                  <span className="font-bold">
                    {errorStock.materiaPrima}
                  </span>
                  . Falta:{" "}
                  <span className="text-rose-500 font-bold">
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
        className={`${isStandalone ? "p-4 bg-gray-50" : "p-5 md:p-6 bg-gray-50"} border-t border-[var(--color-neutral-border)] flex flex-col sm:flex-row gap-3 shrink-0 rounded-b-[16px]`}
      >
        {!isStandalone && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1 bg-white hover:bg-gray-100 border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] font-bold py-3 rounded-[8px] text-[13px] uppercase tracking-wide transition-colors active:scale-95 shadow-sm"
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
          className={`${isStandalone ? "flex-1" : "flex-[2]"} order-1 sm:order-2 bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] disabled:bg-gray-300 disabled:text-gray-500 font-bold py-3 rounded-[8px] text-[13px] uppercase tracking-wide flex items-center justify-center gap-2.5 active:scale-95 group/submit cursor-pointer transition-colors shadow-sm disabled:cursor-not-allowed`}
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckIcono size={18} className="group-hover/submit:scale-110 transition-transform" />
              Finalizar Registro de Lote
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isStandalone) return content;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-[var(--color-neutral-border)] w-full max-w-2xl md:rounded-[16px] shadow-2xl overflow-hidden flex flex-col max-h-screen">
        {content}
      </div>
    </div>
  );
};

export default ModalProduccion;
