import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Database,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { useAuthStore } from "../../../Backend/Autenticacion/store/authenticacion.store";
import { useActualizarStock } from "../../../Backend/Articulos/queries/Deposito/useActualizarStock.mutation";
import { useTransferirStock } from "../../../Backend/Articulos/queries/Deposito/useTransferirStock.mutation";
import { InventarioIcono } from "../../../assets/Icons";

const DrawerActualizarStock = ({
  isOpen,
  onClose,
  fila,
  depositosRaw,
  depositoInicial,
  tipoArticulo, // 'PRODUCTO' o 'MATERIA_PRIMA'
}) => {
  const [modo, setModo] = useState("ajuste"); // 'ajuste' o 'transferencia'
  const [depositoSeleccionado, setDepositoSeleccionado] = useState("");

  // Estados para transferencia
  const [depositoOrigen, setDepositoOrigen] = useState("");
  const [depositoDestino, setDepositoDestino] = useState("");

  const [cantidad, setCantidad] = useState("");
  const [tipoAjuste, setTipoAjuste] = useState("agregar"); // 'agregar' o 'quitar'
  const [observacion, setObservacion] = useState("");

  const { mutate: actualizarStock, isPending: isPendingAjuste } =
    useActualizarStock();
  const { mutate: transferirStock, isPending: isPendingTransfer } =
    useTransferirStock();
  const usuario = useAuthStore((state) => state.usuario);

  const isPending = isPendingAjuste || isPendingTransfer;

  // Init state on load
  useEffect(() => {
    if (isOpen) {
      setModo("ajuste");
      // Nota: En useDepositoUI, la matriz de stock usa `dep_${id}` para acceder al stock por depósito
      setDepositoSeleccionado(
        depositoInicial ||
          depositosRaw?.[0]?.codigoSecuencial?.toString() ||
          "",
      );
      setDepositoOrigen(
        depositoInicial ||
          depositosRaw?.[0]?.codigoSecuencial?.toString() ||
          "",
      );
      setDepositoDestino("");
      setCantidad("");
      setTipoAjuste("agregar");
      setObservacion("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, depositosRaw, depositoInicial]);

  if (!isOpen || !fila) return null;

  // Obtener Stock actual buscando en el array stockPorDeposito
  const getStockDeDeposito = (depId) => {
    if (!fila.stockPorDeposito || !depId) return 0;
    const stockItem = fila.stockPorDeposito.find(
      (sp) =>
        String(sp.codigoDeposito) === String(depId) ||
        String(sp.deposito?.codigoSecuencial) === String(depId),
    );
    return Number(stockItem?.stock || 0);
  };

  const stockActualCalculado = getStockDeDeposito(depositoSeleccionado);
  const proximoStock = cantidad
    ? tipoAjuste === "agregar"
      ? stockActualCalculado + Number(cantidad)
      : stockActualCalculado - Number(cantidad)
    : stockActualCalculado;

  // Cálculo para transferencia
  const stockOrigenActual = getStockDeDeposito(depositoOrigen);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modo === "ajuste") {
      if (!depositoSeleccionado || !cantidad) return;

      let cantidadFinal = Number(cantidad);
      if (tipoAjuste === "quitar") {
        cantidadFinal = -Math.abs(cantidadFinal);
      } else {
        cantidadFinal = Math.abs(cantidadFinal);
      }

      const isProducto = tipoArticulo === "PRODUCTO" || !!fila.codigoProducto;
      const codigoIdentificador = Number(
        fila.codigoSecuencial || fila.codigoProducto || fila.codigoMateriaPrima,
      );

      const depSeleccionadoObj = depositosRaw?.find(
        (d) => String(d.codigoSecuencial) === String(depositoSeleccionado),
      );

      actualizarStock(
        {
          codigoProducto: isProducto ? codigoIdentificador : undefined,
          codigoMateriaPrima: !isProducto ? codigoIdentificador : undefined,
          codigoDeposito: Number(depositoSeleccionado), // Volvemos a enviar ID
          nombreDeposito: depSeleccionadoObj?.nombre, // Opcional: enviamos nombre aparte
          cantidad: cantidadFinal,
          codigoUsuario: usuario?.codigoSecuencial
            ? Number(usuario.codigoSecuencial)
            : undefined,
          nombreUsuario:
            `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim() ||
            undefined,
          observacion: observacion || undefined,
          generarMovimiento: true,
          origenMovimiento: "AJUSTE_MANUAL",
          descripcion: fila.descripcion || undefined,
        },
        { onSuccess: onClose },
      );
    } else {
      // Modo Transferencia
      if (!depositoOrigen || !depositoDestino || !cantidad) return;

      const isProducto = tipoArticulo === "PRODUCTO" || !!fila.codigoProducto;
      const codigoIdentificador = Number(
        fila.codigoSecuencial || fila.codigoProducto || fila.codigoMateriaPrima,
      );

      const depOrigenObj = depositosRaw?.find(
        (d) => String(d.codigoSecuencial) === String(depositoOrigen),
      );
      const depDestinoObj = depositosRaw?.find(
        (d) => String(d.codigoSecuencial) === String(depositoDestino),
      );

      transferirStock(
        {
          codigoProducto: isProducto ? codigoIdentificador : undefined,
          codigoMateriaPrima: !isProducto ? codigoIdentificador : undefined,
          codigoDepositoOrigen: Number(depositoOrigen), // ID numérico para la DB
          codigoDepositoDestino: Number(depositoDestino), // ID numérico para la DB
          nombreDepositoOrigen: depOrigenObj?.nombre, // Nombre para el historial
          nombreDepositoDestino: depDestinoObj?.nombre, // Nombre para el historial
          cantidad: Number(cantidad),
          codigoUsuario: usuario?.codigoSecuencial
            ? Number(usuario.codigoSecuencial)
            : undefined,
          nombreUsuario:
            `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim() ||
            undefined,
          observacion: observacion || undefined,
          descripcion: fila.descripcion || undefined,
        },
        { onSuccess: onClose },
      );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Overlay background (blur) */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={!isPending ? onClose : undefined}
      />

      {/* Slide-over panel */}
      <div
        className={`
                relative w-full max-w-md h-screen bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] 
                border-l border-[var(--color-neutral-border)] flex flex-col
                transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
                ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}
      >
        {/* Header Premium */}
        <div className="px-6 py-5 border-b border-[var(--color-neutral-border)] bg-gray-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[var(--color-brand-soft)] text-[var(--color-brand-primary)] flex items-center justify-center border border-[var(--color-brand-primary)]/20 shadow-sm">
              <InventarioIcono size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[16px] font-bold text-[var(--color-neutral-text-main)] leading-tight uppercase tracking-wide">
                {fila.nombre}
              </p>
              <h2 className="text-[12px] text-[var(--color-neutral-text-muted)] font-semibold uppercase tracking-wider mt-0.5">
                Operación de Stock
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--color-neutral-text-muted)] hover:text-[var(--color-neutral-text-main)] hover:bg-gray-100 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sub-Header: Selector de Modo (Tabs) */}
        <div className="px-6 py-3 border-b border-[var(--color-neutral-border)] bg-white flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setModo("ajuste")}
            className={`flex-1 py-2 rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${modo === "ajuste" ? "bg-white border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] shadow-sm" : "text-[var(--color-neutral-text-muted)] hover:bg-gray-50 border border-transparent"}`}
          >
            <TrendingUp size={16} /> Ajuste manual
          </button>
          <button
            type="button"
            onClick={() => setModo("transferencia")}
            className={`flex-1 py-2 rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${modo === "transferencia" ? "bg-white border border-[var(--color-neutral-border)] text-[var(--color-neutral-text-main)] shadow-sm" : "text-[var(--color-neutral-text-muted)] hover:bg-gray-50 border border-transparent"}`}
          >
            <ArrowLeftRight size={16} /> Transferencia
          </button>
        </div>

        {/* --- Card de Stock por Depósito (SIEMPRE VISIBLE) --- */}
        <div className="px-6 py-4 bg-gray-50 border-b border-[var(--color-neutral-border)] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[var(--color-neutral-text-muted)] uppercase flex items-center gap-2">
              <Database size={14} className="text-[var(--color-brand-primary)]" />
              Stock Actual en Depósitos
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(fila.stockPorDeposito || []).map((sp) => {
              const stockDep = sp.stock || 0;
              const dep = sp.deposito || {};
              const esSeleccionado =
                (modo === "ajuste" &&
                  String(dep.codigoSecuencial) ===
                    String(depositoSeleccionado)) ||
                (modo === "transferencia" &&
                  String(dep.codigoSecuencial) === String(depositoOrigen));

              const getStockColor = (val) => {
                if (val > 50)
                  return {
                    bg: "bg-emerald-50",
                    border: "border-emerald-200",
                    text: "text-emerald-700",
                    indicator: "bg-emerald-500",
                  };
                if (val > 0)
                  return {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    text: "text-amber-700",
                    indicator: "bg-amber-500",
                  };
                return {
                  bg: "bg-rose-50",
                  border: "border-rose-200",
                  text: "text-rose-700",
                  indicator: "bg-rose-500",
                };
              };

              const colors = getStockColor(stockDep);

              return (
                <div
                  key={dep.codigoSecuencial || Math.random()}
                  className={`p-3 rounded-[12px] border transition-all duration-300 flex flex-col gap-1 bg-white ${esSeleccionado ? "border-[var(--color-brand-primary)] shadow-sm scale-[1.02] ring-2 ring-[var(--color-brand-soft)]" : `border-[var(--color-neutral-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]`}`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full ${colors.indicator} ${stockDep > 0 ? "animate-pulse" : ""}`}
                      />
                      <span
                        className={`text-[12px] font-bold uppercase truncate ${esSeleccionado ? "text-[var(--color-brand-primary)]" : "text-[var(--color-neutral-text-main)]"}`}
                      >
                        {dep.nombre || "DEPÓSITO"}
                      </span>
                    </div>
                    {esSeleccionado && (
                      <span className="text-[9px] font-bold bg-[var(--color-brand-primary)] text-white px-1.5 py-0.5 rounded shadow-sm">
                        SELECC.
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <span
                      className={`text-[20px] font-bold tabular-nums leading-none ${esSeleccionado ? "text-[var(--color-neutral-text-main)]" : colors.text}`}
                    >
                      {stockDep}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--color-neutral-text-muted)] mb-0.5">
                      {fila.unidadMedida || "UNI"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
          <form
            id="stock-drawer-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* --- MODO AJUSTE --- */}
            {modo === "ajuste" && (
              <>
                {/* Selector de Depósito */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-[var(--color-brand-primary)]" />
                    Depósito
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoSeleccionado}
                      onChange={(e) => setDepositoSeleccionado(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-white border border-[var(--color-neutral-border)] rounded-[8px] pl-4 pr-10 text-[14px] font-semibold text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] appearance-none shadow-sm"
                    >
                      <option
                        value=""
                        disabled
                        className="text-[var(--color-neutral-text-muted)]"
                      >
                        Seleccione un depósito...
                      </option>
                      {depositosRaw?.map((dep) => (
                        <option
                          key={dep.codigoSecuencial}
                          value={dep.codigoSecuencial}
                          className="text-[var(--color-neutral-text-main)]"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-[var(--color-neutral-text-muted)]" />
                    </div>
                  </div>
                </div>

                {/* Tipo de Ajuste */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase ml-1">
                    Tipo de Ajuste
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoAjuste("agregar")}
                      className={`flex flex-col items-center justify-center p-3 rounded-[8px] border relative overflow-hidden transition-colors ${tipoAjuste === "agregar" ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm ring-1 ring-emerald-300" : "bg-white border-[var(--color-neutral-border)] text-[var(--color-neutral-text-muted)] hover:bg-gray-50"}`}
                    >
                      <TrendingUp size={22} className="mb-1.5" />
                      <span className="text-[13px] font-bold uppercase tracking-wide">
                        Aumentar
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAjuste("quitar")}
                      className={`flex flex-col items-center justify-center p-3 rounded-[8px] border relative overflow-hidden transition-colors ${tipoAjuste === "quitar" ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm ring-1 ring-rose-300" : "bg-white border-[var(--color-neutral-border)] text-[var(--color-neutral-text-muted)] hover:bg-gray-50"}`}
                    >
                      <TrendingDown size={22} className="mb-1.5" />
                      <span className="text-[13px] font-bold uppercase tracking-wide">
                        Disminuir
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* --- MODO TRANSFERENCIA --- */}
            {modo === "transferencia" && (
              <>
                {/* Depósito Origen */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-[var(--color-brand-primary)]" />
                    Depósito de Origen (Egreso)
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoOrigen}
                      onChange={(e) => setDepositoOrigen(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-white border border-[var(--color-neutral-border)] rounded-[8px] pl-4 pr-10 text-[14px] font-semibold text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] appearance-none shadow-sm"
                    >
                      <option
                        value=""
                        disabled
                        className="text-[var(--color-neutral-text-muted)]"
                      >
                        Seleccione origen...
                      </option>
                      {depositosRaw?.map((dep) => (
                        <option
                          key={dep.codigoSecuencial}
                          value={dep.codigoSecuencial}
                          className="text-[var(--color-neutral-text-main)]"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-[var(--color-neutral-text-muted)]" />
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-neutral-text-muted)] ml-1">
                    Stock actual:{" "}
                    <b className="text-[var(--color-neutral-text-main)]">{stockOrigenActual}</b>
                  </span>
                </div>

                {/* Icono Intermedio */}
                <div className="flex justify-center -my-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 text-blue-600">
                    <ArrowLeftRight
                      size={16}
                      className="rotate-90 md:rotate-0"
                    />
                  </div>
                </div>

                {/* Depósito Destino */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-[var(--color-brand-primary)]" />
                    Depósito de Destino
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoDestino}
                      onChange={(e) => setDepositoDestino(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-white border border-[var(--color-neutral-border)] rounded-[8px] pl-4 pr-10 text-[14px] font-semibold text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] appearance-none shadow-sm"
                    >
                      <option
                        value=""
                        disabled
                        className="text-[var(--color-neutral-text-muted)]"
                      >
                        Seleccione destino...
                      </option>
                      {depositosRaw?.map((dep) => (
                        <option
                          key={dep.codigoSecuencial}
                          value={dep.codigoSecuencial}
                          disabled={
                            dep.codigoSecuencial?.toString() === depositoOrigen
                          }
                          className="text-[var(--color-neutral-text-main)] disabled:opacity-30 disabled:text-[var(--color-neutral-text-muted)]"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-[var(--color-neutral-text-muted)]" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Cantidad Input Enorme */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase ml-1 flex justify-between items-end">
                <span>
                  Cantidad a {modo === "ajuste" ? "Modificar" : "Transferir"}
                </span>
              </label>
              <div
                className={`relative flex items-center justify-center bg-gray-50 border border-[var(--color-neutral-border)] rounded-[12px] p-2 focus-within:border-[var(--color-brand-primary)] shadow-inner transition-colors`}
              >
                <div
                  className={`px-4 text-3xl font-black ${modo === "transferencia" ? "text-blue-500" : tipoAjuste === "agregar" ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {modo === "transferencia"
                    ? "⇋"
                    : tipoAjuste === "agregar"
                      ? "+"
                      : "-"}
                </div>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  step="1"
                  placeholder="0"
                  max={modo === "transferencia" ? stockOrigenActual : undefined} // Sugerido max en transfer
                  disabled={isPending}
                  className="w-full bg-transparent text-center text-[32px] font-bold text-[var(--color-neutral-text-main)] focus:outline-none py-4"
                />
                <div className="px-4 text-[13px] font-bold uppercase text-[var(--color-neutral-text-muted)]">
                  {fila.unidadMedida || "UNI"}
                </div>
              </div>
              {modo === "transferencia" &&
                Number(cantidad) > stockOrigenActual && (
                  <p className="text-[12px] text-red-700 font-semibold ml-1">
                    La cantidad supera el stock actual disponible en el origen.
                  </p>
                )}
            </div>

            {/* Previsualización del cálculo si seleccionó cantidad */}
            {modo === "ajuste" && depositoSeleccionado && cantidad && (
              <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-[8px] border border-[var(--color-neutral-border)]">
                <span className="text-[12px] uppercase font-semibold text-[var(--color-neutral-text-muted)]">
                  Act:{" "}
                  <b className="text-[15px] font-bold text-[var(--color-neutral-text-main)]">
                    {stockActualCalculado}
                  </b>
                </span>
                <ArrowRight size={14} className="text-[var(--color-neutral-text-muted)]" />
                <span className="text-[12px] uppercase font-semibold text-[var(--color-neutral-text-muted)]">
                  Post:{" "}
                  <b
                    className={`text-[17px] font-bold ${proximoStock < 0 ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {proximoStock}
                  </b>
                </span>
              </div>
            )}

            {/* Observación */}
            <div className="space-y-1 pt-2">
              <label className="text-[13px] font-semibold text-[var(--color-neutral-text-muted)] uppercase flex items-center gap-1.5 ml-1">
                <Info size={14} className="text-[var(--color-neutral-text-muted)]" /> Observación
                (Opcional)
              </label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escribe motivos de la operación..."
                disabled={isPending}
                rows={2}
                className="w-full bg-white border border-[var(--color-neutral-border)] rounded-[8px] p-3 text-[13px] text-[var(--color-neutral-text-main)] focus:outline-none focus:border-[var(--color-brand-primary)] resize-none shadow-sm"
              />
            </div>
          </form>
        </div>

        {/* Footer Flotante Interno */}
        <div className="p-6 md:pb-6 pb-20 border-t border-[var(--color-neutral-border)] bg-gray-50/80 backdrop-blur-md shrink-0">
          <button
            type="submit"
            form="stock-drawer-form"
            disabled={
              isPending ||
              !cantidad ||
              (modo === "ajuste" && !depositoSeleccionado) ||
              (modo === "transferencia" &&
                (!depositoOrigen ||
                  !depositoDestino ||
                  Number(cantidad) > stockOrigenActual))
            }
            className={`
                            w-full h-12 rounded-[10px] text-[14px] font-semibold text-white flex items-center justify-center gap-2 shadow-sm transition-colors
                            ${
                              !cantidad ||
                              (modo === "ajuste" && !depositoSeleccionado) ||
                              (modo === "transferencia" &&
                                (!depositoOrigen ||
                                  !depositoDestino ||
                                  Number(cantidad) > stockOrigenActual))
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : modo === "transferencia"
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : tipoAjuste === "agregar"
                                    ? "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]"
                                    : "bg-rose-600 hover:bg-rose-700"
                            }
                        `}
          >
            {isPending ? (
              <>
                <svg
                  className=" h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Procesando...</span>
              </>
            ) : (
              <span>
                {modo === "transferencia"
                  ? "Confirmar Transferencia"
                  : tipoAjuste === "agregar"
                    ? "Confirmar Ingreso"
                    : "Confirmar Egreso"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

function ChevronDown(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

export default DrawerActualizarStock;
