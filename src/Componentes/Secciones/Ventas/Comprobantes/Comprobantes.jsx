/**
 * Comprobantes.jsx
 * 
 * Componente principal de Facturación / Punto de Venta.
 * Ahora actúa como una "Cápsula Visual" (Shell) que delega toda la lógica pesada
 * al hook personalizado 'useComprobantes'.
 */
import { useCallback } from "react";
import { useComprobantes } from "./hooks/useComprobantes";
import { getPrecio, calcularTotalItem } from "./utils/fiscal.utils";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CarritoIcono,
  ComprobanteIcono,
  DineroIcono,
} from "../../../../assets/Icons";

// Sub-componentes
import BusquedaProducto from "./BusquedaProducto";
import TablaTicket from "./TablaTicket";
import PanelPago from "./PanelPago";
import ResumenVentaMobile from "./ResumenVentaMobile";
import ModalConfirmacionCobro from "./ModalConfirmacionCobro";

const ComprobantesSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-pulse">
    <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)] bg-[var(--fill2)]">
      <div className="shrink-0 p-4">
        <div className="h-12 rounded-md bg-white/10" />
      </div>
      <div className="flex-1 p-2">
        <div className="h-full rounded-md bg-white/5" />
      </div>
    </div>
    <div className="w-full md:w-[380px] shrink-0 p-4 bg-[#0a0a0a] border-l border-[var(--border-subtle)]">
      <div className="h-28 rounded-md bg-white/10 mb-4" />
      <div className="h-40 rounded-md bg-white/5 mb-4" />
      <div className="h-40 rounded-md bg-white/5" />
    </div>
  </div>
);

