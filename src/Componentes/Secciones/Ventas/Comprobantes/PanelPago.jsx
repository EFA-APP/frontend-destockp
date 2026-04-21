import { memo } from "react";
import {
  ComprobanteIcono,
  ArcaIcono,
  CheckIcono,
  DineroIcono,
  CuentaIcono,
  BorrarIcono,
  TarjetaIcono,
  VentasIcono,
  AgregarIcono,
  NuevoContactoIcono,
  VentasIcono as BuildingIcono, // Usaremos este como fallback si no está Building2
} from "../../../../assets/Icons";
import { useState } from "react";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import SelectorComprobantesModal from "./SelectorComprobantesModal";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { Building2 } from "lucide-react";

const PanelPago = ({
  tabActiva,
  enBlanco,
  setEnBlanco,
  tipoDocumento,
  setTipoDocumento,
  aplicaIva,
  setAplicaIva,
  metodoPago,
  setMetodoPago,
  busquedaCliente,
  setBusquedaCliente,
  clienteSeleccionado,
  setClienteSeleccionado,
  mostrarDropdownCliente,
  setMostrarDropdownCliente,
  clientes,
  condicionVenta,
  setCondicionVenta,
  busquedaFactura,
  setBusquedaFactura,
  comprobanteAsociado,
  setComprobanteAsociado,
  mostrarDropdownFactura,
  setMostrarDropdownFactura,
  facturas,
  totales,
  handleFacturar,
  items,
  tiposComprobante = [],
  cargandoVouchers,
  usuario = {},
  // Nuevos props para pagos multiples
  listaPagos = [],
  nuevoPago = {},
  setNuevoPago,
  agregarPago,
  agregarPagoConVuelto,
  eliminarPago,
  entidades = [],
  entidadSeleccionada,
  setEntidadSeleccionada,
  handleClienteKeyDown,
  clientesFiltrados = [],
  highlightedIndexCliente,
  observaciones = "",
  setObservaciones,
  unidadLocal,
  setUnidadLocal,
  vuelto = 0,
}) => {
  const { tieneAccion } = usePermisosDeUsuario();
  const [mostrarFormularioContacto, setMostrarFormularioContacto] =
    useState(false);
  const [mostrarSelectorFactura, setMostrarSelectorFactura] = useState(false);
  const isArca = usuario?.conexionArca || usuario?.configuracionArca?.activo;
  const esTipoA = [1, 2, 3, 4, 5].includes(Number(tipoDocumento));

  return (
    <div
      className={`w-full md:w-[380px] shrink-0 bg-[#0a0a0a] border-l border-[var(--border-subtle)] flex flex-col shadow-[-10px_0_20px_max(rgba(0,0,0,0.2))] z-20 ${tabActiva !== "pago" ? "hidden md:flex" : "flex"}`}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-3 md:pb-1 flex flex-col gap-4">
        {/* 0. SELECTOR DE UNIDAD DE NEGOCIO (LOCAL) */}
        <div className="bg-[var(--surface-active)] p-4 rounded-md border border-[var(--primary)]/20 space-y-3 shadow-lg shadow-[var(--primary)]/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <Building2 size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Unidad de Negocio
              </h3>
            </div>
            <TieneAccion accion="CAMBIAR_UNIDAD_COMPROBANTE">
              <span className="text-[8px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded uppercase tracking-tighter border border-[var(--primary)]/20">
                Editable
              </span>
            </TieneAccion>
          </div>

          <TieneAccion accion="CAMBIAR_UNIDAD_COMPROBANTE">
            <select
              value={unidadLocal}
              onChange={(e) => setUnidadLocal(Number(e.target.value))}
              className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-xs font-black text-white focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer appearance-none uppercase tracking-tighter"
            >
              {usuario?.unidadesNegocio?.map((un) => (
                <option
                  key={un.codigoSecuencial}
                  value={un.codigoSecuencial}
                  className="bg-[#151515]"
                >
                  {un.nombre}
                </option>
              ))}
            </select>
          </TieneAccion>

          {/* Si no tiene permiso, solo mostramos el nombre de la unidad actual como label informativa */}
          <div className="flex items-center">
            {!tieneAccion("CAMBIAR_UNIDAD_COMPROBANTE") && (
              <div className="w-full px-3 py-2.5 bg-[var(--surface)]/50 border border-white/5 rounded-md text-xs font-bold text-white/60 select-none">
                {usuario?.unidadesNegocio?.find(
                  (un) => un.codigoSecuencial === unidadLocal,
                )?.nombre || "Unidad Actual"}
              </div>
            )}
          </div>

          <p className="text-[9px] text-[var(--text-muted)] font-medium leading-tight">
            Este cambio es local para este comprobante y no afecta al resto de
            la aplicación.
          </p>
        </div>
        {/* 1. CONFIG FISCAL RAPIDA (Solo si es ARCA) */}
        {isArca && (
          <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
              <ComprobanteIcono size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Documento
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnBlanco("si")}
                className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "si" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
              >
                {enBlanco === "si" && <ArcaIcono size={14} />}{" "}
                {isArca ? "FACTURA (ARCA)" : "FACTURA (PROPIA)"}
              </button>
              <button
                type="button"
                onClick={() => setEnBlanco("no")}
                className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "no" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
              >
                {enBlanco === "no" && <CheckIcono size={14} />} COMPROBANTE X
              </button>
            </div>

            {/* SELECTOR DINÁMICO DE COMPROBANTES (DROPDOWN) */}
            {enBlanco === "si" && (
              <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                {cargandoVouchers ? (
                  <div className="w-full h-10 bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md animate-pulse" />
                ) : (
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                    className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer appearance-none uppercase tracking-tighter shadow-inner pr-10"
                  >
                    {tiposComprobante.length === 0 && (
                      <option value="">No hay comprobantes habilitados</option>
                    )}
                    {tiposComprobante.map((doc) => (
                      <option
                        key={doc.id}
                        value={doc.id}
                        className="bg-[#151515] text-white py-2"
                      >
                        {doc.label}
                      </option>
                    ))}
                  </select>
                )}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none group-focus-within:text-[var(--primary)] transition-colors">
                  <ComprobanteIcono size={12} />
                </div>
              </div>
            )}

            {enBlanco === "si" && tipoDocumento !== "factura" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {!comprobanteAsociado ? (
                  <button
                    type="button"
                    onClick={() => setMostrarSelectorFactura(true)}
                    className="w-full h-11 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md flex items-center justify-center gap-2 text-[var(--primary)] text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/20 transition-all active:scale-95"
                  >
                    <AgregarIcono size={18} />
                    Vincular Comprobante
                  </button>
                ) : (
                  <div className="bg-[var(--surface-active)] border border-[var(--primary)]/30 p-3 rounded-md flex items-center justify-between group">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-[var(--primary)] uppercase tracking-widest">
                        Comprobante Vinculado
                      </span>
                      <span className="text-xs font-black text-white">
                        Nro: {comprobanteAsociado}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setComprobanteAsociado("");
                        setBusquedaFactura("");
                      }}
                      className="p-1.5 rounded-md text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      title="Desvincular"
                    >
                      <BorrarIcono size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* El checkbox de aplicar IVA fue removido para cálculo automático por sesión. */}
          </div>
        )}

        {/* 2. MÉTODOS DE PAGO MULTIPLES */}
        <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <div className="flex items-center gap-2 mb-1">
              <DineroIcono size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Pagos Realizados
              </h3>
            </div>
            {listaPagos.length > 0 && (
              <span className="text-[10px] font-black text-emerald-500">
                $
                {listaPagos
                  .reduce((acc, p) => acc + p.monto, 0)
                  .toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            )}
          </div>

          {/* LISTA DE PAGOS AGREGADOS */}
          <div className="space-y-2">
            {listaPagos.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-[var(--surface-active)] p-2 rounded-md border border-white/5 animate-in slide-in-from-right-2 duration-200"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">
                    {p.metodo} {p.detalles ? `• ${p.detalles}` : ""}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">
                    {p.referencia || "Sin referencia"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-400">
                    $
                    {p.monto.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => eliminarPago(idx)}
                    className="text-red-500/50 hover:text-red-500 transition-colors"
                  >
                    <BorrarIcono size={14} />
                  </button>
                </div>
              </div>
            ))}

            {listaPagos.length === 0 && (
              <div className="text-center py-4 border border-dashed border-white/10 rounded-md">
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-tighter">
                  Sin pagos registrados
                </p>
              </div>
            )}
          </div>

          {/* FORMULARIO PARA AGREGAR PAGO */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {["efectivo", "debito", "credito", "transferencia"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setNuevoPago((prev) => ({
                      ...prev,
                      metodo: m,
                      detalles:
                        m === "transferencia"
                          ? "Mercado Pago"
                          : m === "credito" || m === "debito"
                            ? "Visa"
                            : "",
                    }));
                  }}
                  className={`py-2 rounded-md text-[10px] font-black border transition-all ${nuevoPago.metodo === m ? "bg-[var(--primary)] text-black border-[var(--primary)]" : "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-hover)]"}`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>

            {/* DETALLES ESPECIFICOS (TARJETAS / BILLETERAS) */}
            {(nuevoPago.metodo === "transferencia" ||
              nuevoPago.metodo === "credito" ||
              nuevoPago.metodo === "debito") && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                  {nuevoPago.metodo === "transferencia"
                    ? "Billetera / Banco Destino"
                    : "Marca / Tipo de Tarjeta"}
                </label>
                <select
                  value={nuevoPago.detalles}
                  onChange={(e) =>
                    setNuevoPago((prev) => ({
                      ...prev,
                      detalles: e.target.value,
                    }))
                  }
                  className="w-full bg-[var(--surface-active)] border border-white/10 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)]"
                >
                  {nuevoPago.metodo === "transferencia" ? (
                    <>
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Naranja X">Naranja X</option>
                      <option value="Personal Pay">Personal Pay</option>
                      <option value="Uala">Uala</option>
                      <option value="Modo">Modo</option>
                      <option value="Brubank">Brubank</option>
                      <option value="Transferencia Bancaria">
                        Transferencia Bancaria
                      </option>
                      <option value="Otro">Otro</option>
                    </>
                  ) : (
                    <>
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Maestro">Maestro</option>
                      <option value="Cabal">Cabal</option>
                      <option value="American Express">American Express</option>
                      <option value="Naranja">Naranja</option>
                      <option value="Otro">Otro</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* FLUJO DE COBRO EN EFECTIVO (REDISEÑADO) */}
            {nuevoPago.metodo === "efectivo" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-[#151515] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                      Dinero Recibido
                    </label>
                    <span className="text-emerald-500/50">
                      <DineroIcono size={14} />
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="Ej: 5000"
                    value={nuevoPago.pagaCon || ""}
                    onChange={(e) =>
                      setNuevoPago((prev) => ({
                        ...prev,
                        pagaCon: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full bg-transparent border-none p-0 text-3xl font-black text-white focus:outline-none focus:ring-0 placeholder:text-white/5"
                  />

                  {nuevoPago.pagaCon > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40 font-bold uppercase tracking-wider">
                          A cobrar:
                        </span>
                        <span className="text-white font-black">
                          $
                          {Math.min(
                            nuevoPago.pagaCon,
                            totales.total -
                              listaPagos.reduce((acc, p) => acc + p.monto, 0),
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest italic">
                          Vuelto a entregar:
                        </span>
                        <span className="text-emerald-500 text-lg font-black tabular-nums">
                          $
                          {Math.max(
                            0,
                            nuevoPago.pagaCon -
                              (totales.total -
                                listaPagos.reduce(
                                  (acc, p) => acc + p.monto,
                                  0,
                                )),
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const restante =
                      totales.total -
                      listaPagos.reduce((acc, p) => acc + p.monto, 0);
                    const aCobrar = Math.min(nuevoPago.pagaCon, restante);
                    const vueltoCalculado = Math.max(
                      0,
                      nuevoPago.pagaCon - restante,
                    );
                    agregarPagoConVuelto(
                      nuevoPago.pagaCon,
                      aCobrar,
                      vueltoCalculado,
                    );
                  }}
                  disabled={nuevoPago.pagaCon <= 0}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckIcono size={16} />
                  Registrar Cobro y Vuelto
                </button>
              </div>
            ) : (
              /* OTROS MÉTODOS DE PAGO (FLUJO ESTÁNDAR) */
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                      Monto a abonar
                    </label>
                    <input
                      type="number"
                      value={nuevoPago.monto}
                      onChange={(e) =>
                        setNuevoPago((prev) => ({
                          ...prev,
                          monto: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-[var(--surface-active)] border border-white/10 rounded-md px-3 py-2 text-sm font-black text-[var(--primary)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 block">
                      Ref. (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Protocolo/Nota"
                      value={nuevoPago.referencia}
                      onChange={(e) =>
                        setNuevoPago((prev) => ({
                          ...prev,
                          referencia: e.target.value,
                        }))
                      }
                      className="w-full bg-[var(--surface-active)] border border-white/10 rounded-md px-3 py-2 text-[11px] font-bold text-white focus:outline-none focus:border-[var(--primary)] placeholder:opacity-20"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={agregarPago}
                  disabled={nuevoPago.monto <= 0}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] font-black uppercase tracking-widest text-[var(--primary)] transition-all active:scale-95 disabled:opacity-30"
                >
                  + AGREGAR PAGO
                </button>
              </div>
            )}
          </div>

          {/* BALANCE RESTANTE */}
          {totales.total - listaPagos.reduce((acc, p) => acc + p.monto, 0) >
            0.01 && (
            <div
              className={`border p-2 rounded-md flex justify-between items-center ${condicionVenta === "cuenta_corriente" ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20 animate-pulse"}`}
            >
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${condicionVenta === "cuenta_corriente" ? "text-blue-400" : "text-amber-500"}`}
              >
                {condicionVenta === "cuenta_corriente"
                  ? "A enviar a deuda:"
                  : "Falta Abonar:"}
              </span>
              <span
                className={`text-xs font-black ${condicionVenta === "cuenta_corriente" ? "text-blue-400" : "text-amber-500"}`}
              >
                $
                {(
                  totales.total -
                  listaPagos.reduce((acc, p) => acc + p.monto, 0)
                ).toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}
        </div>

        {/* 3. CLIENTE */}
        <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <div className="flex items-center gap-2 mb-1">
              <CuentaIcono size={16} />
              <h3 className="text-[11px] font-black uppercase tracking-widest">
                Cliente
              </h3>
            </div>
            <button
              onClick={() => setMostrarFormularioContacto(true)}
              className="flex items-center cursor-pointer gap-1.5 px-2 py-1 rounded bg-[var(--primary)] text-white text-[9px] font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/10"
              title="Registrar Nuevo Cliente"
            >
              <NuevoContactoIcono size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {/* Selector de Entidad */}
            {/* {entidades.length > 0 && (
              <select
                value={entidadSeleccionada}
                onChange={(e) => setEntidadSeleccionada(e.target.value)}
                className="w-full bg-[var(--surface-active)] border border-white/5 rounded-md px-3 py-2 text-xs font-black text-white/70 focus:outline-none focus:border-[var(--primary)] uppercase tracking-wider"
              >
                <option value="">TODAS LAS ENTIDADES</option>
                {entidades.map((e) => (
                  <option key={e.codigoSecuencial || e.id} value={e.clave}>
                    {e.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            )} */}

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar Cliente..."
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value);
                  setClienteSeleccionado("");
                  setMostrarDropdownCliente(true);
                }}
                onFocus={() => setMostrarDropdownCliente(true)}
                onBlur={() =>
                  setTimeout(() => setMostrarDropdownCliente(false), 200)
                }
                onKeyDown={handleClienteKeyDown}
                className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />

              {!clienteSeleccionado && !busquedaCliente && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[var(--text-muted)] pointer-events-none bg-[var(--surface-active)] pl-2">
                  Consumidor Final
                </span>
              )}

              {(clienteSeleccionado || busquedaCliente) && (
                <button
                  onClick={() => {
                    setClienteSeleccionado("");
                    setBusquedaCliente("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title="Quitar cliente (Consumidor Final)"
                >
                  <BorrarIcono size={16} />
                </button>
              )}

              {mostrarDropdownCliente && busquedaCliente && (
                <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1 flex flex-col">
                  {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((c, idx) => (
                      <div
                        key={c.codigoSecuencial || c.id}
                        onClick={() => {
                          setClienteSeleccionado(c);
                          setBusquedaCliente(
                            `${c.razonSocial || c.nombre + " " + c.apellido}`,
                          );
                          setMostrarDropdownCliente(false);
                        }}
                        className={`px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer rounded-md font-medium flex justify-between items-center transition-colors ${
                          highlightedIndexCliente === idx
                            ? "bg-[var(--primary)] text-white"
                            : ""
                        }`}
                      >
                        <div>
                          <span className="font-bold opacity-50 mr-2 text-[10px]">
                            [{String(c.codigoSecuencial).padStart(4, "0")}]
                          </span>
                          <span>
                            {c.razonSocial || `${c.nombre} ${c.apellido}`}
                          </span>
                        </div>

                        {/* Saldo de Cuenta Corriente */}
                        {c?.atributos?.saldo !== undefined &&
                          c?.atributos?.saldo !== 0 && (
                            <span
                              className={`text-[10px] font-black tracking-widest uppercase ${c?.atributos?.saldo > 0 ? "text-rose-400 group-hover:text-rose-200" : "text-emerald-400"}`}
                            >
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                              }).format(c?.atributos?.saldo)}
                            </span>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                      No se encontraron clientes
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-white">
              <TarjetaIcono size={14} />
              <select
                value={condicionVenta}
                onChange={(e) => setCondicionVenta(e.target.value)}
                className="bg-transparent text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider focus:outline-none cursor-pointer p-0 m-0 border-none flex-1"
              >
                <option value="contado" className="bg-[#151515]">
                  PAGO AL CONTADO
                </option>
                <option value="cuenta_corriente" className="bg-[#151515]">
                  CUENTA CORRIENTE
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. OBSERVACIONES */}
        <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3 mb-2">
          <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
            <VentasIcono size={16} />
            <h3 className="text-[11px] font-black uppercase tracking-widest">
              Notas / Observaciones
            </h3>
          </div>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe una nota interna o para el PDF..."
            className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[11px] font-medium text-white/80 focus:outline-none focus:border-[var(--primary)] resize-none min-h-[60px] placeholder:opacity-20 custom-scrollbar"
          />
        </div>
      </div>

      {/* FOOTER TOTALES Y BOTÓN (Solo Desktop) */}
      <div className="hidden md:flex shrink-0 p-5 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex-col gap-4">
        {esTipoA && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <span>Subtotal (Neto)</span>
              <span>
                $
                {totales.subtotal.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {enBlanco === "si" && aplicaIva && (
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Impuestos (IVA)</span>
                <span>
                  $
                  {totales.iva.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-between px-1">
          <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">
            Total
          </span>
          <span className="text-2xl font-black tabular-nums tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            $
            {totales.total.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <button
          onClick={handleFacturar}
          disabled={
            items.length === 0 ||
            (condicionVenta === "contado" &&
              Math.abs(
                totales.total - listaPagos.reduce((acc, p) => acc + p.monto, 0),
              ) > 0.01)
          }
          className={`w-full h-14 rounded-md flex items-center justify-center gap-3 font-black text-xl uppercase tracking-widest transition-all duration-300 shadow-xl border
                    ${
                      items.length === 0 ||
                      (condicionVenta === "contado" &&
                        Math.abs(
                          totales.total -
                            listaPagos.reduce((acc, p) => acc + p.monto, 0),
                        ) > 0.01)
                        ? "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent cursor-not-allowed opacity-50"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
                    }
                `}
        >
          {items.length > 0 && <VentasIcono size={24} />}
          COBRAR (F2)
        </button>
      </div>

      {/* MODAL CREAR CONTACTO RÁPIDO */}
      {mostrarFormularioContacto && (
        <FormularioContacto
          onClose={() => setMostrarFormularioContacto(false)}
          onExito={(nuevo) => {
            setClienteSeleccionado(nuevo);
            setBusquedaCliente(
              nuevo.razonSocial || `${nuevo.nombre} ${nuevo.apellido}`,
            );
            setMostrarFormularioContacto(false);
          }}
        />
      )}

      {/* MODAL SELECCIONAR COMPROBANTE ASOCIADO */}
      <SelectorComprobantesModal
        open={mostrarSelectorFactura}
        onClose={() => setMostrarSelectorFactura(false)}
        onSelect={(f) => {
          const ptoVta = String(f.puntoVenta || 1).padStart(5, "0");
          const nro = String(f.numeroComprobante || 0).padStart(8, "0");
          const nroCompleto = `${ptoVta}-${nro}`;
          setComprobanteAsociado(nroCompleto);
          setBusquedaFactura(nroCompleto);
        }}
      />
    </div>
  );
};

export default memo(PanelPago);
