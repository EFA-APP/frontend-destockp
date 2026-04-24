import React, { useState, useEffect } from "react";
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

  // Obtener Stock actual según useDepositoUI
  const stockActualCalculado = Number(fila[`dep_${depositoSeleccionado}`]) || 0;
  const proximoStock = cantidad
    ? tipoAjuste === "agregar"
      ? stockActualCalculado + Number(cantidad)
      : stockActualCalculado - Number(cantidad)
    : stockActualCalculado;

  // Cálculo para transferencia
  const stockOrigenActual = Number(fila[`dep_${depositoOrigen}`]) || 0;

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

      actualizarStock(
        {
          codigoProducto: fila.codigoProducto
            ? Number(fila.codigoProducto)
            : undefined,
          codigoMateriaPrima: fila.codigoMateriaPrima
            ? Number(fila.codigoMateriaPrima)
            : undefined,
          codigoDeposito: Number(depositoSeleccionado),
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
        },
        { onSuccess: onClose },
      );
    } else {
      // Modo Transferencia
      if (!depositoOrigen || !depositoDestino || !cantidad) return;

      transferirStock(
        {
          codigoProducto: fila.codigoProducto
            ? Number(fila.codigoProducto)
            : undefined,
          codigoMateriaPrima: fila.codigoMateriaPrima
            ? Number(fila.codigoMateriaPrima)
            : undefined,
          codigoDepositoOrigen: Number(depositoOrigen),
          codigoDepositoDestino: Number(depositoDestino),
          cantidad: Number(cantidad),
          codigoUsuario: usuario?.codigoSecuencial
            ? Number(usuario.codigoSecuencial)
            : undefined,
          nombreUsuario:
            `${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim() ||
            undefined,
          observacion: observacion || undefined,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay background (blur) */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm   ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={!isPending ? onClose : undefined}
      />

      {/* Slide-over panel */}
      <div
        className={`
                relative w-full max-w-md h-full bg-[var(--surface-active)] shadow-[-10px_0_30px_max(rgba(0,0,0,0.5))] 
                border-l border-[var(--border-subtle)] flex flex-col
                transform   cubic-bezier(0.16, 1, 0.3, 1)
                ${isOpen ? "translate-x-0" : "translate-x-full"}
            `}
      >
        {/* Header Premium */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <InventarioIcono size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <p className="text-[18px] font-black text-black leading-tight uppercase tracking-tight">
                {fila.nombre}
              </p>
              <h2 className="text-[13px] text-[var(--primary-light)] font-medium uppercase tracking-widest mt-0.5">
                Operación de Stock
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-black hover:bg-black/10 "
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Sub-Header: Selector de Modo (Tabs) */}
        <div className="px-6 py-3 border-b border-black/5 bg-[var(--border-subtle)] flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setModo("ajuste")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2  ${modo === "ajuste" ? "bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--primary)] shadow-md" : "text-[var(--text-theme)] hover:bg-black/5 border border-transparent"}`}
          >
            <TrendingUp size={14} /> Ajuste manual
          </button>
          <button
            type="button"
            onClick={() => setModo("transferencia")}
            className={`flex-1 py-2 rounded-lg text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2  ${modo === "transferencia" ? "bg-blue-700/20 border border-blue-700/30 text-blue-400 shadow-md" : "text-[var(--text-theme)] hover:bg-black/5 border border-transparent"}`}
          >
            <ArrowLeftRight size={14} /> Transferencia
          </button>
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
                  <label className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-[var(--primary)]/70" />
                    Depósito
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoSeleccionado}
                      onChange={(e) => setDepositoSeleccionado(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-[var(--border-subtle)] border border-black/10 rounded-xl pl-4 pr-10 text-[16px] font-medium text-black focus:outline-none focus:border-[var(--primary)]/50 appearance-none  group-hover:border-black/20"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[var(--surface)] text-black/50"
                      >
                        Seleccione un depósito...
                      </option>
                      {depositosRaw?.map((dep) => (
                        <option
                          key={dep.codigoSecuencial}
                          value={dep.codigoSecuencial}
                          className="bg-[var(--surface)] text-black"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-black/30" />
                    </div>
                  </div>
                </div>

                {/* Tipo de Ajuste */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Tipo de Ajuste
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoAjuste("agregar")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border   relative overflow-hidden ${tipoAjuste === "agregar" ? "bg-emerald-700/10 border-emerald-700/30 text-emerald-700" : "bg-black/10 border-black/5 text-black/40 hover:bg-black/5"}`}
                    >
                      {tipoAjuste === "agregar" && (
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-700" />
                      )}
                      <TrendingUp size={22} className="mb-1.5" />
                      <span className="text-[13px]  font-black uppercase tracking-widest">
                        Aumentar
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAjuste("quitar")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border   relative overflow-hidden ${tipoAjuste === "quitar" ? "bg-red-700/10 border-red-700/30 text-red-700" : "bg-black/10 border-black/5 text-black/40 hover:bg-black/5"}`}
                    >
                      {tipoAjuste === "quitar" && (
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-red-700" />
                      )}
                      <TrendingDown size={22} className="mb-1.5" />
                      <span className="text-[13px] font-black uppercase tracking-widest">
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
                  <label className="text-[13px] font-bold text-[var(--text-theme)]/80 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-red-700" />
                    Depósito de Origen (Egreso)
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoOrigen}
                      onChange={(e) => setDepositoOrigen(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-[var(--border-subtle)] border border-black/10 rounded-xl pl-4 pr-10 text-[16px] font-medium text-black focus:outline-none focus:border-[var(--primary)]/50 appearance-none"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[var(--surface)] text-black/50"
                      >
                        Seleccione origen...
                      </option>
                      {depositosRaw?.map((dep) => (
                        <option
                          key={dep.codigoSecuencial}
                          value={dep.codigoSecuencial}
                          className="bg-[var(--surface)] text-black"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-black/30" />
                    </div>
                  </div>
                  <span className="text-[14px] font-semibold text-[var(--text-theme)] ml-1">
                    Stock actual:{" "}
                    <b className="text-[var(--primary)]">{stockOrigenActual}</b>
                  </span>
                </div>

                {/* Icono Intermedio */}
                <div className="flex justify-center -my-2">
                  <div className="w-8 h-8 rounded-full bg-blue-700/10 flex items-center justify-center border border-blue-700 text-blue-700">
                    <ArrowLeftRight
                      size={16}
                      className="rotate-90 md:rotate-0"
                    />
                  </div>
                </div>

                {/* Depósito Destino */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[var(--text-theme)]/80 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    <Database size={14} className="text-green-600" />
                    Depósito de Destino
                  </label>
                  <div className="relative group">
                    <select
                      value={depositoDestino}
                      onChange={(e) => setDepositoDestino(e.target.value)}
                      disabled={isPending}
                      className="w-full h-12 bg-[var(--border-subtle)] border border-black/10 rounded-xl pl-4 pr-10 text-[16px] font-medium text-black focus:outline-none focus:border-[var(--primary)]/50 appearance-none "
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[var(--surface)] text-black/50"
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
                          className="bg-[var(--surface)] disabled:opacity-30 text-black"
                        >
                          {dep.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-black/30" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Cantidad Input Enorme */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--text-theme)]/80 uppercase tracking-widest ml-1 flex justify-between items-end">
                <span>
                  Cantidad a {modo === "ajuste" ? "Modificar" : "Transferir"}
                </span>
              </label>
              <div
                className={`relative flex items-center justify-center bg-[var(--border-subtle)] border rounded-xl p-2  focus-within:border-[var(--primary)]/50 ${modo === "transferencia" ? "border-blue-700/10 focus-within:border-blue-700/50" : "border-black/10"}`}
              >
                <div
                  className={`px-4 text-3xl font-black ${modo === "transferencia" ? "text-blue-400" : tipoAjuste === "agregar" ? "text-emerald-700" : "text-red-700"}`}
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
                  className="w-full bg-transparent text-center text-[27px] font-black text-black focus:outline-none py-4"
                />
                <div className="px-4 text-[12px] font-bold uppercase tracking-widest text-black/20">
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
              <div className="flex items-center justify-center gap-4 bg-white/[0.02] p-3 rounded-lg border border-black/5">
                <span className="text-[12px] uppercase font-bold text-black">
                  Act:{" "}
                  <b className="text-[15px] font-black text-[var(--primary)]">
                    {stockActualCalculado}
                  </b>
                </span>
                <ArrowRight size={14} className="text-blue-700" />
                <span className="text-[12px] uppercase font-bold text-black">
                  Post:{" "}
                  <b
                    className={`text-[17px] font-black ${proximoStock < 0 ? "text-red-700" : "text-emerald-700"}`}
                  >
                    {proximoStock}
                  </b>
                </span>
              </div>
            )}

            {/* Observación */}
            <div className="space-y-1 pt-2">
              <label className="text-[13px] font-bold text-[var(--text-theme)]/80 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Info size={14} className="text-black/30" /> Observación
                (Opcional)
              </label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escribe motivos de la operación..."
                disabled={isPending}
                rows={2}
                className="w-full bg-[var(--border-subtle)] border border-black/10 rounded-xl p-3 text-sm text-black focus:outline-none focus:border-[var(--primary)]/50  resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Flotante Interno */}
        <div className="p-6 md:pb-6 pb-20 border-t border-[var(--border-subtle)] bg-[var(--primary-subtle)] shrink-0">
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
                            w-full h-14 rounded-xl text-[15px] font-black uppercase tracking-[0.1em] text-black   flex items-center justify-center gap-3 shadow-xl border cursor-pointer!
                            ${
                              !cantidad ||
                              (modo === "ajuste" && !depositoSeleccionado) ||
                              (modo === "transferencia" &&
                                (!depositoOrigen ||
                                  !depositoDestino ||
                                  Number(cantidad) > stockOrigenActual))
                                ? "bg-black/5 border-black/10 text-black/20 cursor-not-allowed"
                                : modo === "transferencia"
                                  ? "bg-gradient-to-r from-blue-600/20 to-blue-700/20 hover:to-blue-400 border-blue-700/50 shadow-blue-700/30 text-blue-600"
                                  : tipoAjuste === "agregar"
                                    ? "bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 hover:to-emerald-400 border-emerald-700 shadow-emerald-700/30 text-emerald-600"
                                    : "bg-gradient-to-r from-red-600/20 to-red-700/20 hover:to-red-400 border-red-700/50 shadow-red-700/30 text-red-600"
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
    </div>
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
