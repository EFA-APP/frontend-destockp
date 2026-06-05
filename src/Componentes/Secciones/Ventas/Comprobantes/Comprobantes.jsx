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
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalConfirmacionCobro from "./ModalConfirmacionCobro";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import { formatPrice } from "../../../../utils/formatters";
import {
  ComprobanteIcono,
  DineroIcono,
  NuevoContactoIcono,
  BuscadorIcono,
} from "../../../../assets/Icons";
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
  Building2,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import ModalErrorContabilidad from "../../../Modales/Sistema/ModalErrorContabilidad";

const ComprobantesSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row gap-6 p-4 animate-pulse">
    <div className="flex-1 rounded-3xl bg-gray-100 h-[600px]" />
    <div className="w-full md:w-[480px] rounded-3xl bg-gray-100 h-[600px]" />
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
  const [esPresupuesto, setEsPresupuesto] = useState(false);
  const usuario = useAuthStore((state) => state.usuario);

  // Referencias extras para foco rápido
  const clientSearchRef = useRef(null);
  const paymentAmountRef = useRef(null);

  // === EFECTO: Atajos de Teclado Globales adaptados al POS Dashboard ===
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      // F1: Foco en búsqueda de producto
      if (e.key === "F1") {
        e.preventDefault();
        inputCodigoRef.current?.focus();
        inputCodigoRef.current?.select();
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
  }, [handleFinalizar]);

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

  const noopProductoEncontrado = useCallback(() => {}, []);
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
      {/* 1. SECCIÓN: CABECERA */}
      <EncabezadoSeccion
        ruta={"Nueva Venta"}
        icono={<ComprobanteIcono />}
        volver={true}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200/80 pb-4 mb-4 gap-4">
        {/* Atajos de Teclado Info */}
        <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200/80 text-[10px] font-black uppercase text-gray-400 shadow-sm">
          <span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
              F1
            </kbd>{" "}
            Buscar Prod
          </span>
          <span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
              F2
            </kbd>{" "}
            Cliente
          </span>
          <span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
              F3
            </kbd>{" "}
            Pago
          </span>
          <span>
            <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300">
              F4
            </kbd>{" "}
            Finalizar
          </span>
        </div>
      </div>

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
        <div className="w-full mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-24">
          {/* COLUMNA IZQUIERDA: 1. ¿QUÉ VENDEMOS? */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-100/50 flex flex-col gap-5 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-emerald-500 font-extrabold text-xl">
                  1.
                </span>{" "}
                ¿Qué Vendemos?
              </h2>
              {items.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("¿Vaciar carrito?")) {
                      items.forEach((_, idx) => eliminarItem(0));
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 border border-rose-200 transition"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* BÚSQUEDA DE PRODUCTO + ITEM MANUAL */}
            <div className="relative">
              <div className="flex gap-2 items-stretch">
                {/* Caja de Búsqueda */}
                <div className="relative flex-1 flex bg-white border border-gray-300 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition h-[50px] items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Search
                      size={18}
                      className="text-gray-400 group-focus-within:text-emerald-500"
                    />
                  </div>
                  <input
                    ref={inputCodigoRef}
                    type="text"
                    value={codigoBusqueda}
                    onChange={(e) => {
                      setCodigoBusqueda(e.target.value);
                      setMostrarDropdownProducto(true);
                    }}
                    onFocus={() => setMostrarDropdownProducto(true)}
                    onBlur={() =>
                      setTimeout(() => setMostrarDropdownProducto(false), 250)
                    }
                    onKeyDown={handleCodigoKeyDown}
                    placeholder="Buscar producto (ej: mermelada)..."
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm font-bold text-gray-900 focus:outline-none placeholder:text-gray-400 placeholder:font-bold uppercase tracking-tight"
                  />
                  {cargandoProductos && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Botón Item Manual */}
                <button
                  onClick={() => setMostrandoManual(!mostrandoManual)}
                  className={`px-4 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 border ${
                    mostrandoManual
                      ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {mostrandoManual ? "✕ Cancelar" : "+ Item Manual"}
                </button>
              </div>

              {/* DROPDOWN DE BÚSQUEDA DE PRODUCTO */}
              {mostrarDropdownProducto && codigoBusqueda && (
                <div className="absolute top-full mt-2 left-0 right-0 max-h-[350px] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-2 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                  {productos.length === 0 && !cargandoProductos && (
                    <div className="px-4 py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                      Sin resultados de producto
                    </div>
                  )}
                  {productos.map((p, index) => {
                    const isHighlighted = index === highlightedIndex;
                    const price = getPrecio(p, columnaPrecioSeleccionada);
                    return (
                      <div
                        key={p.codigoSecuencial || index}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          agregarItem(p, 1);
                          setMostrarDropdownProducto(false);
                          setCodigoBusqueda("");
                        }}
                        className={`px-4 py-3 cursor-pointer rounded-lg transition border border-transparent flex justify-between items-center ${
                          isHighlighted
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-xs uppercase truncate">
                            {p.nombre}
                          </span>
                          <span
                            className={`text-[10px] font-bold truncate ${isHighlighted ? "text-white/70" : "text-gray-400"}`}
                          >
                            {p.descripcion || "Item General"}
                          </span>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-black text-xs">
                            {formatPrice(price)}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                              p.stock > 0
                                ? isHighlighted
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : isHighlighted
                                  ? "bg-white/20 text-white"
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}
                          >
                            {p.stock > 0 ? `Stock: ${p.stock}` : "S/S"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FORMULARIO DE ITEM MANUAL */}
            {mostrandoManual && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl animate-in zoom-in-95 duration-200">
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
                    className="w-full h-11 bg-white border border-rose-200 rounded-xl px-3 font-bold text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-xs uppercase"
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
                      className="w-full h-11 bg-white border border-rose-200 rounded-xl pl-6 pr-3 font-black text-gray-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 text-xs"
                      onKeyDown={(e) =>
                        e.key === "Enter" && agregarItemManual()
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={agregarItemManual}
                  className="self-end h-11 px-6 bg-rose-500 text-white rounded-xl font-black uppercase tracking-wider text-xs hover:bg-rose-600 transition shadow-md shadow-rose-500/10 active:scale-95"
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
                  <div className="h-48 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-gray-400 gap-2">
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
                    const itemSubtotal = calcularTotalItem(item);
                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between border border-gray-200/80 rounded-2xl p-3 md:p-4 hover:border-emerald-500/30 hover:bg-emerald-50/[0.02] transition gap-3 shadow-sm animate-in fade-in slide-in-from-left-2 duration-300"
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
                          <div className="bg-[#e2f3eb] border border-emerald-100 rounded-full p-0.5 flex items-center shadow-sm">
                            <button
                              onClick={() =>
                                actualizarItem(
                                  index,
                                  "cantidad",
                                  Math.max(1, (item.cantidad || 1) - 1),
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#10b981] hover:bg-[#059669] text-white transition active:scale-90 font-black"
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
                              className="w-8 bg-transparent border-none text-center font-black text-xs text-emerald-800 focus:outline-none p-0"
                            />
                            <button
                              onClick={() =>
                                actualizarItem(
                                  index,
                                  "cantidad",
                                  (item.cantidad || 0) + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#10b981] hover:bg-[#059669] text-white transition active:scale-90 font-black"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>

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
                          <div className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition">
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

          {/* COLUMNA DERECHA: 2. ¿CÓMO SE PAGA Y A QUIÉN? */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-5 md:p-6 shadow-xl shadow-gray-100/50 flex flex-col gap-6 min-h-[500px]">
            {/* TÍTULO SECCIÓN */}
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2.5">
                <span className="text-emerald-500 font-extrabold text-xl">
                  2.
                </span>{" "}
                ¿Cómo se Paga y a Quién?
              </h2>
            </div>

            {/* SECCIÓN A: CLIENTE (Opcional) */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                A. CLIENTE (Opcional)
              </span>

              {/* Botón Seleccionar Cliente / Estado de Selección */}
              {clienteSeleccionado ? (
                <div className="bg-[#e2f3eb] border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                      <User size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block leading-none mb-1">
                        Cliente Seleccionado
                      </span>
                      <span className="text-sm font-extrabold text-emerald-950 uppercase block">
                        {clienteSeleccionado.razonSocial ||
                          `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700/60 uppercase">
                        {clienteSeleccionado.documento || "DNI/CUIT S/D"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setClienteSeleccionado(null);
                      setBusquedaCliente("");
                    }}
                    className="w-7 h-7 flex items-center justify-center bg-emerald-100 hover:bg-rose-100 text-emerald-700 hover:text-rose-600 rounded-full transition"
                    title="Quitar cliente"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => clientSearchRef.current?.focus()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500/80 to-[#10b981]/80 hover:from-emerald-500 hover:to-[#10b981] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-md shadow-emerald-500/10 active:scale-98"
                >
                  Seleccionar Cliente (Opcional)
                </button>
              )}

              {/* Input de Búsqueda y Botón Nuevo */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1 flex bg-white border border-gray-300 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition h-[44px] items-center">
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
                      placeholder="Buscar por Nombre, DNI o CUIT..."
                      className="w-full bg-transparent pl-10 pr-4 py-2 text-xs font-bold text-gray-800 focus:outline-none placeholder:text-gray-400 placeholder:font-bold"
                    />
                  </div>
                  <button
                    onClick={() => setMostrarFormularioContacto(true)}
                    className="px-4 bg-white border border-rose-500 text-rose-500 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition active:scale-95 flex items-center gap-1.5 shadow-sm shadow-rose-500/5"
                  >
                    <NuevoContactoIcono size={12} />+ Nuevo
                  </button>
                </div>

                {/* Dropdown de Clientes */}
                {mostrarDropdownCliente && busquedaCliente && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                    {clientesFiltrados.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-400 text-xs font-bold uppercase">
                        Sin resultados de clientes
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
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          highlightedIndexCliente === i
                            ? "bg-emerald-500 text-white"
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
            <div className="space-y-3 bg-gray-50 border border-gray-200/60 rounded-2xl p-4">
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
                            ? "bg-emerald-500"
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
                      className={`w-full h-10 border rounded-xl px-3 pr-8 text-xs font-black focus:outline-none transition appearance-none uppercase ${
                        esPresupuesto
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-gray-300 text-gray-800 focus:border-emerald-500"
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
                  <div className="relative">
                    <select
                      disabled={esPresupuesto}
                      value={esPresupuesto ? "" : tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value)}
                      className={`w-full h-10 border rounded-xl px-3 pr-8 text-xs font-black focus:outline-none transition appearance-none uppercase ${
                        esPresupuesto
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : enBlanco === "si"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950 focus:border-emerald-500"
                            : "bg-gray-150 border-gray-300 text-gray-850 focus:border-gray-500"
                      }`}
                    >
                      {esPresupuesto ? (
                        <option value="">Presupuesto Sin Valor Fiscal</option>
                      ) : (
                        tiposComprobante.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown
                      size={14}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                        !esPresupuesto && enBlanco === "si"
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN C: PAGO (Requerido) */}
            {esPresupuesto ? (
              <div className="bg-blue-50 border border-blue-200/60 rounded-2xl p-6 text-center text-blue-800 space-y-2 animate-in fade-in duration-200">
                <AlertTriangle className="mx-auto w-7 h-7 text-blue-500 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-wider">
                  Modo Presupuesto Activo
                </p>
                <p className="text-[10px] font-semibold uppercase text-blue-600/80">
                  Las opciones de pago están desactivadas, ya que no se
                  registrarán transacciones en el backend.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
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

                    if (m.id !== "CHEQUE" && !tieneAccion(`PAGO_${m.id}`))
                      return null;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handlePaymentCardClick(m.id)}
                        className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center text-center p-2.5 transition-all relative overflow-hidden active:scale-95 ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md shadow-emerald-500/10"
                            : hasPayment
                              ? "bg-emerald-50/40 border-emerald-300 text-emerald-700"
                              : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={`mb-2.5 ${
                            isSelected || hasPayment
                              ? "text-emerald-500 animate-bounce-short"
                              : "text-gray-400"
                          }`}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                          {m.label}
                        </span>
                        {hasPayment && (
                          <span className="text-[10px] font-black text-emerald-600 block mt-1.5 tabular-nums">
                            {formatPrice(m.value)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Formulario Dinámico del Método de Pago Seleccionado */}
                <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4 space-y-4">
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
                      {/* Selector de Banco / Marca / Entidad */}
                      {nuevoPago.tipo !== "EFECTIVO" &&
                        nuevoPago.tipo !== "CHEQUE" && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                              Marca / Banco
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
                                className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-black text-gray-800 focus:outline-none focus:border-emerald-500 transition appearance-none uppercase"
                              >
                                <option value="">Seleccionar...</option>
                                {nuevoPago.tipo === "TRANSFERENCIA" ? (
                                  <>
                                    <option value="Mercado Pago">
                                      Mercado Pago
                                    </option>
                                    <option value="Modo">Modo (Bancos)</option>
                                    <option value="Naranja X">Naranja X</option>
                                    <option value="Santander">Santander</option>
                                    <option value="Galicia">Galicia</option>
                                    <option value="BBVA">BBVA</option>
                                    <option value="Macro">Macro</option>
                                    <option value="Otro">Otro (Alias)</option>
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
                              className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-800 focus:outline-none"
                            >
                              <option value="PROPIO">Cheque Propio</option>
                              <option value="TERCERO">Cheque de Tercero</option>
                            </select>
                          </div>
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
                              className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-800 focus:outline-none"
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
                              className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-800"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                              Vencimiento
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
                              className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-850"
                            />
                          </div>
                        </>
                      )}

                      {/* Monto del Pago */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 pl-0.5">
                          Monto a Abonar
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
                          className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 font-black text-rose-500 text-sm focus:outline-none focus:border-emerald-500 transition"
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
                          className="w-full h-10 bg-white border border-gray-300 rounded-xl px-3 text-xs font-bold text-gray-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Botón Registrar Pago */}
                  {nuevoPago.tipo && (
                    <button
                      type="button"
                      onClick={agregarPago}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                    >
                      + Registrar Pago ({nuevoPago.tipo})
                    </button>
                  )}

                  {/* Lista de Pagos Parciales Registrados */}
                  {listaPagos.length > 0 && (
                    <div className="border-t border-gray-200/60 pt-3 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block pl-0.5">
                        Pagos Registrados en la Transacción
                      </span>
                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                        {listaPagos.map((p, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-white border border-gray-150 p-2.5 rounded-xl shadow-xs text-xs animate-in slide-in-from-bottom-2 duration-300"
                          >
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase text-emerald-600">
                                {p.tipo}
                              </span>
                              <span className="text-[10px] font-bold text-gray-700">
                                {p.detalles || "General"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-gray-800 tabular-nums">
                                {formatPrice(p.monto)}
                              </span>
                              <button
                                type="button"
                                onClick={() => eliminarPago(i)}
                                className="text-rose-400 hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observaciones del Comprobante */}
            <div className="pt-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-0.5 flex items-center gap-2">
                Observaciones del Comprobante (Opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales impresas en la factura..."
                className="w-full h-16 bg-white border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition resize-none"
              />
            </div>

            {vuelto > 0 && (
              <div className="p-3.5 bg-emerald-500 text-white rounded-2xl flex justify-between items-center shadow-lg shadow-emerald-500/10 animate-pulse">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Su Vuelto:
                </span>
                <span className="text-lg font-black tabular-nums">
                  {formatPrice(vuelto)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PIE DE PÁGINA: BARRA DE TOTALES Y ACCIONES PRINCIPALES */}
      {!cargandoInicial && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-4 md:px-8 z-[200] shadow-[0_-15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Botón Limpiar / Cancelar */}
          <button
            onClick={handleLimpiarCancelar}
            className="w-full md:w-[220px] h-[54px] rounded-xl font-extrabold text-sm text-gray-700 bg-gray-150 hover:bg-gray-200 transition uppercase tracking-wider active:scale-95 shadow-sm"
          >
            Limpiar / Cancelar
          </button>

          {/* Panel de Totales Centrado */}
          <div className="flex items-center gap-6 bg-gray-50 border border-gray-200/80 px-6 py-2.5 rounded-2xl shadow-sm w-full md:w-auto justify-between md:justify-start">
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

              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  IVA (21%)
                </span>
                <span className="text-xs font-bold text-gray-600 mt-1 tabular-nums">
                  {formatPrice(totales?.iva || 0)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest leading-none">
                  Pagado
                </span>
                <span className="text-xs font-extrabold text-emerald-600 mt-1 tabular-nums">
                  {formatPrice(
                    listaPagos.reduce(
                      (acc, p) => acc + parseFloat(p.monto || 0),
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Botón Finalizar Venta y Generar Comprobante o Botones de Presupuesto */}
          {esPresupuesto ? (
            <div className="flex gap-2.5 w-full md:w-[380px]">
              <button
                type="button"
                onClick={() => handleGenerarPresupuesto("ver")}
                disabled={items.length === 0}
                className={`flex-1 h-[54px] rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
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
                className={`flex-1 h-[54px] rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  items.length > 0
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10 active:scale-95 cursor-pointer"
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
              className={`w-full md:w-[380px] h-[54px] rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg ${
                items.length > 0 && !cargandoCobro
                  ? "bg-[#10b981] hover:bg-[#059669] text-white shadow-emerald-500/10 active:scale-95"
                  : "bg-gray-150 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {cargandoCobro ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando Venta...
                </span>
              ) : (
                <>
                  <Ticket size={18} />
                  Finalizar Venta y Generar Comprobante
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
    </div>
  );
};

export default Comprobantes;
