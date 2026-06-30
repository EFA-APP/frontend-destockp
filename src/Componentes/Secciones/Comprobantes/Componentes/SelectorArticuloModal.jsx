import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Warehouse,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "../../../../utils/formatters";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import {
  ObtenerDepositosApi,
  ListarDepositosPorStockApi,
} from "../../../../Backend/Articulos/api/Deposito/deposito.api";

// Textos e icono que cambian según qué se está buscando. Agregar
// "CUENTA_CONTABLE" acá ya deja el modal funcionando para ese caso en
// cuanto conectes el hook real de búsqueda (ver useDetalleComprobante.js).
const COPY_POR_TIPO = {
  PRODUCTO: {
    encabezado:
      "Busque y agregue múltiples productos al carrito con su respectiva cantidad",
    placeholder: "Escriba para buscar productos por nombre o código...",
    vacioConTexto: "Pruebe con otro término de búsqueda",
    vacioSinTexto: "Comience a escribir para buscar artículos",
  },
  MATERIA_PRIMA: {
    encabezado:
      "Busque y agregue múltiples materias primas al carrito con su respectiva cantidad",
    placeholder: "Escriba para buscar materia prima por nombre o código...",
    vacioConTexto: "Pruebe con otro término de búsqueda",
    vacioSinTexto: "Comience a escribir para buscar materia prima",
  },
  CUENTA_CONTABLE: {
    encabezado: "Busque la cuenta contable e ingrese el importe a registrar",
    placeholder: "Escriba para buscar por nombre o número de cuenta...",
    vacioConTexto: "Pruebe con otro término de búsqueda",
    vacioSinTexto: "Comience a escribir para buscar cuentas contables",
  },
};