const Comprobantes = () => {
  // Inyección de lógica mediante Hook Maestro
  // Si necesitas añadir un nuevo estado o cálculo, edita './hooks/useComprobantes.js'
  const {
    // Datos y Totales
    items, totales, productos, cargandoProductos, tiposComprobante, cargandoVouchers, 
    clientes, facturas, usuario, 
    // Captura de productos
    codigoBusqueda, setCodigoBusqueda, cantidadInput, setCantidadInput, 
    mostrarDropdownProducto, setMostrarDropdownProducto, highlightedIndex, setHighlightedIndex,
    busquedaClaveProducto, setBusquedaClaveProducto, 
    // Configuraciones de precio
    columnaPrecioSeleccionada, setColumnaPrecioSeleccionada, camposDinamicos, cargandoConfigs,
    // Estados fiscales (ID de AFIP)
    tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco, aplicaIva,
    // Métodos y clientes
    metodoPago, setMetodoPago, clienteSeleccionado, setClienteSeleccionado, 
    busquedaCliente, setBusquedaCliente, mostrarDropdownCliente, setMostrarDropdownCliente, 
    condicionVenta, setCondicionVenta, entidades, entidadSeleccionada, setEntidadSeleccionada,
    handleClienteKeyDown, clientesFiltrados, highlightedIndexCliente,
    observaciones, setObservaciones,
    // Notas de crédito / Comprobantes asociados
    busquedaFactura, setBusquedaFactura, comprobanteAsociado, setComprobanteAsociado,
    mostrarDropdownFactura, setMostrarDropdownFactura, 
    // Pagos multiples
    listaPagos, nuevoPago, setNuevoPago, agregarPago, agregarPagoConVuelto, eliminarPago, vuelto,
    // UI Local
    mostrarPreview, setMostrarPreview, tabActiva, setTabActiva,
    unidadLocal, setUnidadLocal,
    // Referencias de teclado
    inputCodigoRef, inputCantidadRef,
    // Manejadores de eventos
    agregarItem, eliminarItem, actualizarItem, handleCodigoKeyDown, handleFinalizar, confirmarVentaFinal,
    cargandoCobro
  } = useComprobantes();
  const noopProductoEncontrado = useCallback(() => {}, []);
  const cargandoInicial = cargandoConfigs && items.length === 0;

  return (
    <div className="flex flex-col h-screen md:h-screen w-full bg-[var(--fill)] overflow-hidden pt-4 md:py-6 px-2">
      {/* 1. SECCIÓN: CABECERA */}
      <EncabezadoSeccion
        ruta={"Comprobantes"}
        icono={<ComprobanteIcono />}
        volver={true}
      />

      {/* 2. SECCIÓN: TABS MOBILE (Productos / Pago) */}
      <div className="md:hidden flex bg-[#080808] p-1 gap-1.5 shrink-0 mb-6 rounded-lg mx-4 border border-white/10 relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden mt-3">
        <div
          className={`absolute inset-y-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-gradient-to-br from-white/20 to-white/5 border border-white/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.05)] ${tabActiva === "productos" ? "left-1 w-[calc(50%-0.25rem)]" : "left-[50%] w-[calc(50%-0.25rem)]"}`}
        />
        <button
          onClick={() => setTabActiva("productos")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2.5 transition-all duration-300 ${tabActiva === "productos" ? "text-white scale-[1.02]" : "text-[var(--text-muted)] hover:text-white/80"}`}
        >
          <div className={`transition-all duration-300 ${tabActiva === "productos" ? "text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" : "opacity-50"}`}>
            <CarritoIcono size={18} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all ${tabActiva === "productos" ? "opacity-100" : "opacity-60"}`}>
            Productos {items.length > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--primary)] text-black">{items.length}</span>}
          </span>
        </button>
        <button
          onClick={() => setTabActiva("pago")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2.5 transition-all duration-300 ${tabActiva === "pago" ? "text-white scale-[1.02]" : "text-[var(--text-muted)] hover:text-white/80"}`}
        >
          <div className={`transition-all duration-300 ${tabActiva === "pago" ? "text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" : "opacity-50"}`}>
            <DineroIcono size={18} />
          </div>
          <span className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all ${tabActiva === "pago" ? "opacity-100" : "opacity-60"}`}>
            Pago
          </span>
        </button>
      </div>

      {/* 3. CUERPO: CAPTURA Y TICKET (IZQUIERDA) + PANEL DE PAGO (DERECHA) */}
      {cargandoInicial ? (
        <ComprobantesSkeleton />
      ) : (
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className={`flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)] bg-[var(--fill2)] ${tabActiva !== "productos" ? "hidden md:flex" : "flex"}`}>
          {/* Componente que gestiona el buscador de códigos y la cantidad */}
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
            setProductoEncontrado={noopProductoEncontrado} // Se maneja en el hook
            mostrarDropdownProducto={mostrarDropdownProducto}
            setMostrarDropdownProducto={setMostrarDropdownProducto}
            handleCodigoKeyDown={handleCodigoKeyDown}
            agregarItem={agregarItem}
            cantidadInput={cantidadInput}
            setCantidadInput={setCantidadInput}
            getPrecio={getPrecio}
          />

          {/* Listado de items cargados en la venta actual */}
          <TablaTicket
            items={items}
            actualizarItem={actualizarItem}
            eliminarItem={eliminarItem}
            calcularSubtotal={calcularTotalItem}
            inputCodigoRef={inputCodigoRef}
          />
        </div>

        {/* Panel lateral con config fiscal y botón de cobro */}
        <PanelPago
          tabActiva={tabActiva}
          enBlanco={enBlanco}
          setEnBlanco={setEnBlanco}
          tipoDocumento={tipoDocumento}
          setTipoDocumento={setTipoDocumento}
          aplicaIva={aplicaIva}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          busquedaCliente={busquedaCliente}
          setBusquedaCliente={setBusquedaCliente}
          clienteSeleccionado={clienteSeleccionado}
          setClienteSeleccionado={setClienteSeleccionado}
          mostrarDropdownCliente={mostrarDropdownCliente}
          setMostrarDropdownCliente={setMostrarDropdownCliente}
          clientes={clientes}
          condicionVenta={condicionVenta}
          setCondicionVenta={setCondicionVenta}
          busquedaFactura={busquedaFactura}
          setBusquedaFactura={setBusquedaFactura}
          comprobanteAsociado={comprobanteAsociado}
          setComprobanteAsociado={setComprobanteAsociado}
          mostrarDropdownFactura={mostrarDropdownFactura}
          setMostrarDropdownFactura={setMostrarDropdownFactura}
          facturas={facturas}
          totales={totales}
          handleFacturar={handleFinalizar}
          items={items}
          tiposComprobante={tiposComprobante}
          cargandoVouchers={cargandoVouchers}
          usuario={usuario}
          entidades={entidades}
          entidadSeleccionada={entidadSeleccionada}
          setEntidadSeleccionada={setEntidadSeleccionada}
          handleClienteKeyDown={handleClienteKeyDown}
          clientesFiltrados={clientesFiltrados}
          highlightedIndexCliente={highlightedIndexCliente}
          // Pagos multiples
          listaPagos={listaPagos}
          nuevoPago={nuevoPago}
          setNuevoPago={setNuevoPago}
          agregarPago={agregarPago}
          agregarPagoConVuelto={agregarPagoConVuelto}
          eliminarPago={eliminarPago}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          unidadLocal={unidadLocal}
          setUnidadLocal={setUnidadLocal}
          vuelto={vuelto}
        />
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

      {/* BARRA MOBILE: ACCESO RÁPIDO A TOTALES */}
      <ResumenVentaMobile
        items={items}
        totales={totales}
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        handleFacturar={handleFinalizar}
      />
    </div>
  );
};

export default Comprobantes;
