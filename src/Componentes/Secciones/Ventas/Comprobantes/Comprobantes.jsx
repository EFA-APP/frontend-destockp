/**
 * Comprobantes.jsx
 *
 * Componente principal de Facturación / Punto de Venta.
 * Ahora actúa como una "Cápsula Visual" (Shell) que delega toda la lógica pesada
 * al hook personalizado 'useComprobantes'.
 */
import { useCallback, useEffect } from "react";
import { useComprobantes } from "./hooks/useComprobantes";
import { getPrecio, calcularTotalItem } from "./utils/fiscal.utils";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalConfirmacionCobro from "./ModalConfirmacionCobro";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import { formatPrice, formatNumber } from "../../../../utils/formatters";
import {
  ComprobanteIcono,
  DineroIcono,
  NuevoContactoIcono,
  BuscadorIcono,
} from "../../../../assets/Icons";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import { Link, X } from "lucide-react";

// Sub-componentes
import BusquedaProducto from "./BusquedaProducto";
import DataTable from "../../../UI/DataTable/DataTable";
import { ColumnasTicket } from "./ColumnasTicket";
import ModalErrorContabilidad from "../../../Modales/Sistema/ModalErrorContabilidad";

const ComprobantesSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row overflow-hidden ">
    <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)] bg-[var(--fill2)]">
      <div className="shrink-0 p-4">
        <div className="h-12 rounded-md bg-black/10" />
      </div>
      <div className="flex-1 p-2">
        <div className="h-full rounded-md bg-black/5" />
      </div>
    </div>
    <div className="w-full md:w-[380px] shrink-0 p-4 bg-[#0a0a0a] border-l border-[var(--border-subtle)]">
      <div className="h-28 rounded-md bg-black/10 mb-4" />
      <div className="h-40 rounded-md bg-black/5 mb-4" />
      <div className="h-40 rounded-md bg-black/5" />
    </div>
  </div>
);