const SelectorArticuloModal = ({
  isOpen,
  onClose,
  tipoDetalle = "PRODUCTO",
  articulos = [],
  cargando = false,
  codigoBusqueda,
  setCodigoBusqueda,
  agregarItem,
  getPrecio,
  columnaPrecioSeleccionada = "precioVenta",
  montoPreCargado = "",
  montosSugeridos = [],
}) => {
  const usuario = useAuthStore((u) => u.usuario);
  const conexionArca = usuario.conexionArca;

  const [cantidades, setCantidades] = useState({});
  const [importes, setImportes] = useState({});
  const [preciosPorFila, setPreciosPorFila] = useState({});
  const [agregados, setAgregados] = useState({});
  const [tasaIvaSeleccionada, setTasaIvaSeleccionada] = useState(
    montosSugeridos.length > 0 ? montosSugeridos[0] : null
  );
  const inputRef = useRef(null);

  const esCuentaContable = tipoDetalle === "CUENTA_CONTABLE";
  const copy = COPY_POR_TIPO[tipoDetalle] || COPY_POR_TIPO.PRODUCTO;

  const { tieneAccion } = usePermisosDeUsuario();
  const tieneRestarStock = tieneAccion("RESTAR_STOCK_COMPROBANTE");

  const [depositoSeleccionado, setDepositoSeleccionado] = useState("");

  const { data: depositosData } = useQuery({
    queryKey: ["depositos-selector"],
    queryFn: () => ObtenerDepositosApi({}),
    enabled: tieneRestarStock && isOpen,
    staleTime: 1000 * 60 * 5,
  });

  const depositos = Array.isArray(depositosData?.data)
    ? depositosData.data
    : Array.isArray(depositosData)
      ? depositosData
      : [];

  useEffect(() => {
    if (depositos.length > 0 && !depositoSeleccionado) {
      setDepositoSeleccionado(String(depositos[0].codigoSecuencial));
    }
  }, [depositos.length]);

  const esArticulo =
    tipoDetalle === "PRODUCTO" || tipoDetalle === "MATERIA_PRIMA";

  const codigosVisibles = articulos.map((a) => a.codigoSecuencial).join(",");

  const { data: stockDepositoData } = useQuery({
    queryKey: [
      "stock-deposito-modal",
      tipoDetalle,
      depositoSeleccionado,
      codigosVisibles,
    ],
    queryFn: () =>
      ListarDepositosPorStockApi({
        pagina: 1,
        limite: articulos.length || 20,
        tipoArticulo: tipoDetalle,
        codigosArticulos: codigosVisibles,
      }),
    enabled:
      tieneRestarStock &&
      isOpen &&
      !!depositoSeleccionado &&
      esArticulo &&
      articulos.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const stockPorProducto = {};
  if (stockDepositoData?.data && depositoSeleccionado) {
    (Array.isArray(stockDepositoData.data)
      ? stockDepositoData.data
      : []
    ).forEach((prod) => {
      const sp = prod.stockPorDeposito?.find(
        (s) => s.codigoDeposito === Number(depositoSeleccionado),
      );
      stockPorProducto[prod.codigoSecuencial] = sp?.stock ?? 0;
    });
  }

  const getStockProducto = (p) => {
    if (tieneRestarStock && depositoSeleccionado) {
      return stockPorProducto[p.codigoSecuencial] ?? null; // null = aún cargando
    }
    return parseFloat(p.stock) || 0;
  };

  // Escuchar la tecla ESC para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-enfocar el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIncrement = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const handleDecrement = (id) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1),
    }));
  };

  const handleQuantityChange = (id, val) => {
    const parsed = parseFloat(val) || 1;
    setCantidades((prev) => ({
      ...prev,
      [id]: Math.max(1, parsed),
    }));
  };

  const handleImporteChange = (id, val) => {
    setImportes((prev) => ({ ...prev, [id]: val }));
  };

  const getPrecioFila = (item) => {
    if (preciosPorFila[item.codigoSecuencial] !== undefined) {
      return preciosPorFila[item.codigoSecuencial];
    }
    if (tasaIvaSeleccionada !== null) return tasaIvaSeleccionada.monto;
    return (
      (getPrecio && getPrecio(item, columnaPrecioSeleccionada)) ||
      parseFloat(item.precio) ||
      0
    );
  };

  const handlePrecioChange = (id, val) =>
    setPreciosPorFila((prev) => ({ ...prev, [id]: val }));

  const handleAgregar = (item) => {
    if (esCuentaContable) {
      const importe =
        parseFloat(
          importes[item.codigoSecuencial] ?? tasaIvaSeleccionada?.monto ?? montoPreCargado,
        ) || 0;
      agregarItem(item, 1, {
        precioUnitario: importe,
        tipoFiscal: tasaIvaSeleccionada?.tipoFiscal ?? "GRAVADO",
        tasaIva: tasaIvaSeleccionada?.alicuota ?? 0,
      });
    } else {
      const qty = cantidades[item.codigoSecuencial] || 1;
      const precioUnitario = parseFloat(getPrecioFila(item)) || 0;
      agregarItem(item, qty, {
        precioUnitario,
        tipoFiscal: tasaIvaSeleccionada?.tipoFiscal ?? undefined,
        tasaIva: tasaIvaSeleccionada?.alicuota ?? 0,
        ...(tieneRestarStock && depositoSeleccionado
          ? { codigoDeposito: Number(depositoSeleccionado) }
          : {}),
      });
    }


    // Activar feedback de agregado
    setAgregados((prev) => ({ ...prev, [item.codigoSecuencial]: true }));
    setTimeout(() => {
      setAgregados((prev) => ({ ...prev, [item.codigoSecuencial]: false }));
    }, 1500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-y-auto w-full h-full">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full  bg-white  flex flex-col my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-full h-full">
        {/* Cabecera */}
        <div className="p-5 border-b border-gray-150 flex justify-between items-center bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black">
              <ShoppingBag size={18} />
            </div>
            <div>
              <p className="text-md font-bold text-gray-700 uppercase tracking-wider mt-0.5">
                Añadir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all group shadow-sm cursor-pointer"
          >
            <X
              size={18}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-5 border-b border-gray-100 bg-white shrink-0 flex flex-col gap-3">
          {/* Selector de Depósito */}
          {tieneRestarStock && esArticulo && (
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${
                  depositoSeleccionado
                    ? "text-[var(--primary)]"
                    : "text-gray-500"
                }`}
              >
                <Warehouse size={11} />
                Depósito
                {depositoSeleccionado && (
                  <span className="ml-auto flex items-center gap-1 text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-black tracking-wider">
                    <Check size={9} strokeWidth={3} />
                    Seleccionado
                  </span>
                )}
              </label>
              <select
                value={depositoSeleccionado}
                onChange={(e) => setDepositoSeleccionado(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-md text-xs font-bold focus:outline-none cursor-pointer transition-all duration-150 ${
                  depositoSeleccionado
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] ring-2 ring-[var(--primary)]/15 shadow-sm"
                    : "border-gray-200 bg-white text-gray-800 focus:border-[var(--primary)]"
                }`}
              >
                <option value="">Sin depósito específico</option>
                {depositos.map((dep) => (
                  <option
                    key={dep.codigoSecuencial}
                    value={dep.codigoSecuencial}
                  >
                    {dep.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Barra de Búsqueda */}
          <div className="relative group flex bg-white border border-gray-300 rounded-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[50px] items-center w-full shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-700">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              placeholder={copy.placeholder}
              className="w-full bg-transparent pl-11 pr-10 py-3 text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-700 placeholder:font-bold uppercase tracking-tight"
            />
            {codigoBusqueda && (
              <button
                onClick={() => setCodigoBusqueda("")}
                className="absolute right-3 w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de tasa IVA desde ARCA */}
          {montosSugeridos.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-600">Tasa IVA</label>
              <select
                value={
                  tasaIvaSeleccionada?.tipoFiscal === "GRAVADO"
                    ? tasaIvaSeleccionada.alicuota
                    : tasaIvaSeleccionada?.tipoFiscal ?? ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  const entry = montosSugeridos.find(
                    (m) =>
                      (m.tipoFiscal === "GRAVADO" && String(m.alicuota) === val) ||
                      (m.tipoFiscal !== "GRAVADO" && m.tipoFiscal === val)
                  );
                  if (entry) {
                    setTasaIvaSeleccionada(entry);
                    setPreciosPorFila((prev) => {
                      const updated = {};
                      Object.keys(prev).forEach((k) => {
                        updated[k] = parseFloat(entry.monto.toFixed(2));
                      });
                      return updated;
                    });
                    setImportes((prev) => {
                      const updated = {};
                      Object.keys(prev).forEach((k) => {
                        updated[k] = parseFloat(entry.monto.toFixed(2));
                      });
                      return updated;
                    });
                  }
                }}
                className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm"
              >
                {montosSugeridos.map((m, i) => {
                  const val = m.tipoFiscal === "GRAVADO" ? m.alicuota : m.tipoFiscal;
                  const label =
                    m.tipoFiscal === "GRAVADO"
                      ? `${m.alicuota}%`
                      : m.tipoFiscal === "NO_GRAVADO"
                      ? "No Gravado"
                      : "Exento";
                  return (
                    <option key={i} value={val}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Listado de Artículos */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-gray-50/50">
          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white border border-gray-200 rounded-md animate-pulse p-4 flex justify-between items-center"
                >
                  <div className="space-y-2 w-1/3">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : articulos.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center text-gray-700 gap-2">
              <Search className="w-12 h-12 text-gray-300" />
              <p className="text-xs font-black uppercase tracking-widest">
                Sin Resultados
              </p>
              <p className="text-[10px] font-semibold text-gray-700 uppercase">
                {codigoBusqueda ? copy.vacioConTexto : copy.vacioSinTexto}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articulos.map((p) => {
                const isSelected = agregados[p.codigoSecuencial];

                // ───────── FILA: CUENTA CONTABLE (importe a mano, sin stock ni cantidad) ─────────
                if (esCuentaContable) {
                  return (
                    <div
                      key={p.codigoSecuencial}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-md p-4 transition gap-4 shadow-sm hover:border-[var(--primary)]/30 hover:shadow-md ${
                        isSelected
                          ? "border-emerald-500/40 bg-emerald-50/10"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-xs md:text-sm text-gray-900 uppercase block truncate">
                          {p.nombre}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-700 uppercase mt-0.5 block truncate">
                          {p.numeroCuenta
                            ? `Cuenta N° ${p.numeroCuenta}`
                            : p.descripcion || "Cuenta Contable"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Importe */}
                        <div className="flex flex-col items-start">
                          <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-none">
                            Importe
                          </span>
                          <input
                            type="number"
                            value={
                              importes[p.codigoSecuencial] ??
                              tasaIvaSeleccionada?.monto ??
                              montoPreCargado
                            }
                            onChange={(e) =>
                              handleImporteChange(
                                p.codigoSecuencial,
                                e.target.value,
                              )
                            }
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-24 mt-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm font-black text-gray-900 focus:outline-none focus:border-[var(--primary)]"
                          />
                        </div>

                        {/* Botón Agregar */}
                        <button
                          type="button"
                          onClick={() => handleAgregar(p)}
                          className={`w-32 h-[38px] rounded-md font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            isSelected
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-100"
                              : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 border-[var(--primary)] shadow-sm active:scale-95"
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              Agregado
                            </>
                          ) : (
                            <>
                              <Plus size={14} strokeWidth={3} />
                              Añadir
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                }

                // ───────── FILA: PRODUCTO / MATERIA PRIMA (stock, precio, cantidad + IVA) ─────────
                const quantity = cantidades[p.codigoSecuencial] || 1;

                return (
                  <div
                    key={p.codigoSecuencial}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white border rounded-md p-4 transition gap-4 shadow-sm hover:border-[var(--primary)]/30 hover:shadow-md ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-50/10"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Detalles del Producto */}
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs md:text-sm text-gray-900 uppercase block truncate">
                        {p.nombre}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-700 uppercase mt-0.5 block truncate">
                        {p.descripcion || "Item General"}
                      </span>

                      <div className="flex gap-2 items-center mt-2">
                        {/* Badge de Stock */}
                        {(() => {
                          if (!tieneRestarStock) return null;
                          const stockVal = getStockProducto(p);
                          if (stockVal === null) {
                            return (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-100">
                                Cargando...
                              </span>
                            );
                          }
                          const disponible = stockVal > 0;
                          return (
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                disponible
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}
                            >
                              {disponible
                                ? `Stock${depositoSeleccionado ? " dep." : ""}: ${stockVal}`
                                : "Sin Stock"}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Precios, IVA y Cantidad */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Precio editable */}
                      <div className="flex flex-col items-start">
                        <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest leading-none">
                          Precio
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={getPrecioFila(p)}
                          onChange={(e) =>
                            handlePrecioChange(
                              p.codigoSecuencial,
                              e.target.value,
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-24 mt-1 px-2 py-1.5 border border-gray-200 rounded-md text-sm font-black text-gray-900 focus:outline-none focus:border-[var(--primary)]"
                        />
                      </div>

                      {/* Selector de Cantidad */}
                      <div className="flex items-center bg-gray-100 border border-gray-200 rounded-full p-0.5 shadow-inner">
                        <button
                          type="button"
                          onClick={() => handleDecrement(p.codigoSecuencial)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-600 transition active:scale-90 font-black shadow-sm cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              p.codigoSecuencial,
                              e.target.value,
                            )
                          }
                          className="w-10 bg-transparent border-none text-center font-black text-xs text-gray-800 focus:outline-none p-0"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={() => handleIncrement(p.codigoSecuencial)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-600 transition active:scale-90 font-black shadow-sm cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Botón Agregar */}
                      <button
                        type="button"
                        onClick={() => handleAgregar(p)}
                        className={`w-32 h-[38px] rounded-md font-black text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-100"
                            : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 border-[var(--primary)] shadow-sm active:scale-95"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            Agregado
                          </>
                        ) : (
                          <>
                            <Plus size={14} strokeWidth={3} />
                            Añadir
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-150 bg-white flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs uppercase tracking-wider rounded-md transition cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SelectorArticuloModal;
