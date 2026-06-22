/**
 * Comprobantes.jsx
 *
 * Componente principal de Facturación / Punto de Venta.
 * Rediseñado a pantalla única (POS Dashboard) según boceto.
 * Lógica delegada al hook personalizado 'useComprobantes'.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useComprobantes } from "./hooks/useComprobantes";
import { getPrecio, calcularTotalItem } from "./utils/fiscal.utils";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "../../../Tablas/Ventas/Comprobantes/ComprobantePDF";
import ModalConfirmacionCobro from "./ModalConfirmacionCobro";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import SelectorArticuloModal from "../../../UI/SelectorArticulo/SelectorArticuloModal";
import SearchableSelect from "../../../UI/Select/SearchableSelect";
import SelectorTipoComprobante from "../../../UI/Select/SelectorTipoComprobante";
import { formatPrice } from "../../../../utils/formatters";
import { NuevoContactoIcono } from "../../../../assets/Icons";
import { usePermisosDeUsuario } from "../../../../Backend/Autenticacion/hooks/Permiso/usePermisoDeUsuario";
import {
  Link,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  Coins,
  CreditCard,
  ArrowLeftRight,
  FileText,
  User,
  Ticket,
  Sparkles,
  Search,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";

const ComprobantesSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 animate-pulse">
    <div className="flex-1 rounded-md bg-gray-100 h-[600px]" />
    <div className="w-full md:w-[480px] rounded-md bg-gray-100 h-[600px]" />
  </div>
);

const Comprobantes = () => {
  // Inyección de lógica mediante Hook Maestro
  const {
    // Datos y Totales
    items,
    totales,
    productos,
    cargandoProductos,

    // Captura de productos
    codigoBusqueda,
    setCodigoBusqueda,
    columnaPrecioSeleccionada,
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
    // Manejadores de eventos
    agregarItem,
    eliminarItem,
    actualizarItem,
    handleFinalizar,
    confirmarVentaFinal,
    cargandoCobro,
    // Modos de Ajuste
    esNotaCreditoNav,
    esNotaDebitoNav,
    esEmisionPago,
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

    // TABS
    tipoOperacion,
    setTipoOperacion,

    // NUEVOS CAMPOS COMPRAS
    cae,
    setCae,
    vtoCae,
    setVtoCae,
    numeroComprobante,
    setNumeroComprobante,

    // CUENTA CONTABLE
    tipoItemAgregar,
    setTipoItemAgregar,
    cuentaContableSeleccionada,
    setCuentaContableSeleccionada,
    precioCuentaContable,
    setPrecioCuentaContable,
    nombreCuentaContable,
    setNombreCuentaContable,
    ivaCuentaContable,
    setIvaCuentaContable,
    agregarCuentaContableItem,
    cuentasContables,

    // COMPROBANTES ASOCIADOS
    comprobantesAsociados,
    agregarComprobanteAsociado,
    eliminarComprobanteAsociado,
    actualizarImporteAsociado,

    // VUELTOS
    vueltoMetodo,
    setVueltoMetodo,
    vueltoBancoDestino,
    setVueltoBancoDestino,
    MOCK_BANCOS,
    letraComprobante,
    facturas,
  } = useComprobantes();

  const { tieneAccion } = usePermisosDeUsuario();
  const [esPresupuesto, setEsPresupuesto] = useState(false);
  const [abrirBuscadorProductos, setAbrirBuscadorProductos] = useState(false);
  const usuario = useAuthStore((state) => state.usuario);

  const totalPagado = listaPagos.reduce(
    (acc, p) => acc + parseFloat(p.monto || 0),
    0,
  );
  const pagosDifieren = Math.abs(totalPagado - (totales?.total || 0)) > 0.01;

  // Referencias extras para foco rápido
  const clientSearchRef = useRef(null);
  const paymentAmountRef = useRef(null);

  // === EFECTO: Atajos de Teclado Globales adaptados al POS Dashboard ===
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // F1: Abrir buscador de productos
      if (e.key === "F1") {
        e.preventDefault();
        setAbrirBuscadorProductos(true);
      }
      // F2: Foco en búsqueda de cliente
      if (e.key === "F2") {
        e.preventDefault();
        clientSearchRef.current?.focus();
        clientSearchRef.current?.select();
      }
      // F3: Foco en monto de pago
      if (e.key === "F3") {
        e.preventDefault();
        paymentAmountRef.current?.focus();
        paymentAmountRef.current?.select();
      }
      // F4: Finalizar venta
      if (e.key === "F4") {
        e.preventDefault();
        handleFinalizar();
      }
      // Ctrl + Enter para Finalizar
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleFinalizar();
      }
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [handleFinalizar, setAbrirBuscadorProductos]);

  // Manejador del botón LIMPIAR / CANCELAR
  const handleLimpiarCancelar = useCallback(() => {
    if (
      window.confirm(
        "¿Está seguro que desea cancelar la venta actual y limpiar todos los campos?",
      )
    ) {
      // Usamos el hook para vaciar los items del carrito y reiniciar los estados
      // setItem([]) está embebido en useComprobantes como limpiar/vaciar
      actualizarItem && items.forEach((_, idx) => eliminarItem(0));
      setClienteSeleccionado(null);
      setBusquedaCliente("");
      setObservaciones("");
      setComprobanteAsociado("");
      // Limpiar lista de pagos
      listaPagos.forEach((_, idx) => eliminarPago(0));
    }
  }, [
    items,
    eliminarItem,
    setClienteSeleccionado,
    setBusquedaCliente,
    setObservaciones,
    setComprobanteAsociado,
    listaPagos,
    eliminarPago,
  ]);

  const handleGenerarPresupuesto = async (tipoAccion) => {
    if (items.length === 0) {
      alert("Agregue al menos un producto para generar el presupuesto");
      return;
    }

    const budgetComprobante = {
      letraComprobante: "P",
      puntoVenta: 0,
      numeroComprobante: Math.floor(Math.random() * 900000) + 100000,
      fechaEmision: new Date(),
      receptor: clienteSeleccionado
        ? {
            razonSocial:
              clienteSeleccionado.razonSocial ||
              `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
            DocTipo: clienteSeleccionado.tipoDocumento || 99,
            DocNro: clienteSeleccionado.documento || 0,
            CondicionIVAReceptorId:
              clienteSeleccionado.CondicionIVAReceptorId || 5,
            domicilio: clienteSeleccionado.domicilio || "",
          }
        : {
            razonSocial: "CONSUMIDOR FINAL",
            DocTipo: 99,
            DocNro: 0,
            CondicionIVAReceptorId: 5,
          },
      detalles: items.map((item, idx) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      })),
      total: totales.total,
      subtotal: totales.subtotal,
      iva: totales.iva,
      condicionVenta: condicionVenta,
      observaciones:
        `${observaciones || ""} [PRESUPUESTO SIN VALOR FISCAL]`.trim(),
      fiscal: false,
      tipoDocumento: 995,
    };

    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={budgetComprobante} usuario={usuario} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      if (tipoAccion === "ver") {
        window.open(url, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `PRESUPUESTO-${budgetComprobante.numeroComprobante}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error("Error al generar PDF de Presupuesto:", e);
      alert("Ocurrió un error al generar el PDF del presupuesto.");
    }
  };

  const cargandoInicial = cargandoConfigs && items.length === 0;

  // Sumas de montos por método de pago para mostrar en las tarjetas rápidas
  const getSumaPagoPorTipo = (tipo) => {
    return listaPagos
      .filter((p) => p.tipo === tipo)
      .reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
  };

  const efectivoSuma = getSumaPagoPorTipo("EFECTIVO");
  const creditoSuma = getSumaPagoPorTipo("CREDITO");
  const debitoSuma = getSumaPagoPorTipo("DEBITO");
  const transferenciaSuma = getSumaPagoPorTipo("TRANSFERENCIA");
  const chequeSuma = getSumaPagoPorTipo("CHEQUE");

  // Al hacer click en una tarjeta de pago rápido, seteamos el tipo de pago
  const handlePaymentCardClick = (tipo) => {
    setNuevoPago((prev) => {
      // Si la tarjeta ya está activa y tiene un monto, o simplemente queremos cambiar el tipo
      const totalPagado = listaPagos.reduce(
        (acc, p) => acc + parseFloat(p.monto || 0),
        0,
      );
      const remaining = Math.max(0, (totales?.total || 0) - totalPagado);

      return {
        ...prev,
        tipo: tipo,
        // Auto-sugerimos el saldo restante si no se ha digitado nada aún
        monto:
          prev.monto && parseFloat(prev.monto) > 0
            ? prev.monto
            : remaining > 0
              ? remaining.toString()
              : "",
      };
    });
    // Enfocar el input de monto de pago
    setTimeout(() => {
      paymentAmountRef.current?.focus();
      paymentAmountRef.current?.select();
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] w-full p-3 md:p-6 text-gray-800 font-sans overflow-x-hidden">
      {/* Pestañas Ventas / Compras */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-lg border border-gray-200 w-full sm:w-fit mb-6 shadow-inner">
        <button
          onClick={() => {
            setTipoOperacion("INGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "INGRESO"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Ventas (Ingresos)
        </button>
        <button
          onClick={() => {
            setTipoOperacion("EGRESO");
          }}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
            tipoOperacion === "EGRESO"
              ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
              : "text-gray-500 hover:text-gray-850 hover:bg-gray-105/50"
          }`}
        >
          Compras (Egresos)
        </button>
      </div>

      {/* BANNER DE COMPROBANTE ASOCIADO */}
      {comprobanteAsociado && (
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
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
                <span className="text-base font-black text-amber-900 tracking-tight leading-none">
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

      {/* 2. CUERPO POS: DISEÑO PANTALLA UNICA EN DOS COLUMNAS */}
      {cargandoInicial ? (
        <ComprobantesSkeleton />
      ) : (
        <div className="flex-1 flex flex-col gap-6 mb-30">
          {/* COLUMNA IZQUIERDA: 1. ¿QUÉ VENDEMOS / COMPRAMOS? */}
          <div className="bg-white rounded-md border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-100/50 flex flex-col gap-5 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-[var(--primary)] font-extrabold text-xl">
                  1.
                </span>{" "}
                {tipoOperacion === "EGRESO"
                  ? "¿Qué Compramos?"
                  : "¿Qué Vendemos?"}
              </h2>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("¿Vaciar items?")) {
                      items.forEach((_, idx) => eliminarItem(0));
                    }
                  }}
                  className="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 border border-rose-200 transition"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Selector de Tipo de Item: Producto vs Cuenta Contable */}
            <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200 w-full mb-1">
              <button
                type="button"
                onClick={() => setTipoItemAgregar("PRODUCTO")}
                className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  tipoItemAgregar === "PRODUCTO"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-850"
                }`}
              >
                Producto / Servicio
              </button>
              <button
                type="button"
                onClick={() => setTipoItemAgregar("CUENTA_CONTABLE")}
                className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                  tipoItemAgregar === "CUENTA_CONTABLE"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-850"
                }`}
              >
                Cuenta Contable
              </button>
            </div>

            {tipoItemAgregar === "CUENTA_CONTABLE" ? (
              <div className="bg-blue-50/50 border border-blue-200/60 rounded-md p-4 space-y-3.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block pl-0.5">
                  Imputación Directa a Cuenta Contable
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Selector de Cuenta Contable */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Seleccionar Cuenta Contable
                    </label>
                    <SearchableSelect
                      options={cuentasContables}
                      value={cuentaContableSeleccionada}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCuentaContableSeleccionada(val);
                        const selected = cuentasContables.find(
                          (c) => c.value === val,
                        );
                        if (selected) {
                          setNombreCuentaContable(
                            selected.nombre || selected.label,
                          );
                        }
                      }}
                      placeholder="Buscar cuenta contable..."
                    />
                  </div>

                  {/* Descripción / Detalle */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Detalle / Nombre Personalizado
                    </label>
                    <input
                      type="text"
                      value={nombreCuentaContable}
                      onChange={(e) => setNombreCuentaContable(e.target.value)}
                      placeholder="Escriba descripción..."
                      className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>

                  {/* Precio */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Precio Unitario (
                      {letraComprobante === "A" && aplicaIva ? "Neto" : "Final"}
                      )
                    </label>
                    <input
                      type="number"
                      value={precioCuentaContable}
                      onChange={(e) => setPrecioCuentaContable(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-black text-gray-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* IVA */}
                  {aplicaIva && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                        Alícuota IVA
                      </label>
                      <select
                        value={ivaCuentaContable}
                        onChange={(e) =>
                          setIvaCuentaContable(Number(e.target.value))
                        }
                        className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="0">0%</option>
                        <option value="10.5">10.5%</option>
                        <option value="21">21%</option>
                        <option value="27">27%</option>
                      </select>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    agregarCuentaContableItem(
                      cuentaContableSeleccionada,
                      nombreCuentaContable,
                      precioCuentaContable,
                      ivaCuentaContable,
                    );
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-black uppercase tracking-wider text-xs transition active:scale-95 shadow-md shadow-blue-500/10"
                >
                  + Agregar Imputación
                </button>
              </div>
            ) : (
              /* BÚSQUEDA DE PRODUCTO + ITEM MANUAL */
              <div className="relative">
                <div className="flex gap-2 items-stretch">
                  {/* Caja de Búsqueda */}
                  <div className="relative flex-1 flex bg-white border border-gray-300 rounded-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[50px] items-center">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Search
                        size={18}
                        className="text-gray-400 group-focus-within:text-[var(--primary)]"
                      />
                    </div>
                    <input
                      ref={inputCodigoRef}
                      type="text"
                      readOnly
                      onClick={() => setAbrirBuscadorProductos(true)}
                      placeholder="Buscar producto o materia prima (F1)..."
                      className="w-full bg-transparent pl-11 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-bold uppercase tracking-tight cursor-pointer"
                    />
                  </div>

                  {/* Botón Item Manual */}
                  <button
                    type="button"
                    onClick={() => setMostrandoManual(!mostrandoManual)}
                    className={`px-4 rounded-md text-xs font-black uppercase tracking-wider transition active:scale-95 border ${
                      mostrandoManual
                        ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {mostrandoManual ? "✕ Cancelar" : "+ Item Manual"}
                  </button>
                </div>
              </div>
            )}

            {/* FORMULARIO DE ITEM MANUAL */}
            {mostrandoManual && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-rose-50/50 border border-rose-200/80 rounded-md animate-in zoom-in-95 duration-200">
                <div className="flex-[2] space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-rose-600 block pl-1">
                    Descripción del Item Manual
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={nombreManual}
                    onChange={(e) => setNombreManual(e.target.value)}
                    placeholder="Ej: Servicio Especial, Envío..."
                    className="w-full h-11 bg-white border border-rose-200 rounded-md px-3 font-bold text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-xs uppercase"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-rose-600 block pl-1">
                    Precio Unitario
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-rose-400 text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      value={precioManual}
                      onChange={(e) => setPrecioManual(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-11 bg-white border border-rose-200 rounded-md pl-6 pr-3 font-black text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-xs"
                      onKeyDown={(e) =>
                        e.key === "Enter" && agregarItemManual()
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={agregarItemManual}
                  className="self-end h-11 px-6 bg-rose-500 text-white rounded-md font-black uppercase tracking-wider text-xs hover:bg-rose-600 transition shadow-md shadow-rose-500/10 active:scale-95"
                >
                  Añadir
                </button>
              </div>
            )}

            {/* SELECCIÓN RÁPIDA O CABECERA DE PRODUCTOS */}
            <div className="mt-2 flex flex-col flex-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Productos populares para selección rápida
              </span>

              {/* LISTADO DE ITEMS DEL CARRITO */}
              <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px] pr-1 space-y-3">
                {items.length === 0 ? (
                  <div className="h-48 border border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-6 text-gray-400 gap-2">
                    <Sparkles className="w-8 h-8 text-gray-300" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Carrito Vacío
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase max-w-[240px]">
                      Busque productos o agregue items manuales para iniciar
                    </p>
                  </div>
                ) : (
                  items.map((item, index) => {
                    const itemSubtotal = calcularTotalItem(
                      item,
                      aplicaIva,
                      letraComprobante,
                    );
                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between border border-gray-200/80 rounded-md p-3 md:p-4 hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/[0.02] transition gap-3 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300"
                      >
                        {/* 1. Descripción del Item (Editable) */}
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.nombre}
                            onChange={(e) =>
                              actualizarItem(
                                index,
                                "nombre",
                                e.target.value.toUpperCase(),
                              )
                            }
                            className="w-full bg-transparent text-xs md:text-sm font-black text-gray-900 border-none outline-none focus:bg-gray-100 p-1 rounded transition uppercase"
                          />
                          <input
                            type="text"
                            value={item.descripcion || ""}
                            placeholder="Sin observaciones..."
                            onChange={(e) =>
                              actualizarItem(
                                index,
                                "descripcion",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent text-[10px] text-gray-400 font-bold border-none outline-none focus:bg-gray-100 p-1 rounded mt-0.5 transition uppercase placeholder:text-gray-300"
                          />
                        </div>

                        {/* 2. Selector de Cantidad Estilo Boceto */}
                        <div className="flex items-center shrink-0">
                          <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-full p-0.5 flex items-center shadow-sm">
                            <button
                              onClick={() =>
                                actualizarItem(
                                  index,
                                  "cantidad",
                                  Math.max(1, (item.cantidad || 1) - 1),
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white transition active:scale-90 font-black"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarItem(
                                  index,
                                  "cantidad",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-8 bg-transparent border-none text-center font-black text-xs text-[var(--primary)] focus:outline-none p-0"
                            />
                            <button
                              onClick={() =>
                                actualizarItem(
                                  index,
                                  "cantidad",
                                  (item.cantidad || 0) + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white transition active:scale-90 font-black"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>

                        {/* 2.5 Selector de IVA si aplica */}
                        {aplicaIva && (
                          <div className="flex flex-col items-start min-w-[70px] pl-2 border-l border-gray-150 shrink-0">
                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider pl-1">
                              IVA
                            </label>
                            <select
                              value={
                                item.tasaIva !== undefined ? item.tasaIva : 21
                              }
                              onChange={(e) =>
                                actualizarItem(
                                  index,
                                  "tasaIva",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="bg-transparent border-none text-xs font-bold text-gray-500 focus:bg-gray-150 rounded px-1 py-0.5 transition outline-none cursor-pointer"
                            >
                              <option value="0">0%</option>
                              <option value="10.5">10.5%</option>
                              <option value="21">21%</option>
                              <option value="27">27%</option>
                            </select>
                          </div>
                        )}

                        {/* 3. Precio Unitario & Subtotal */}
                        <div className="flex flex-col items-end shrink-0 pl-1">
                          {/* Precio Unitario Editable */}
                          <div className="flex items-center text-xs font-semibold text-gray-400">
                            <span>$</span>
                            <input
                              type="number"
                              value={item.precioUnitario}
                              onChange={(e) =>
                                actualizarItem(
                                  index,
                                  "precioUnitario",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-16 bg-transparent text-right font-bold text-gray-500 border-none outline-none focus:bg-gray-100 rounded px-1 transition text-[11px]"
                            />
                          </div>
                          {/* Subtotal de Línea */}
                          <span className="font-extrabold text-sm text-gray-900 mt-1">
                            {formatPrice(itemSubtotal)}
                          </span>
                        </div>

                        {/* 4. Botón Eliminar (Boceto style) */}
                        <button
                          onClick={() => eliminarItem(index)}
                          className="flex flex-col items-center justify-center text-rose-400 hover:text-rose-600 transition group pl-2 border-l border-gray-100"
                        >
                          <div className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-md text-rose-500 transition">
                            <Trash2 size={16} />
                          </div>
                          <span className="text-[8px] font-black uppercase text-rose-400 tracking-wider mt-1 leading-none">
                            Quitar
                          </span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: 2. CLIENTE / PROVEEDOR Y DETALLE FISCAL */}
          <div className="bg-white rounded-md border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-100/50 flex flex-col gap-6 min-h-[500px]">
            {/* TÍTULO SECCIÓN */}
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-[var(--primary)] font-extrabold text-xl">
                  2.
                </span>{" "}
                {tipoOperacion === "EGRESO"
                  ? "Proveedor y Detalle Fiscal"
                  : "Cliente y Detalle Fiscal"}
              </h2>
            </div>

            {/* SECCIÓN A: CLIENTE / PROVEEDOR (Opcional) */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                {tipoOperacion === "EGRESO"
                  ? "A. PROVEEDOR (Opcional)"
                  : "A. CLIENTE (Opcional)"}
              </span>

              {/* Botón Seleccionar Cliente / Estado de Selección */}
              {clienteSeleccionado ? (
                <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-md p-4 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-[var(--primary)] text-white flex items-center justify-center font-black shadow-md shadow-[var(--primary)]/20">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] block leading-none mb-1">
                        {tipoOperacion === "EGRESO"
                          ? "Proveedor Seleccionado"
                          : "Cliente Seleccionado"}
                      </span>
                      <span className="text-sm font-extrabold text-gray-900 uppercase block">
                        {clienteSeleccionado.razonSocial ||
                          `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`}
                      </span>
                      <span className="text-[9px] font-bold text-[var(--primary)]/60 uppercase">
                        {clienteSeleccionado.documento || "DNI/CUIT S/D"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setBusquedaCliente("");
                    }}
                    className="w-7 h-7 flex items-center justify-center bg-[var(--primary)]/10 hover:bg-rose-100 text-[var(--primary)] hover:text-rose-600 rounded-full transition"
                    title="Quitar selección"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => clientSearchRef.current?.focus()}
                  className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-md font-bold text-xs uppercase tracking-widest transition shadow-md shadow-[var(--primary)]/10 active:scale-98"
                >
                  {tipoOperacion === "EGRESO"
                    ? "Seleccionar Proveedor (Opcional)"
                    : "Seleccionar Cliente (Opcional)"}
                </button>
              )}

              {/* Input de Búsqueda y Botón Nuevo */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1 flex bg-white border border-gray-300 rounded-md focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/10 transition h-[44px] items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      ref={clientSearchRef}
                      type="text"
                      value={busquedaCliente}
                      onChange={(e) => {
                        setBusquedaCliente(e.target.value);
                        setMostrarDropdownCliente(true);
                      }}
                      onFocus={() => setMostrarDropdownCliente(true)}
                      onBlur={() =>
                        setTimeout(() => setMostrarDropdownCliente(false), 250)
                      }
                      onKeyDown={handleClienteKeyDown}
                      placeholder={
                        tipoOperacion === "EGRESO"
                          ? "Buscar por Razón Social, CUIT..."
                          : "Buscar por Nombre, DNI o CUIT..."
                      }
                      className="w-full bg-transparent pl-10 pr-4 py-2 text-xs font-bold text-gray-800 focus:outline-none placeholder:text-gray-400 placeholder:font-bold"
                    />
                  </div>
                  <button
                    onClick={() => setMostrarFormularioContacto(true)}
                    className="px-4 bg-white border border-rose-500 text-rose-500 hover:bg-rose-50 rounded-md text-[10px] font-black uppercase tracking-widest transition active:scale-95 flex items-center gap-1.5 shadow-sm shadow-rose-500/5"
                  >
                    <NuevoContactoIcono size={12} />+ Nuevo
                  </button>
                </div>

                {/* Dropdown de Clientes / Proveedores */}
                {mostrarDropdownCliente && busquedaCliente && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-2xl z-[100] max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                    {clientesFiltrados.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-400 text-xs font-bold uppercase">
                        {tipoOperacion === "EGRESO"
                          ? "Sin resultados de proveedores"
                          : "Sin resultados de clientes"}
                      </div>
                    )}
                    {clientesFiltrados.map((c, i) => (
                      <div
                        key={c.codigoSecuencial}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setClienteSeleccionado(c);
                          setBusquedaCliente(
                            c.razonSocial || `${c.nombre} ${c.apellido}`,
                          );
                          setMostrarDropdownCliente(false);
                        }}
                        className={`p-3 rounded-md cursor-pointer transition ${
                          highlightedIndexCliente === i
                            ? "bg-[var(--primary)] text-white"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <div className="font-extrabold text-xs uppercase leading-tight">
                          {c.razonSocial || `${c.nombre} ${c.apellido}`}
                        </div>
                        <div
                          className={`text-[9px] font-bold mt-0.5 uppercase tracking-wider ${highlightedIndexCliente === i ? "text-white/60" : "text-gray-400"}`}
                        >
                          {c.documento || "Sin Documento"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN B: DETALLE FISCAL (Obligatorio) */}
            <div className="space-y-3 bg-gray-50 border border-gray-200/60 rounded-md p-4">
              <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  B. DETALLE FISCAL (Obligatorio)
                </span>

                <div className="flex items-center gap-4">
                  {/* Switch Interno/Fiscal */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                      Interno (X)
                    </span>
                    <button
                      type="button"
                      disabled={esPresupuesto}
                      onClick={() => {
                        if (!puedeHacerFiscal && enBlanco === "no") {
                          // Warn user
                          alert(
                            "Sin conexión ARCA configurada. Solo puede emitir Internos.",
                          );
                          return;
                        }
                        setEnBlanco(enBlanco === "no" ? "si" : "no");
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        esPresupuesto
                          ? "opacity-50 cursor-not-allowed bg-gray-200"
                          : enBlanco === "no"
                            ? "bg-[var(--primary)]"
                            : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          !esPresupuesto && enBlanco === "no"
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Switch Presupuesto */}
                  {tipoOperacion !== "EGRESO" && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">
                        Presupuesto
                      </span>
                      <button
                        type="button"
                        onClick={() => setEsPresupuesto(!esPresupuesto)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          esPresupuesto ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            esPresupuesto ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Sucursal */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                    Sucursal
                  </label>
                  <div className="relative">
                    <select
                      disabled={esPresupuesto}
                      value={unidadLocal}
                      onChange={(e) => setUnidadLocal(e.target.value)}
                      className={`w-full h-10 border rounded-md px-3 pr-8 text-xs font-black focus:outline-none transition appearance-none uppercase ${
                        esPresupuesto
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-gray-300 text-gray-800 focus:border-[var(--primary)]"
                      }`}
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
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Comprobante */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                    Comprobante
                  </label>
                  {esPresupuesto ? (
                    <div className="w-full h-10 bg-gray-100 border border-gray-200 text-gray-400 rounded-md px-3 text-xs font-black flex items-center">
                      PRESUPUESTO SIN VALOR FISCAL
                    </div>
                  ) : (
                    <SelectorTipoComprobante
                      value={tipoDocumento}
                      onChange={setTipoDocumento}
                      modo={tipoOperacion === "EGRESO" ? "COMPRA" : "VENTA"}
                      tipo={enBlanco === "si" ? "FISCAL" : "INTERNO"}
                    />
                  )}
                </div>
              </div>

              {/* Compras Extra Fields (CAE, Nro, Vto) */}
              {tipoOperacion === "EGRESO" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3 pt-3 border-t border-gray-200/60 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Número Comprobante
                    </label>
                    <input
                      type="number"
                      value={numeroComprobante}
                      onChange={(e) => setNumeroComprobante(e.target.value)}
                      placeholder="Ej: 1234"
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      CAE
                    </label>
                    <input
                      type="text"
                      value={cae}
                      onChange={(e) => setCae(e.target.value)}
                      placeholder="Ej: 32123..."
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Vto. CAE
                    </label>
                    <input
                      type="date"
                      value={vtoCae}
                      onChange={(e) => setVtoCae(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comprobantes Relacionados Section */}
            {(() => {
              const esNC =
                [3, 8, 13, 53, 993].includes(Number(tipoDocumento)) ||
                esNotaCreditoNav;
              const esND =
                [2, 7, 12, 52, 994].includes(Number(tipoDocumento)) ||
                esNotaDebitoNav;
              const esRec =
                [4, 9, 15, 54, 99, 992].includes(Number(tipoDocumento)) ||
                esEmisionPago;
              const mostrarSeccionAsociados = esNC || esND || esRec;

              if (!mostrarSeccionAsociados) return null;

              return (
                <div className="space-y-4 bg-gray-50 border border-gray-200/60 rounded-md p-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Comprobantes Relacionados
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                      Vincular Factura/Comprobante Previo
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const comp = facturas.find(
                          (f) =>
                            f.id === Number(val) ||
                            f.codigoSecuencial === Number(val),
                        );
                        if (comp) {
                          agregarComprobanteAsociado(comp);
                        }
                        e.target.value = "";
                      }}
                      className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="">
                        Buscar en comprobantes guardados...
                      </option>
                      {facturas
                        .filter((f) => {
                          const isIng =
                            f.tipoOperacion === "INGRESO" ||
                            f.entidadReceptor === "CLIE";
                          return tipoOperacion === "EGRESO" ? !isIng : isIng;
                        })
                        .map((f) => (
                          <option
                            key={f.codigoSecuencial || f.id}
                            value={f.codigoSecuencial || f.id}
                          >
                            {f.tipoDescripcionComprobante || "FACTURA"}{" "}
                            {f.letraComprobante}{" "}
                            {String(f.puntoVenta).padStart(5, "0")}-
                            {String(f.numeroComprobante).padStart(8, "0")}{" "}
                            (Total: {formatPrice(f.total)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {comprobantesAsociados.length === 0 ? (
                    <div className="text-[10px] font-bold text-gray-400 uppercase italic py-2 text-center">
                      Ningún comprobante asociado cargado
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {comprobantesAsociados.map((c, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-xs"
                        >
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 uppercase">
                              {c.tipoDescripcionComprobante}{" "}
                              {c.numeroComprobante}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              Relación: {c.tipoRelacion}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase text-gray-400">
                                Monto:
                              </span>
                              <input
                                type="number"
                                value={c.importeAplicado}
                                onChange={(e) =>
                                  actualizarImporteAsociado(idx, e.target.value)
                                }
                                className="w-20 h-8 border border-gray-300 rounded px-2 text-right font-black focus:border-[var(--primary)] focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarComprobanteAsociado(idx)}
                              className="w-7 h-7 flex items-center justify-center bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-full transition"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Row 2: Columna Expandida a lo largo (3. REGISTRO DE PAGO) */}
          <div className="bg-white rounded-md border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-100/50 flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* TÍTULO SECCIÓN */}
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-[var(--primary)] font-extrabold text-xl">
                  3.
                </span>{" "}
                Registro de Pago
              </h2>
            </div>

            {/* SECCIÓN C: PAGO (Requerido) */}
            {esPresupuesto ? (
              <div className="bg-blue-50 border border-blue-200/60 rounded-md p-6 text-center text-blue-800 space-y-2 animate-in fade-in duration-200">
                <AlertTriangle className="mx-auto w-7 h-7 text-blue-500 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-wider">
                  Modo Presupuesto Activo
                </p>
                <p className="text-[10px] font-semibold uppercase text-blue-600/80">
                  Las opciones de pago están desactivadas, ya que no se
                  registrarán transacciones
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                {/* Columna Izquierda (7 de 12): Selección y Carga del Pago */}
                <div className="lg:col-span-7 space-y-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pl-0.5">
                    C. PAGO (Requerido)
                  </span>

                  {/* Grid 4+1 Tarjetas Rápidas de Pago */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      {
                        id: "EFECTIVO",
                        label: "EFECTIVO",
                        icon: Coins,
                        value: efectivoSuma,
                      },
                      {
                        id: "CREDITO",
                        label: "CRÉDITO",
                        icon: CreditCard,
                        value: creditoSuma,
                      },
                      {
                        id: "DEBITO",
                        label: "DÉBITO",
                        icon: CreditCard,
                        value: debitoSuma,
                      },
                      {
                        id: "TRANSFERENCIA",
                        label: "TRANSF.",
                        icon: ArrowLeftRight,
                        value: transferenciaSuma,
                      },
                      {
                        id: "CHEQUE",
                        label: "CHEQUE",
                        icon: FileText,
                        value: chequeSuma,
                      },
                    ].map((m) => {
                      const isSelected = nuevoPago.tipo === m.id;
                      const hasPayment = m.value > 0;
                      const Icon = m.icon;

                      if (!tieneAccion(`PAGO_${m.id}`)) return null;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handlePaymentCardClick(m.id)}
                          className={`h-20 rounded-md border-2 flex flex-col items-center justify-center text-center p-2 transition-all relative overflow-hidden active:scale-95 ${
                            isSelected
                              ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-md shadow-[var(--primary)]/10"
                              : hasPayment
                                ? "bg-[var(--primary)]/5 border-[var(--primary)]/20 text-[var(--primary)]/80"
                                : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={`mb-1.5 ${
                              isSelected || hasPayment
                                ? "text-[var(--primary)] animate-bounce-short"
                                : "text-gray-400"
                            }`}
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                            {m.label}
                          </span>
                          {hasPayment && (
                            <span className="text-[10px] font-black text-[var(--primary)] block mt-1 tabular-nums">
                              {formatPrice(m.value)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Formulario Dinámico del Método de Pago Seleccionado */}
                  <div className="bg-gray-50 border border-gray-200/60 rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                        Cargar Pago: {nuevoPago.tipo || "Ninguno"}
                      </span>
                      <div className="text-[10px] font-black text-gray-400 uppercase">
                        Condición:
                        <select
                          value={condicionVenta}
                          onChange={(e) => setCondicionVenta(e.target.value)}
                          className="ml-1 bg-transparent border-none font-bold text-gray-700 focus:outline-none uppercase"
                        >
                          <option value="contado">Contado</option>
                          <option value="cuenta_corriente">Cta. Cte.</option>
                        </select>
                      </div>
                    </div>

                    {nuevoPago.tipo && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-in fade-in duration-200">
                        {/* Selector de Marca / Proveedor para Tarjeta y Transferencia */}
                        {nuevoPago.tipo !== "EFECTIVO" &&
                          nuevoPago.tipo !== "CHEQUE" && (
                            <>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                  Marca / Proveedor
                                </label>
                                <div className="relative">
                                  <select
                                    value={nuevoPago.entidadId}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        entidadId: e.target.value,
                                        detalles: e.target.value,
                                      })
                                    }
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-black text-gray-800 focus:outline-none focus:border-[var(--primary)] transition appearance-none uppercase"
                                  >
                                    <option value="">Seleccionar...</option>
                                    {nuevoPago.tipo === "TRANSFERENCIA" ? (
                                      <>
                                        <option value="Mercado Pago">
                                          Mercado Pago
                                        </option>
                                        <option value="Modo">
                                          Modo (Bancos)
                                        </option>
                                        <option value="Naranja X">
                                          Naranja X
                                        </option>
                                        <option value="Santander">
                                          Santander
                                        </option>
                                        <option value="Galicia">Galicia</option>
                                        <option value="BBVA">BBVA</option>
                                        <option value="Macro">Macro</option>
                                        <option value="Otro">
                                          Otro (Alias)
                                        </option>
                                      </>
                                    ) : (
                                      <>
                                        <option value="Visa">Visa</option>
                                        <option value="Mastercard">
                                          Mastercard
                                        </option>
                                        <option value="Naranja">Naranja</option>
                                        <option value="Maestro">Maestro</option>
                                        <option value="Cabal">Cabal</option>
                                        <option value="American Express">
                                          Amex
                                        </option>
                                        <option value="Otro">Otro</option>
                                      </>
                                    )}
                                  </select>
                                  <ChevronDown
                                    size={14}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                  Banco Destino (Imputación)
                                </label>
                                <SearchableSelect
                                  options={MOCK_BANCOS}
                                  value={nuevoPago.codigoBancoDestino || ""}
                                  onChange={(e) =>
                                    setNuevoPago({
                                      ...nuevoPago,
                                      codigoBancoDestino: e.target.value,
                                    })
                                  }
                                  placeholder="Seleccionar banco destino..."
                                />
                              </div>
                            </>
                          )}

                        {/* Inputs Adicionales para Cheque */}
                        {nuevoPago.tipo === "CHEQUE" && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Naturaleza
                              </label>
                              <select
                                value={nuevoPago.tipoCheque}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    tipoCheque: e.target.value,
                                  })
                                }
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                              >
                                <option value="PROPIO">Cheque Propio</option>
                                <option value="TERCERO">
                                  {tipoOperacion === "EGRESO"
                                    ? "Cheque de Cartera (Tercero)"
                                    : "Cheque de Tercero"}
                                </option>
                              </select>
                            </div>

                            {nuevoPago.tipoCheque === "PROPIO" ? (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Tipo Cheque Propio
                                  </label>
                                  <select
                                    value={
                                      nuevoPago.tipoChequePropio || "CORRIENTE"
                                    }
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        tipoChequePropio: e.target.value,
                                      })
                                    }
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                                  >
                                    <option value="CORRIENTE">Corriente</option>
                                    <option value="DIFERIDO">Diferido</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Cuenta Cheque
                                  </label>
                                  <input
                                    type="text"
                                    value={nuevoPago.cuentaCheque || ""}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        cuentaCheque: e.target.value,
                                      })
                                    }
                                    placeholder="Nro Cuenta"
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Sucursal
                                  </label>
                                  <input
                                    type="text"
                                    value={nuevoPago.sucursalCheque || ""}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        sucursalCheque: e.target.value,
                                      })
                                    }
                                    placeholder="Sucursal"
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    CUIT Emisor
                                  </label>
                                  <input
                                    type="text"
                                    value={nuevoPago.cuitEmisorCheque || ""}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        cuitEmisorCheque: e.target.value,
                                      })
                                    }
                                    placeholder="30-XXXXXXXX-X"
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Titular Cheque
                                  </label>
                                  <input
                                    type="text"
                                    value={nuevoPago.titularCheque || ""}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        titularCheque: e.target.value,
                                      })
                                    }
                                    placeholder="Nombre completo"
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                                  />
                                </div>
                              </>
                            )}

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Banco Emisor
                              </label>
                              <input
                                type="text"
                                value={nuevoPago.bancoCheque || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    bancoCheque: e.target.value,
                                  })
                                }
                                placeholder="Ej: Santander"
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Número Cheque
                              </label>
                              <input
                                type="text"
                                value={nuevoPago.numeroCheque || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    numeroCheque: e.target.value,
                                  })
                                }
                                placeholder="Nro Cheque"
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Fecha Emisión
                              </label>
                              <input
                                type="date"
                                value={nuevoPago.fechaEmisionCheque || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    fechaEmisionCheque: e.target.value,
                                  })
                                }
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Vencimiento / Fecha Pago
                              </label>
                              <input
                                type="date"
                                value={nuevoPago.vencimientoCheque || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    vencimientoCheque: e.target.value,
                                  })
                                }
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                              />
                            </div>
                          </>
                        )}

                        {/* Inputs Adicionales para Crédito y Débito */}
                        {(nuevoPago.tipo === "CREDITO" ||
                          nuevoPago.tipo === "DEBITO") && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Cupón
                              </label>
                              <input
                                type="text"
                                value={nuevoPago.cupon || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    cupon: e.target.value,
                                  })
                                }
                                placeholder="Ej: 00123"
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)] transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Lote
                              </label>
                              <input
                                type="text"
                                value={nuevoPago.lote || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    lote: e.target.value,
                                  })
                                }
                                placeholder="Ej: 45"
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)] transition"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                Fecha Acreditación
                              </label>
                              <input
                                type="date"
                                value={nuevoPago.vencimientoCheque || ""}
                                onChange={(e) =>
                                  setNuevoPago({
                                    ...nuevoPago,
                                    vencimientoCheque: e.target.value,
                                  })
                                }
                                className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)] transition"
                              />
                            </div>
                            {nuevoPago.tipo === "CREDITO" && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Cuotas
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={nuevoPago.cuotas || 1}
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        cuotas: parseInt(e.target.value) || 1,
                                      })
                                    }
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-805 focus:outline-none focus:border-[var(--primary)] transition"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                                    Recargo / Aumento (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={
                                      nuevoPago.recargo !== undefined
                                        ? nuevoPago.recargo
                                        : 0
                                    }
                                    onChange={(e) =>
                                      setNuevoPago({
                                        ...nuevoPago,
                                        recargo:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    placeholder="0"
                                    className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-805 focus:outline-none focus:border-[var(--primary)] transition"
                                  />
                                </div>
                              </>
                            )}
                          </>
                        )}

                        {/* Monto del Pago */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                            {nuevoPago.tipo === "EFECTIVO"
                              ? "Monto Recibido"
                              : "Monto a Abonar"}
                          </label>
                          <input
                            ref={paymentAmountRef}
                            type="number"
                            value={nuevoPago.monto}
                            onChange={(e) =>
                              setNuevoPago({
                                ...nuevoPago,
                                monto: e.target.value,
                              })
                            }
                            placeholder="Monto"
                            className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 font-black text-rose-500 text-sm focus:outline-none focus:border-[var(--primary)] transition"
                          />
                        </div>

                        {/* Referencia de Pago */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                            Ref. de Pago (Opcional)
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
                            placeholder="Nro Operación/Ticket"
                            className="w-full h-10 bg-white border border-gray-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)] transition"
                          />
                        </div>
                      </div>
                    )}

                    {/* Panel informativo para recargo de Crédito */}
                    {nuevoPago.tipo === "CREDITO" &&
                      parseFloat(nuevoPago.monto) > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200/50 rounded-md p-3.5 space-y-1.5 animate-in slide-in-from-top-1 duration-300">
                          <div className="flex justify-between items-center text-xs text-amber-800 font-bold">
                            <span>Monto Base a Imputar:</span>
                            <span className="font-extrabold">
                              {formatPrice(nuevoPago.monto)}
                            </span>
                          </div>
                          {parseFloat(nuevoPago.recargo) > 0 && (
                            <div className="flex justify-between items-center text-xs text-amber-800 font-bold">
                              <span>Recargo ({nuevoPago.recargo}%):</span>
                              <span className="font-extrabold text-amber-700">
                                +
                                {formatPrice(
                                  (parseFloat(nuevoPago.monto) *
                                    parseFloat(nuevoPago.recargo)) /
                                    100,
                                )}
                              </span>
                            </div>
                          )}
                          <div className="h-px bg-amber-200/60 my-1" />
                          <div className="flex justify-between items-center text-xs text-amber-900 font-black">
                            <span>Total a cobrar en tarjeta:</span>
                            <span className="text-sm text-amber-950 font-black tracking-tight">
                              {formatPrice(
                                parseFloat(nuevoPago.monto) *
                                  (1 +
                                    (parseFloat(nuevoPago.recargo) || 0) / 100),
                              )}
                            </span>
                          </div>
                          {parseInt(nuevoPago.cuotas) > 0 && (
                            <div className="flex justify-between items-center text-[10px] text-amber-700 font-bold italic">
                              <span>Valor de cuota:</span>
                              <span>
                                {nuevoPago.cuotas} cuot. de{" "}
                                {formatPrice(
                                  (parseFloat(nuevoPago.monto) *
                                    (1 +
                                      (parseFloat(nuevoPago.recargo) || 0) /
                                        100)) /
                                    (parseInt(nuevoPago.cuotas) || 1),
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Botón Registrar Pago */}
                    {nuevoPago.tipo && (
                      <button
                        type="button"
                        onClick={agregarPago}
                        className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-md font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow shadow-[var(--primary)]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        + Registrar Pago ({nuevoPago.tipo})
                      </button>
                    )}
                  </div>
                </div>

                {/* Columna Derecha (5 de 12): Pagos registrados y observaciones */}
                <div className="lg:col-span-5 space-y-5 w-full">
                  {/* Lista de Pagos Parciales Registrados */}
                  <div className="bg-gray-50 border border-gray-200/60 rounded-md p-4 space-y-3 shadow-sm min-h-[140px] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pl-0.5 mb-2.5">
                        Pagos Registrados en la Transacción
                      </span>
                      {listaPagos.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs font-semibold uppercase italic tracking-wider">
                          Sin pagos registrados
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {listaPagos.map((p, i) => {
                            const getPaymentConfig = (tipo) => {
                              switch (tipo) {
                                case "EFECTIVO":
                                  return {
                                    color:
                                      "border-l-emerald-500 text-emerald-600 bg-emerald-500/5",
                                    icon: Coins,
                                  };
                                case "CREDITO":
                                case "DEBITO":
                                  return {
                                    color:
                                      "border-l-blue-500 text-blue-600 bg-blue-500/5",
                                    icon: CreditCard,
                                  };
                                case "TRANSFERENCIA":
                                  return {
                                    color:
                                      "border-l-purple-500 text-purple-600 bg-purple-500/5",
                                    icon: ArrowLeftRight,
                                  };
                                case "CHEQUE":
                                  return {
                                    color:
                                      "border-l-amber-500 text-amber-600 bg-amber-500/5",
                                    icon: FileText,
                                  };
                                default:
                                  return {
                                    color:
                                      "border-l-gray-500 text-gray-600 bg-gray-500/5",
                                    icon: Ticket,
                                  };
                              }
                            };
                            const config = getPaymentConfig(p.tipo);
                            const Icon = config.icon;
                            return (
                              <div
                                key={i}
                                className={`flex justify-between items-center bg-white border border-gray-200/60 border-l-4 ${config.color.split(" ")[0]} p-2.5 rounded-md shadow-xs text-xs animate-in slide-in-from-bottom-2 duration-300`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-md ${config.color.split(" ").slice(1).join(" ")} flex items-center justify-center`}
                                  >
                                    <Icon size={14} />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-900 leading-none">
                                      {p.tipo}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 mt-0.5 max-w-[150px] md:max-w-[200px] truncate leading-none">
                                      {p.detalles || "General"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-extrabold text-gray-800 tabular-nums">
                                    {formatPrice(p.monto)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => eliminarPago(i)}
                                    className="w-6 h-6 flex items-center justify-center text-rose-450 hover:text-white hover:bg-rose-500 rounded-full transition-all duration-200 cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observaciones del Comprobante */}
                  <div className="bg-gray-50 border border-gray-200/60 rounded-md p-4 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-0.5 flex items-center gap-2">
                      Observaciones del Comprobante (Opcional)
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas adicionales impresas en la factura..."
                      className="w-full h-16 bg-white border border-gray-300 rounded-md p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition resize-none"
                    />
                  </div>

                  {vuelto > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-md space-y-3.5 animate-in fade-in duration-300 shadow-sm">
                      <div className="flex justify-between items-center text-rose-800">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Coins size={14} className="animate-bounce" />
                          Vuelto a Entregar:
                        </span>
                        <span className="text-lg font-black tabular-nums text-rose-900">
                          {formatPrice(vuelto)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-rose-200/60">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-wider text-rose-700 pl-0.5">
                            Método de Vuelto
                          </label>
                          <select
                            value={vueltoMetodo}
                            onChange={(e) => setVueltoMetodo(e.target.value)}
                            className="w-full h-10 bg-white border border-rose-300 rounded-md px-3 text-xs font-bold text-gray-800 focus:outline-none"
                          >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                          </select>
                        </div>

                        {vueltoMetodo === "TRANSFERENCIA" && (
                          <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                            <label className="text-[9px] font-black uppercase tracking-wider text-rose-700 pl-0.5">
                              Banco Destino (Origen Fondos)
                            </label>
                            <SearchableSelect
                              options={MOCK_BANCOS}
                              value={vueltoBancoDestino}
                              onChange={(e) =>
                                setVueltoBancoDestino(e.target.value)
                              }
                              placeholder="Seleccionar banco..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Warning: Pagos no coinciden */}
                  {!esPresupuesto && pagosDifieren && (
                    <div
                      className={`p-4 rounded-md border flex items-start gap-3 animate-in fade-in duration-300 ${
                        tipoOperacion === "EGRESO"
                          ? "bg-rose-50 border-rose-200 text-rose-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 ${
                          tipoOperacion === "EGRESO"
                            ? "text-rose-500 animate-pulse"
                            : "text-amber-500"
                        }`}
                      />
                      <div className="text-xs space-y-1">
                        <p className="font-black uppercase tracking-wider">
                          {tipoOperacion === "EGRESO"
                            ? "Conciliación Obligatoria"
                            : "Diferencia de Pagos"}
                        </p>
                        <p className="font-medium">
                          {tipoOperacion === "EGRESO"
                            ? "En Compras (Egresos), el total pagado debe coincidir exactamente con el total del comprobante. No podrá finalizar hasta saldar la diferencia."
                            : "El total pagado no coincide con el total de la venta. El saldo restante se registrará automáticamente como deuda en Cuenta Corriente."}
                        </p>
                        <p className="font-extrabold">
                          Diferencia:{" "}
                          {formatPrice(Math.abs(totalPagado - totales.total))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PIE DE PÁGINA: BARRA DE TOTALES Y ACCIONES PRINCIPALES */}
      {!cargandoInicial && (
        <div className="fixed bottom-10 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-4 md:px-8 z-[200] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Botón Limpiar / Cancelar */}
          <button
            onClick={handleLimpiarCancelar}
            className="w-full md:w-[220px] h-[54px] rounded-md font-extrabold text-sm text-red-500 bg-red-500/10 border border-red-500 hover:bg-gray-200 transition uppercase tracking-wider active:scale-95 shadow-sm cursor-pointer"
          >
            Limpiar / Cancelar
          </button>

          {/* Panel de Totales Centrado */}
          <div className="flex items-center gap-6 bg-gray-50 border border-gray-200/80 px-6 py-2.5 rounded-md shadow-sm w-full md:w-auto justify-between md:justify-start">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Total a Cobrar
              </span>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                {formatPrice(totales?.total || 0)}
              </span>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Subtotal
                </span>
                <span className="text-xs font-bold text-gray-600 mt-1 tabular-nums">
                  {formatPrice(totales?.subtotal || 0)}
                </span>
              </div>

              {(letraComprobante === "A" || letraComprobante === "B") && (
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    IVA
                  </span>
                  <span className="text-xs font-bold text-gray-600 mt-1 tabular-nums">
                    {formatPrice(totales?.iva || 0)}
                  </span>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-[var(--primary)] uppercase tracking-widest leading-none">
                  Pagado
                </span>
                <span className="text-xs font-extrabold text-[var(--primary)] mt-1 tabular-nums">
                  {formatPrice(totalPagado)}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Finalizar Venta/Compra y Generar Comprobante o Botones de Presupuesto */}
          {esPresupuesto ? (
            <div className="flex gap-2.5 w-full md:w-[380px]">
              <button
                type="button"
                onClick={() => handleGenerarPresupuesto("ver")}
                disabled={items.length === 0}
                className={`flex-1 h-[54px] rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  items.length > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 active:scale-95 cursor-pointer"
                    : "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Eye size={16} />
                Ver / Imprimir
              </button>
              <button
                type="button"
                onClick={() => handleGenerarPresupuesto("descargar")}
                disabled={items.length === 0}
                className={`flex-1 h-[54px] rounded-md font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  items.length > 0
                    ? "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-[var(--primary)]/10 active:scale-95 cursor-pointer"
                    : "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Download size={16} />
                Descargar
              </button>
            </div>
          ) : (
            <button
              onClick={handleFinalizar}
              disabled={cargandoCobro || items.length === 0}
              className={`w-full md:w-[380px] h-[54px] rounded-md font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg ${
                items.length > 0 && !cargandoCobro
                  ? "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white shadow-[var(--primary)]/10 active:scale-95"
                  : "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {cargandoCobro ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {tipoOperacion === "EGRESO"
                    ? "Procesando Compra..."
                    : "Procesando Venta..."}
                </span>
              ) : (
                <>
                  <Ticket size={18} />
                  {tipoOperacion === "EGRESO"
                    ? "Finalizar Compra y Registrar Comprobante"
                    : "Finalizar Venta y Generar Comprobante"}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 4. MODAL: CIERRE DE VENTA (VISTA PREVIA DE CONFIRMACIÓN) */}
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

      {/* 6. MODAL: SELECCIONAR ARTICULO */}
      <SelectorArticuloModal
        isOpen={abrirBuscadorProductos}
        onClose={() => setAbrirBuscadorProductos(false)}
        productos={productos}
        cargandoProductos={cargandoProductos}
        codigoBusqueda={codigoBusqueda}
        setCodigoBusqueda={setCodigoBusqueda}
        agregarItem={agregarItem}
        getPrecio={getPrecio}
        columnaPrecioSeleccionada={columnaPrecioSeleccionada}
      />
    </div>
  );
};

export default Comprobantes;
