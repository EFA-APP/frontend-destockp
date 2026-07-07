import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useCrearMovimiento } from "../../../Backend/Articulos/queries/Movimientos/useCrearMovimiento.mutation";
import { useObtenerProductos } from "../../../Backend/Articulos/queries/Producto/useObtenerProductos.query";
import { useObtenerMateriasPrimas } from "../../../Backend/Articulos/queries/MateriaPrima/useObtenerMateriasPrimas.query";
import {
  BuscadorIcono,
  GuardarIcono,
  MovimientoIcono,
} from "../../../assets/Icons";
import {
  Package,
  Search,
  Settings2,
  ClipboardList,
  Info,
  AlertCircle,
} from "lucide-react";
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
      return Array.isArray(queryProductos.data?.data)
        ? queryProductos.data.data
        : [];
    } else {
      return Array.isArray(queryMateriasPrimas.data)
        ? queryMateriasPrimas.data
        : [];
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
      setGlobalConfig((prev) => ({
        ...prev,
        origenMovimiento: "AJUSTE_MANUAL",
      }));
    } else if (globalConfig.tipoMovimiento === "EGRESO") {
      setGlobalConfig((prev) => ({ ...prev, origenMovimiento: "VENTA" }));
    } else {
      setGlobalConfig((prev) => ({
        ...prev,
        origenMovimiento: tipo === "PRODUCTO" ? "PRODUCCION" : "DEPOSITO",
      }));
    }
  }, [globalConfig.tipoMovimiento, tipo]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return allItems;
    return allItems.filter(
      (item) =>
        item.nombre?.toLowerCase().includes(term) ||
        String(item.codigoSecuencial).includes(term),
    );
  }, [searchTerm, allItems]);

  const handleUpdateQuantity = (codigo, value) => {
    setAjustes((prev) => ({
      ...prev,
      [codigo]: value,
    }));
  };

  const selectedEntries = Object.entries(ajustes).filter(
    ([_, v]) => v !== "" && parseFloat(v) !== 0 && !isNaN(parseFloat(v)),
  );
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

  const labelClasses =
    "text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase mb-1 ml-1";
  const inputClasses =
    "w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] px-3 py-2 text-[13px] text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] placeholder:text-[var(--color-neutral-text-muted)]";

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta={"AJUSTE DE STOCK"}
        icono={<Package size={22} className="text-amber-600" />}
        volver={true}
        redireccionAnterior={-1}
        subTitulo="Ajuste masivo o individual de stock"
      />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start mt-4 pb-20">
        {/* Left Panel: Configuration */}
        <aside className="space-y-4 lg:sticky lg:top-4 z-10">
          <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5">
            <h3 className="text-[14px] font-bold text-[var(--color-neutral-text-main)] mb-4 flex items-center gap-2 border-b border-[var(--color-neutral-border)] pb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Configuración Global
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="flex flex-col">
                <label className={labelClasses}>Tipo Movimiento</label>
                <select
                  value={globalConfig.tipoMovimiento}
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      tipoMovimiento: e.target.value,
                    }))
                  }
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
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      origenMovimiento: e.target.value,
                    }))
                  }
                  className={inputClasses}
                >
                  {globalConfig.tipoMovimiento === "AJUSTE" && (
                    <option value="AJUSTE_MANUAL">Ajuste Manual</option>
                  )}
                  {globalConfig.tipoMovimiento === "INGRESO" && (
                    <>
                      <option value="PRODUCCION">Producción</option>
                      <option value="DEPOSITO">Depósito</option>
                      <option value="INGRESO_FRUTA_MP">
                        Ingreso Fruta (MP)
                      </option>
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
                  onChange={(e) =>
                    setGlobalConfig((prev) => ({
                      ...prev,
                      observacion: e.target.value,
                    }))
                  }
                  placeholder="Ej: Auditoría..."
                  rows={2}
                  className={`${inputClasses} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Desktop Summary / Button Area */}
          <div className="hidden lg:block bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase">
                    Seleccionados
                </span>
                <span className="text-[14px] font-bold text-[var(--color-brand-primary)]">
                    {selectedCount}
                </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={processing || selectedCount === 0}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 text-white rounded-[10px] font-semibold text-[13px] transition-colors shadow-sm"
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GuardarIcono size={16} />
              )}
              {processing ? "Procesando..." : "Confirmar Ajustes"}
            </button>
          </div>
        </aside>

        {/* Right Panel: List & Search */}
        <section className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative group lg:sticky lg:top-4 z-20">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral-text-muted)] group-focus-within:text-[var(--color-brand-primary)]">
              <BuscadorIcono size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nombre o código..."
              className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[12px] pl-11 pr-4 py-3 text-[13px] text-[var(--color-neutral-text-main)] placeholder:text-[var(--color-neutral-text-muted)] focus:outline-none focus:border-[var(--color-brand-primary)] shadow-sm"
            />
          </div>

          {/* List Area */}
          <div className="bg-white border border-[var(--color-neutral-border)] rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-[70px_1fr_100px_120px] gap-4 px-6 py-4 border-b border-[var(--color-neutral-border)] bg-gray-50/50 items-center">
              <div className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
                Cód.
              </div>
              <div className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide">
                Artículo
              </div>
              <div className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide text-right">
                Stock
              </div>
              <div className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase tracking-wide text-right">
                Ajuste
              </div>
            </div>

            <div className="flex flex-col max-h-[600px] lg:max-h-[500px] overflow-y-auto custom-scrollbar divide-y divide-[var(--color-neutral-border)]">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[var(--color-neutral-text-muted)]">
                  <Package
                    size={40}
                    strokeWidth={1.5}
                    className="mb-3 opacity-40"
                  />
                  <p className="text-[13px] font-semibold tracking-wide">
                    Sin resultados
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const val = ajustes[item.codigoSecuencial];
                  const hasValue = val !== "" && val !== undefined;
                  const isNegative = hasValue && parseFloat(val) < 0;

                  return (
                    <div key={item.codigoSecuencial}>
                      {/* Desktop View */}
                      <div
                        className={`hidden lg:grid lg:grid-cols-[70px_1fr_100px_120px] gap-4 px-6 py-3 items-center hover:bg-gray-50/50 transition-colors ${hasValue ? "bg-[var(--color-brand-soft)]/20" : ""}`}
                      >
                        <div className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)]">
                          #{item.codigoSecuencial.toString().padStart(3, "0")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-[var(--color-neutral-text-main)] truncate">
                            {item.nombre.toUpperCase()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] font-medium text-[var(--color-neutral-text-main)]">
                            {item.stock}
                          </span>
                          <span className="text-[11px] font-bold text-[var(--color-neutral-text-muted)] ml-1 uppercase">
                            {item.unidadMedida}
                          </span>
                        </div>
                        <div className="flex justify-end">
                          <input
                            type="number"
                            value={ajustes[item.codigoSecuencial] || ""}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.codigoSecuencial,
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className={`w-[100px] bg-white border rounded-[8px] px-3 py-1.5 text-right text-[13px] font-semibold focus:outline-none transition-colors ${hasValue ? (isNegative ? "border-rose-300 text-rose-600 bg-rose-50" : "border-emerald-300 text-emerald-600 bg-emerald-50") : "border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] focus:border-[var(--color-brand-primary)]"}`}
                          />
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div
                        className={`lg:hidden p-4 rounded-xl border m-2 ${hasValue ? "bg-[var(--color-brand-soft)]/20 border-[var(--color-brand-primary)]/20" : "bg-white border-[var(--color-neutral-border)]"}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-[var(--color-neutral-text-muted)] mb-1">
                              #{item.codigoSecuencial.toString().padStart(3, "0")}
                            </span>
                            <span className="text-[14px] font-bold text-[var(--color-neutral-text-main)] leading-tight">
                              {item.nombre.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-bold text-[var(--color-neutral-text-muted)] uppercase mb-0.5">
                              Stock
                            </div>
                            <div className="text-sm font-semibold text-[var(--color-neutral-text-main)]">
                              {item.stock}{" "}
                              <span className="text-[11px] text-[var(--color-neutral-text-muted)]">
                                {item.unidadMedida}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase">
                            Ajustar:
                          </div>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={ajustes[item.codigoSecuencial] || ""}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                item.codigoSecuencial,
                                e.target.value,
                              )
                            }
                            placeholder="0"
                            className={`w-32 bg-white border rounded-[8px] px-4 py-2 text-sm font-semibold text-right focus:outline-none ${hasValue ? (isNegative ? "border-rose-300 text-rose-600 bg-rose-50" : "border-emerald-300 text-emerald-600 bg-emerald-50") : "border-[var(--color-neutral-border)]"}`}
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
      </div>

      {/* Mobile Summary / Button Area */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-neutral-border)] p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase">
            Artículos Modificados
          </span>
          <span className="text-[14px] font-bold text-[var(--color-brand-primary)]">
            {selectedCount}
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={processing || selectedCount === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-50 text-white rounded-[10px] font-semibold text-[13px] transition-colors shadow-sm"
        >
          {processing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <GuardarIcono size={16} />
          )}
          {processing ? "Procesando..." : "Confirmar Ajustes"}
        </button>
      </div>
    </ContenedorSeccion>
  );
};

export default AjusteStockPage;