const Comprobantes = () => {
  // Inyección de lógica mediante Hook Maestro
  // Si necesitas añadir un nuevo estado o cálculo, edita './hooks/useComprobantes.js'
  const {
    // Datos y Totales
    items,
    totales,
    productos,
    cargandoProductos,
    tiposComprobante,

    // Captura de productos
    codigoBusqueda,
    setCodigoBusqueda,
    cantidadInput,
    setCantidadInput,
    mostrarDropdownProducto,
    setMostrarDropdownProducto,
    highlightedIndex,
    setHighlightedIndex,
    busquedaClaveProducto,
    setBusquedaClaveProducto,
    // Configuraciones de precio
    columnaPrecioSeleccionada,
    setColumnaPrecioSeleccionada,
    camposDinamicos,
    cargandoConfigs,
    // Estados fiscales (ID de AFIP)
    tipoDocumento,
    setTipoDocumento,
    enBlanco,
    setEnBlanco,
    aplicaIva,
    // Métodos y clientes
    clienteSeleccionado,
    setClienteSeleccionado,
    busquedaCliente,
    setBusquedaCliente,
    mostrarDropdownCliente,
    setMostrarDropdownCliente,
    condicionVenta,
    setCondicionVenta,
    entidades,
    handleClienteKeyDown,
    clientesFiltrados,
    highlightedIndexCliente,
    observaciones,
    setObservaciones,
    // Notas de crédito / Comprobantes asociados
    comprobanteAsociado,
    setComprobanteAsociado,
    // Pagos multiples
    listaPagos,
    nuevoPago,
    setNuevoPago,
    agregarPago,
    eliminarPago,
    vuelto,
    // UI Local
    mostrarPreview,
    setMostrarPreview,
    unidadLocal,
    setUnidadLocal,
    // Referencias de teclado
    inputCodigoRef,
    inputCantidadRef,
    // Manejadores de eventos
    agregarItem,
    eliminarItem,
    actualizarItem,
    handleCodigoKeyDown,
    handleFinalizar,
    confirmarVentaFinal,
    cargandoCobro,
    paso,
    setPaso,
    siguientePaso,
    anteriorPaso,
    // Modos de Ajuste
    esNotaCreditoNav,
    esNotaDebitoNav,
    // Manual
    nombreManual,
    setNombreManual,
    precioManual,
    setPrecioManual,
    mostrandoManual,
    setMostrandoManual,
    agregarItemManual,
    // Contactos
    mostrarFormularioContacto,
    setMostrarFormularioContacto,
    puedeHacerFiscal,
    modalContabilidad,
    setModalContabilidad,
  } = useComprobantes();

  const { tieneAccion } = usePermisosDeUsuario();

  // === EFECTO: Atajos de Teclado Globales ===
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // F1-F4 para navegación rápida
      if (e.key === "F1") {
        e.preventDefault();
        setPaso(1);
      }
      if (e.key === "F2") {
        e.preventDefault();
        setPaso(2);
      }
      if (e.key === "F3") {
        e.preventDefault();
        setPaso(3);
      }
      if (e.key === "F4") {
        e.preventDefault();
        setPaso(4);
      }

      // Ctrl + Enter para Siguiente
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        siguientePaso();
      }

      // Escape para volver
      if (e.key === "Escape" && paso > 1) {
        anteriorPaso();
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [paso, siguientePaso, anteriorPaso, setPaso]);
  const noopProductoEncontrado = useCallback(() => {}, []);
  const cargandoInicial = cargandoConfigs && items.length === 0;
  return (
    <div className="flex flex-col md:h-[calc(100vh-56px)] w-full p-2 md:p-4 md:overflow-hidden min-h-0">
      {/* 1. SECCIÓN: CABECERA */}
      <EncabezadoSeccion
        ruta={"Comprobantes"}
        icono={<ComprobanteIcono />}
        volver={true}
      />

      <ModalErrorContabilidad
        isOpen={modalContabilidad.show}
        onClose={() =>
          setModalContabilidad({ ...modalContabilidad, show: false })
        }
        mensaje={modalContabilidad.message}
        modulo="VENTAS"
      />

      {/* BANNER DE COMPROBANTE ASOCIADO */}
      {comprobanteAsociado && (
        <div className="max-w-2xl mx-auto w-full px-4 md:px-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Link size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest leading-none mb-1">
                  {esNotaCreditoNav
                    ? "Emitiendo Nota de Crédito para"
                    : esNotaDebitoNav
                      ? "Emitiendo Nota de Débito para"
                      : "Emitiendo Pago para"}
                </span>
                <span className="text-[16px] font-black text-amber-900 tracking-tight leading-none">
                  Comprobante {comprobanteAsociado}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setComprobanteAsociado("");
              }}
              className="w-8 h-8 flex items-center justify-center bg-amber-100 hover:bg-rose-50 text-amber-700 hover:text-rose-500 rounded-full transition-all group"
              title="Desvincular comprobante"
            >
              <X
                size={16}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: STEPPER (Progreso) */}
      <div className="flex mt-8 items-center justify-between px-1 mb-2  relative max-w-2xl mx-auto w-full md:px-4  md:mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/5 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[var(--primary)] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((paso - 1) / 3) * 100}%` }}
        />

        {[1, 2, 3, 4].map((s) => (
          <button
            key={s}
            onClick={() => items.length > 0 && setPaso(s)}
            className={`relative z-10 w-9 h-9 md:w-10 md:h-10 rounded-md flex items-center justify-center border-2 transition-all duration-300 ${
              paso === s
                ? "bg-gray-200 border-[var(--primary)] text-black font-semibold scale-110 shadow-lg shadow-[var(--primary)]/10"
                : paso > s
                  ? "bg-emerald-500 border-emerald-500 text-black"
                  : "bg-[var(--surface)] border-black/10 text-[var(--text-muted)]"
            }`}
          >
            {paso > s ? "✓" : s}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest whitespace-nowrap text-[var(--border-muted)] hidden sm:block">
              {s === 1
                ? "Productos"
                : s === 2
                  ? "Fiscal"
                  : s === 3
                    ? "Cliente"
                    : "Pago"}
            </span>
          </button>
        ))}
      </div>

      {/* 3. CUERPO: CAPTURA Y TICKET (IZQUIERDA) + PANEL DE PAGO (DERECHA) */}
      {cargandoInicial ? (
        <ComprobantesSkeleton />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden mx-auto w-full md:px-4 mt-4 min-h-0">
          {/* PASO 1: AGREGAR PRODUCTOS */}
          {paso === 1 && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 pr-1 pb-4 md:pb-0 min-h-0 overflow-hidden">
              <div className="flex flex-col gap-0.5 mb-0.5">
                <div className="flex justify-between items-center bg-[var(--surface-hover)] p-3 rounded-md border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-[14px] font-black text-black uppercase tracking-widest leading-none mb-1">
                        Productos
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setItems([])}
                      disabled={items.length === 0}
                      className={`px-4 py-2.5 rounded-md text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${items.length > 0 ? "bg-white text-rose-500 border-rose-500 hover:bg-rose-50" : "bg-black/5 text-black/20 border-black/5 cursor-not-allowed"}`}
                    >
                      Vaciar
                    </button>
                    <button
                      onClick={() => setMostrandoManual(!mostrandoManual)}
                      className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm active:scale-95 ${mostrandoManual ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-black text-white hover:bg-black/90"}`}
                    >
                      {mostrandoManual ? "✕ Cancelar" : "+ Item Manual"}
                    </button>
                  </div>
                </div>

                {mostrandoManual ? (
                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-b-md animate-in zoom-in-95 duration-300">
                    <div className="flex-[2] space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-rose-500 ml-1">
                        Descripción del Item
                      </label>
                      <input
                        autoFocus
                        type="text"
                        value={nombreManual}
                        onChange={(e) => setNombreManual(e.target.value)}
                        placeholder="Ej: Servicio Especial, Envío..."
                        className="w-full h-12 bg-white border border-rose-200 rounded-md px-4 font-bold text-black focus:border-rose-500 outline-none shadow-sm placeholder:opacity-30 uppercase text-xs"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-rose-500 ml-1">
                        Precio Unitario
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-rose-300">
                          $
                        </span>
                        <input
                          type="number"
                          value={precioManual}
                          onChange={(e) => setPrecioManual(e.target.value)}
                          placeholder="0.00"
                          className="w-full h-12 bg-white border border-rose-200 rounded-md pl-8 pr-4 font-black text-black focus:border-rose-500 outline-none shadow-sm"
                          onKeyDown={(e) =>
                            e.key === "Enter" && agregarItemManual()
                          }
                        />
                      </div>
                    </div>
                    <button
                      onClick={agregarItemManual}
                      className="self-end h-12 px-10 bg-rose-500 text-white rounded-md font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                    >
                      Añadir
                    </button>
                  </div>
                ) : (
                  <BusquedaProducto
                    inputCodigoRef={inputCodigoRef}
                    inputCantidadRef={inputCantidadRef}
                    codigoBusqueda={codigoBusqueda}
                    setCodigoBusqueda={setCodigoBusqueda}
                    busquedaClaveProducto={busquedaClaveProducto}
                    setBusquedaClaveProducto={setBusquedaClaveProducto}
                    camposDinamicos={camposDinamicos}
                    columnaPrecioSeleccionada={columnaPrecioSeleccionada}
                    cargandoConfigs={cargandoConfigs}
                    cargandoProductos={cargandoProductos}
                    productos={productos}
                    highlightedIndex={highlightedIndex}
                    setHighlightedIndex={setHighlightedIndex}
                    setProductoEncontrado={noopProductoEncontrado}
                    mostrarDropdownProducto={mostrarDropdownProducto}
                    setMostrarDropdownProducto={setMostrarDropdownProducto}
                    handleCodigoKeyDown={handleCodigoKeyDown}
                    agregarItem={agregarItem}
                    cantidadInput={cantidadInput}
                    setCantidadInput={setCantidadInput}
                    getPrecio={getPrecio}
                    totales={totales}
                    siguientePaso={siguientePaso}
                  />
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
                <DataTable
                  datos={items.map((it, idx) => ({ ...it, _pos: idx }))}
                  columnas={ColumnasTicket({
                    actualizarItem,
                    eliminarItem,
                    calcularSubtotal: calcularTotalItem,
                    inputCodigoRef,
                  })}
                  mostrarAcciones={false}
                  emptyMessage=""
                  todasExpandidas={true}
                  llaveTituloMobile="nombre"
                />
              </div>
            </div>
          )}

          {/* PASO 2: CONFIGURACIÓN FISCAL / UNIDAD */}
          {paso === 2 && (
            <div className="mt-4 flex-1 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto w-full px-2 md:px-0 overflow-y-auto pb-20 md:pb-0">
              <div className="w-full bg-[var(--surface)] border border-black/5 rounded-md p-5 md:p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <ComprobanteIcono
                    size={24}
                    className="text-[var(--primary)]"
                  />
                  Configuración de Venta
                </h3>

                <div className="space-y-6">
                  {/* Unidad de Negocio (Paso 2 solicitado) */}
                  {entidades.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        Unidad de Negocio
                      </label>
                      <select
                        value={unidadLocal}
                        onChange={(e) => setUnidadLocal(e.target.value)}
                        className="w-full h-14 bg-black/5 border border-black/10 rounded-md px-4 font-bold text-black"
                      >
                        {entidades.map((e) => (
                          <option
                            key={e.codigoSecuencial}
                            value={e.codigoSecuencial}
                          >
                            {e.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Tipo Comprobante (Paso 3 solicitado) */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      Tipo de Comprobante
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setEnBlanco("no")}
                        className={`h-16 rounded-md font-black border transition-all ${enBlanco === "no" ? "bg-black text-white border-black" : "bg-white border-black/10 text-black/40"}`}
                      >
                        INTERNO (X)
                      </button>
                      <div className="relative group">
                        <button
                          disabled={!puedeHacerFiscal}
                          onClick={() => setEnBlanco("si")}
                          className={`w-full h-16 rounded-md font-black border transition-all ${enBlanco === "si" ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-white border-black/10 text-black/40"} ${!puedeHacerFiscal ? "cursor-not-allowed grayscale opacity-50" : ""}`}
                        >
                          FISCAL (AFIP)
                        </button>
                        {!puedeHacerFiscal && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 p-2 bg-black text-white text-[9px] font-bold rounded-md text-center shadow-xl">
                            Sin conexión ARCA configurada para esta unidad.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {tiposComprobante.length > 0 && (
                    <div className="animate-in zoom-in-95 duration-300">
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                        className="w-full h-14 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md px-4 font-bold text-black"
                      >
                        {tiposComprobante.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* BOTÓN SIGUIENTE (PASO 2) */}
                  <div className="pt-4">
                    <button
                      onClick={siguientePaso}
                      className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Continuar al Cliente
                      <span className="text-xl">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CLIENTE */}
          {paso === 3 && (
            <div className="flex-1 flex flex-col mt-4 items-center animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto w-full px-2 md:px-0 overflow-y-auto pb-20 md:pb-0">
              <div className="w-full bg-[var(--surface)] border border-black/5 rounded-md p-5 md:p-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl font-black">Seleccionar Cliente</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMostrarFormularioContacto(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-md font-black text-[10px] border border-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    >
                      <NuevoContactoIcono size={16} />+ Nuevo
                    </button>
                    <button
                      onClick={siguientePaso}
                      className="flex items-center gap-2 px-6 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      Continuar al Pago →
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)]">
                    <BuscadorIcono size={20} color={"var(--primary)"} />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => {
                      setBusquedaCliente(e.target.value);
                      setMostrarDropdownCliente(true);
                    }}
                    onKeyDown={handleClienteKeyDown}
                    placeholder="Buscar por Nombre, DNI o CUIT..."
                    className="w-full h-12 bg-black/5 border border-black/10 rounded-md pl-12 pr-4 font-bold text-black focus:outline-none focus:border-[var(--primary)]"
                  />

                  {mostrarDropdownCliente && busquedaCliente && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-black/10 rounded-md shadow-2xl z-[100] max-h-60 overflow-y-auto p-2">
                      {clientesFiltrados.map((c, i) => (
                        <div
                          key={c.codigoSecuencial}
                          onClick={() => {
                            setClienteSeleccionado(c);
                            setBusquedaCliente(
                              c.razonSocial || `${c.nombre} ${c.apellido}`,
                            );
                            setMostrarDropdownCliente(false);
                          }}
                          className={`p-4 rounded-md cursor-pointer ${highlightedIndexCliente === i ? "bg-[var(--primary)] text-black" : "hover:bg-black/5"}`}
                        >
                          <div className="font-black">
                            {c.razonSocial || `${c.nombre} ${c.apellido}`}
                          </div>
                          <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
                            {c.documento || "Sin Documento"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {clienteSeleccionado && (
                  <div className="mt-6 p-4 rounded-md bg-[var(--primary)]/5 border border-[var(--primary)]/20 flex items-center justify-between animate-in zoom-in-95">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                        Cliente Seleccionado
                      </div>
                      <div className="text-lg font-black text-black">
                        {clienteSeleccionado.razonSocial ||
                          `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setClienteSeleccionado(null)}
                      className="p-2 hover:bg-black/5 rounded-full text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {paso === 4 && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden min-h-0">
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1 pb-6 min-h-0">
                {/* 1. SELECCION DE CONDICION (IMAGEN 1) */}
                <div className="bg-white shadow-md border border-black/10 rounded-md p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-80">
                    <ComprobanteIcono size={16} />
                    <span>Condición de Venta</span>
                  </div>
                  <select
                    value={condicionVenta}
                    onChange={(e) => setCondicionVenta(e.target.value)}
                    className="w-full h-12 bg-white border border-black/10 rounded-md px-4 font-black uppercase text-xs outline-none focus:border-red-500"
                  >
                    <option value="contado">PAGO AL CONTADO</option>
                    <option value="cuenta_corriente">CUENTA CORRIENTE</option>
                  </select>
                </div>

                {/* 2. PAGOS REGISTRADOS (IMAGEN 2) */}
                <div
                  className="
                text-center h-auto flex flex-col  justify-center text-[var(--text-theme)]"
                >
                  {listaPagos.length === 0 ? (
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-40 italic ">
                      Sin Pagos Registrados
                    </span>
                  ) : (
                    <div className="space-y-2 bg-white p-2 rounded-md border border-black/10">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-80 pl-3 py-2">
                        <DineroIcono size={16} />
                        <span>4. Forma de Pago</span>
                      </div>
                      {listaPagos.map((p, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-red-50 rounded-md border border-red-100 animate-in slide-in-from-left-2"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black uppercase text-red-400">
                              {p.tipo}
                            </span>
                            <span className="text-[11px] font-bold text-black">
                              {entidades.find((e) => e.Id == p.entidadId)
                                ?.Nombre || "General"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-black">
                              {formatPrice(p.monto)}
                            </span>
                            <button
                              onClick={() => eliminarPago(i)}
                              className="text-red-500 p-1 hover:bg-red-100 rounded-full"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. FORMULARIO CARGA (IMAGEN 2) */}
                <div className="bg-white border border-black/5 rounded-md p-6 space-y-6 shadow-sm">
                  {/* Botones de Tipo con Permisos */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "EFECTIVO", label: "EFECTIVO" },
                      { id: "DEBITO", label: "DÉBITO" },
                      { id: "CREDITO", label: "CRÉDITO" },
                      { id: "TRANSFERENCIA", label: "TRANSF." },
                      { id: "CHEQUE", label: "CHEQUE" },
                    ].map((m) => {
                      const active = nuevoPago.tipo === m.id;
                      if (!tieneAccion(`PAGO_${m.id}`)) return null;

                      return (
                        <button
                          key={m.id}
                          onClick={() =>
                            setNuevoPago({ ...nuevoPago, tipo: m.id })
                          }
                          className={`h-14 w-full rounded-md font-black uppercase text-[11px] tracking-tighter transition-all border ${active ? "bg-red-600 text-white border-red-600 shadow-md scale-105" : "bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)] hover:border-[var(--primary)]/10 cursor-pointer hover:bg-[var(--primary)]/10"}`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selector de Marca / Entidad / Tipo Cheque */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nuevoPago.tipo === "CHEQUE" ? (
                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)]">
                          Naturaleza del Cheque
                        </label>
                        <select
                          value={nuevoPago.tipoCheque}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              tipoCheque: e.target.value,
                            })
                          }
                          className="w-full h-12 bg-[var(--fill)] border border-black/10 rounded-md px-4 font-bold text-black text-xs outline-none focus:border-red-500"
                        >
                          <option value="PROPIO">Cheque Propio</option>
                          <option value="TERCERO">Cheque de Tercero</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)]">
                          Marca / Tipo de Tarjeta / Banco
                        </label>
                        <select
                          value={nuevoPago.entidadId}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              entidadId: e.target.value,
                              detalles: e.target.value,
                            })
                          }
                          className="w-full h-12 bg-[var(--fill)] border border-black/10 rounded-md px-4 font-bold text-black text-xs outline-none focus:border-red-500"
                        >
                          <option value="">Seleccionar...</option>
                          {nuevoPago.tipo === "TRANSFERENCIA" ? (
                            <>
                              <option value="Mercado Pago">Mercado Pago</option>
                              <option value="Modo">Modo (Bancos)</option>
                              <option value="Naranja X">Naranja X</option>
                              <option value="Santander">Santander</option>
                              <option value="Galicia">Galicia</option>
                              <option value="BBVA">BBVA</option>
                              <option value="Macro">Macro</option>
                              <option value="Banco Nación">Banco Nación</option>
                              <option value="Banco Provincia">
                                Banco Provincia
                              </option>
                              <option value="Personal Pay">Personal Pay</option>
                              <option value="Uala">Uala</option>
                              <option value="Brubank">Brubank</option>
                              <option value="Otro">Otro (CBU / Alias)</option>
                            </>
                          ) : (
                            <>
                              <option value="Visa">Visa</option>
                              <option value="Mastercard">Mastercard</option>
                              <option value="Naranja">Naranja</option>
                              <option value="Maestro">Maestro</option>
                              <option value="Cabal">Cabal</option>
                              <option value="American Express">
                                American Express
                              </option>
                              <option value="Cordobesa">Cordobesa</option>
                              <option value="Otro">Otro</option>
                            </>
                          )}
                          {/* Mantener entidades dinámicas si existen */}
                          {entidades.map((ent) => (
                            <option key={ent.Id} value={ent.Id}>
                              {ent.Nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Inputs Adicionales para Cheque */}
                    {nuevoPago.tipo === "CHEQUE" && (
                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)]">
                          Banco Emisor
                        </label>
                        <input
                          type="text"
                          value={nuevoPago.bancoCheque}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              bancoCheque: e.target.value,
                            })
                          }
                          className="w-full h-12 bg-[var(--fill)] border border-black/10 rounded-md px-4 font-bold text-black text-xs outline-none focus:border-red-500"
                          placeholder="Ej: Banco Nación, Santander..."
                        />
                      </div>
                    )}
                  </div>

                  {/* Segunda Fila para Cheques (Nro y Vto) */}
                  {nuevoPago.tipo === "CHEQUE" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)]">
                          Número de Cheque
                        </label>
                        <input
                          type="text"
                          value={nuevoPago.numeroCheque}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              numeroCheque: e.target.value,
                            })
                          }
                          className="w-full h-12 bg-[var(--fill)] border border-black/10 rounded-md px-4 font-bold text-black text-xs outline-none focus:border-red-500"
                          placeholder="00000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)]">
                          Vencimiento / Cobro
                        </label>
                        <input
                          type="date"
                          value={nuevoPago.vencimientoCheque}
                          onChange={(e) =>
                            setNuevoPago({
                              ...nuevoPago,
                              vencimientoCheque: e.target.value,
                            })
                          }
                          className="w-full h-12 bg-[var(--fill)] border border-black/10 rounded-md px-4 font-bold text-black text-xs outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Monto y Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-black uppercase tracking-widest  text-[var(--border-muted)]">
                        Monto a Abonar
                      </label>
                      <input
                        type="number"
                        value={nuevoPago.monto}
                        onChange={(e) =>
                          setNuevoPago({ ...nuevoPago, monto: e.target.value })
                        }
                        className="w-full h-12 bg-[var(--border-subtle)] border border-black/10 rounded-md px-4 font-black text-red-600 text-lg outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-black uppercase tracking-widest  text-[var(--border-muted)]">
                        Ref. Pago (Opcional)
                      </label>
                      <input
                        type="text"
                        value={nuevoPago.referencia || ""}
                        onChange={(e) =>
                          setNuevoPago({
                            ...nuevoPago,
                            referencia: e.target.value,
                          })
                        }
                        className="w-full h-12 bg-[var(--border-subtle)] border border-black/10 rounded-md px-4 font-bold text-black outline-none placeholder:opacity-20"
                        placeholder="Protocolo/Nota"
                      />
                    </div>
                  </div>

                  <button
                    onClick={agregarPago}
                    className={`w-full h-14 rounded-md font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 border-2 ${
                      condicionVenta === "contado" && listaPagos.length === 0
                        ? "bg-red-500 text-white border-red-600 animate-pulse scale-[1.02] shadow-xl shadow-red-500/40"
                        : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <DineroIcono size={20} />+ Agregar Pago
                  </button>

                  {/* Observaciones del Comprobante */}
                  <div className="pt-4 border-t border-black/5 space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-[var(--border-muted)] flex items-center gap-2">
                      Observaciones del Comprobante (Opcional)
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas adicionales para el comprobante..."
                      className="w-full h-24 bg-black/5 border border-black/10 rounded-md p-4 font-bold text-black outline-none focus:border-[var(--primary)] resize-none"
                    />
                  </div>

                  {vuelto > 0 && (
                    <div className="p-4 bg-emerald-500 text-white rounded-md flex justify-between items-center shadow-lg shadow-emerald-500/20">
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Su Vuelto:
                      </span>
                      <span className="text-xl font-black">
                        {formatPrice(vuelto)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* RESUMEN LATERAL (FIJO EN DESKTOP) */}
              <div className="w-full md:w-[350px] shrink-0">
                <div className="text-[var(--primary)] bg-[var(--surface-hover)] rounded-md p-4 shadow-2xl sticky top-0">
                  <div className="text-[11px] text-[var(--primary)] font-black uppercase  mb-2">
                    Total a Cobrar
                  </div>
                  <div className="text-xl font-black mb-4 tracking-tighter">
                    {formatPrice(totales?.total || 0)}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-40 uppercase tracking-widest font-black text-[10px]">
                        Neto
                      </span>
                      <span className="font-bold">
                        {formatPrice(totales?.neto || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-4">
                      <span className="opacity-40 uppercase tracking-widest font-black text-[10px]">
                        IVA (21%)
                      </span>
                      <span className="font-bold">
                        {formatPrice(totales?.iva || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2">
                      <span className="text-emerald-400 uppercase tracking-widest font-black text-[10px]">
                        Total Pagos
                      </span>
                      <span className="font-black text-emerald-400">
                        {formatPrice(
                          listaPagos.reduce(
                            (acc, p) => acc + parseFloat(p.monto || 0),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleFinalizar}
                    disabled={cargandoCobro}
                    className="w-full h-20 bg-[var(--primary)]/20 border border-[var(--primary)] text-black rounded-md font-black text-xl uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20 flex items-center justify-center gap-4"
                  >
                    {cargandoCobro ? "Procesando..." : "Verificar Venta"}
                    <ComprobanteIcono size={28} />
                  </button>

                  <button
                    onClick={anteriorPaso}
                    className="w-full mt-4 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                  >
                    Volver a Cliente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL: CIERRE DE VENTA (VISTA PREVIA) */}
      <ModalConfirmacionCobro
        mostrarPreview={mostrarPreview}
        setMostrarPreview={setMostrarPreview}
        items={items}
        clienteSeleccionado={clienteSeleccionado}
        listaPagos={listaPagos}
        totales={totales}
        confirmarVentaFinal={confirmarVentaFinal}
        cargandoCobro={cargandoCobro}
        enBlanco={enBlanco}
        aplicaIva={aplicaIva}
        tipoDocumento={tipoDocumento}
        vuelto={vuelto}
      />

      {/* 5. MODAL: CREAR CONTACTO RÁPIDO */}
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
    </div>
  );
};

export default Comprobantes;
