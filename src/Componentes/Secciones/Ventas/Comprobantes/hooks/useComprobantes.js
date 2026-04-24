import { useContactos } from "../../../../../Backend/Contactos/hooks/useContactos";
import {
  ListarEntidadesApi,
  ObtenerContactoApi,
} from "../../../../../Backend/Contactos/api/contactos.api";
import { useFacturas } from "../../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import { useAuthStore } from "../../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../../store/useAlertas";
import { useArcaStore } from "../../../../../store/useArcaStore";
import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useProductoUI } from "../../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useGenerarComprobante } from "../../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";
import {
  getPrecio,
  calcularIVA,
  calcularNetoItem,
  calcularTotalItem,
} from "../utils/fiscal.utils";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";

// Sub-hooks refactorizados
import { useVentaCart } from "./useVentaCart";
import { useVentaFiscal } from "./useVentaFiscal";
import { useVentaPagos } from "./useVentaPagos";

/**
 * Deriva la letra del comprobante AFIP a partir del tipoDocumento numérico.
 * Tipos 1-5  → A (Responsable Inscripto)
 * Tipos 6-10 → B (Consumidor Final)
 * Tipos 11-15 → C (Monotributo)
 * Resto      → X (Interno / sin validez fiscal)
 */
const obtenerLetraDeComprobante = (tipoDocumento) => {
  const tipo = Number(tipoDocumento);
  if (tipo >= 1 && tipo <= 5)   return "A";
  if (tipo >= 6 && tipo <= 10)  return "B";
  if (tipo >= 11 && tipo <= 15) return "C";
  return "X";
};

const MESES_MAP = {
  ENERO: "01",
  FEBRERO: "02",
  MARZO: "03",
  ABRIL: "04",
  MAYO: "05",
  JUNIO: "06",
  JULIO: "07",
  AGOSTO: "08",
  SEPTIEMBRE: "09",
  OCTUBRE: "10",
  NOVIEMBRE: "11",
  DICIEMBRE: "12",
};

export const useComprobantes = () => {
  // === 1. DATOS Y CONTEXTO EXTERNO ===
  const usuario = useAuthStore((state) => state.usuario);
  const unidadActiva = useAuthStore((state) => state.unidadActiva);
  const { conectado: arcaConectado, infoIva } = useArcaStore();
  const { facturas } = useFacturas();
  const { agregarAlerta } = useAlertas();
  const location = useLocation();

  const [unidadLocal, setUnidadLocal] = useState(
    unidadActiva?.codigoSecuencial || 0,
  );

  // === 2. MODULOS REFACTORIZADOS ===
  const fiscal = useVentaFiscal(usuario, arcaConectado, infoIva);
  const cart = useVentaCart(agregarAlerta, "precioVenta", fiscal.aplicaIva);
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const pagos = useVentaPagos(
    cart.totales.total,
    condicionVenta,
    setCondicionVenta,
  );

  // Destructuración para lógica interna
  const { items, setItems, agregarItem, eliminarItem, actualizarItem } = cart;
  const {
    listaPagos,
    setListaPagos,
    agregarPago,
    eliminarPago,
    agregarPagoConVuelto,
    nuevoPago,
    setNuevoPago,
  } = pagos;
  const { tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco } = fiscal;
  const [entidades, setEntidades] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [mostrarFormularioContacto, setMostrarFormularioContacto] =
    useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [highlightedIndexCliente, setHighlightedIndexCliente] = useState(-1);

  const { contactos: clientesRaw } = useContactos({
    tipoEntidad: entidadSeleccionada,
    busqueda: busquedaCliente,
    limite: 10,
  });

  const clientesFiltrados = useMemo(() => {
    if (!Array.isArray(clientesRaw)) return [];
    return clientesRaw.filter((c) =>
      `${c.nombre} ${c.apellido} ${c.codigoSecuencial} ${c.documento || ""} ${c.razonSocial || ""}`
        .toLowerCase()
        .includes(busquedaCliente.toLowerCase()),
    );
  }, [clientesRaw, busquedaCliente]);

  // === 3. ESTADOS DE BÚSQUEDA Y CAPTURA ===
  const [filtrosProductos, setFiltrosProductos] = useState({
    pagina: 1,
    limite: 10,
  });
  const [busquedaClaveProducto, setBusquedaClaveProducto] = useState("nombre"); // 'nombre' o 'codigo'

  // Garantizamos que productos sea siempre un array y cargando un booleano.
  // Solo habilitamos la búsqueda si hay algo escrito para evitar el fetch inicial masivo.
  const productUI =
    useProductoUI(filtrosProductos, {
      enabled: !!filtrosProductos.buscarPorGeneral,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache para evitar re-fetch constante
    }) || {};
  const productos = Array.isArray(productUI.productos)
    ? productUI.productos
    : [];
  const cargandoProductos = !!productUI.cargando;

  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [cantidadInput, setCantidadInput] = useState("1");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // === EFECTO: Sincronizar búsqueda con filtros (Debounce) ===
  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltrosProductos((prev) => ({
        ...prev,
        buscarPorGeneral: codigoBusqueda || undefined,
      }));
    }, 300);

    return () => clearTimeout(handler);
  }, [codigoBusqueda]);

  const [comprobanteAsociado, setComprobanteAsociado] = useState("");
  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [mostrarDropdownFactura, setMostrarDropdownFactura] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [tabActiva, setTabActiva] = useState("productos");
  const [receptorVinculado, setReceptorVinculado] = useState(null);
  const [observaciones, setObservaciones] = useState("");

  // === 4. ESTADOS DE CAMPOS DINÁMICOS ===
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [cargandoConfigs, setCargandoConfigs] = useState(false);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] =
    useState("precioVenta");
  const [periodo, setPeriodo] = useState(null);

  // === 5.5 GESTIÓN DE PASOS (STEPPER) ===
  const [paso, setPaso] = useState(1); // 1: Productos, 2: Config/Cliente, 3: Pagos, 4: Preview

  const siguientePaso = useCallback(() => {
    setPaso((prev) => {
      if (prev === 1 && items.length === 0) {
        agregarAlerta({
          title: "Carrito vacío",
          message: "Agregue productos antes de continuar",
          type: "warning",
        });
        return prev;
      }
      return Math.min(prev + 1, 4);
    });
  }, [items.length, agregarAlerta]);

  const anteriorPaso = useCallback(() => {
    setPaso((prev) => Math.max(prev - 1, 1));
  }, []);

  // === 6. REFERENCIAS PARA FOCO ===
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);

  // === 6.1 MUTACIONES ===
  const mutationGenerar = useGenerarComprobante();

  const puedeHacerFiscal =
    usuario?.conexionArca || usuario?.configuracionArca?.activo;

  // Forzar Interno si no puede hacer fiscal
  useEffect(() => {
    if (!puedeHacerFiscal && enBlanco === "si") {
      setEnBlanco("no");
    }
  }, [puedeHacerFiscal, enBlanco, setEnBlanco]);

  // === EFECTO: Carga desde Navegación (Ej: Escuela -> POS) ===
  useEffect(() => {
    if (
      location.state?.origen === "ESCUELA_CUOTAS" &&
      location.state?.itemsCobro
    ) {
      console.log("[POS] Cargando datos desde Escuela...", location.state);

      const { cliente, itemsCobro } = location.state;

      // 1. Cargar Cliente
      if (cliente) {
        setClienteSeleccionado(cliente);
        setBusquedaCliente(
          cliente.razonSocial || `${cliente.nombre} ${cliente.apellido}`,
        );
      }

      // 2. Cargar Items del Carrito
      if (Array.isArray(itemsCobro)) {
        const nuevosItems = itemsCobro.map((item, index) => ({
          ...item,
          id: `m-escuela-${Date.now()}-${index}`, // ID temporal para items manuales
          codigoSecuencial: `ESC-${index}`,
          descuento: 0,
          atributos: {
            precioVenta: item.precioUnitario, // Lo guardamos en atributos para que getPrecio lo encuentre
          },
        }));
        setItems(nuevosItems);
      }

      // 3. Setear Observación con el Periodo (para conciliación automática)
      if (location.state.periodo) {
        // periodoStr viene como "Marzo 2026"
        const [mes, anio] = location.state.periodo.split(" ");
        const mesNum = MESES_MAP[mes.toUpperCase()] || "01";
        const periodoStr = `${anio}-${mesNum}`;
        setObservaciones(`ESC-PERIODO: ${periodoStr}`);
        setPeriodo(periodoStr);
      }

      // 3. Limpiar estado para evitar re-carga en F5 (Opcional, depende de UX)
      // window.history.replaceState({}, document.title);

      agregarAlerta({
        title: "Cobro de Cuota",
        message: "Se han cargado los datos del alumno y la cuota seleccionada.",
        type: "success",
      });
    }
  }, [location.state]);

  // === EFECTO: Vinculación Inteligente (Autocompletar al asociar) ===
  useEffect(() => {
    if (!comprobanteAsociado) return;

    // 1. Buscar la factura original en la lista cargada
    const facturaOrigen = facturas.find((f) => {
      const nro = `${String(f.puntoVenta).padStart(5, "0")}-${String(f.numeroComprobante).padStart(8, "0")}`;
      return (
        nro === comprobanteAsociado ||
        f.numeroComprobante === Number(comprobanteAsociado)
      );
    });

    if (!facturaOrigen) return;

    const autoRellenar = async () => {
      // 2. Mapear Items del carrito
      if (Array.isArray(facturaOrigen.detalles)) {
        const nuevosItems = facturaOrigen.detalles.map((d) => ({
          id: d.codigoProducto || `m-${Date.now()}-${Math.random()}`,
          codigoSecuencial: d.codigoProducto,
          nombre: d.nombre,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          descuento: d.descuento || 0,
          tasaIva: d.tasaIva || 0,
          manual: !d.codigoProducto,
        }));

        // === AJUSTE DE SALDO PENDIENTE (CONCILIACIÓN) ===
        const totalVoucher = Number(facturaOrigen.total || 0);
        // Usamos el campo estructural de la DB si existe, si no, calculamos el pagado inicial
        const saldoReal =
          facturaOrigen.saldoPendiente !== undefined
            ? Number(facturaOrigen.saldoPendiente)
            : totalVoucher -
              (facturaOrigen.pagos?.reduce(
                (acc, p) => acc + (p.monto || 0),
                0,
              ) || 0);

        const yaPagado = totalVoucher - saldoReal;
        if (yaPagado > 0.01) {
          nuevosItems.push({
            id: `adj-pago-${Date.now()}`,
            nombre: "- PAGOS REGISTRADOS ANTERIORMENTE",
            cantidad: 1,
            precioUnitario: -yaPagado,
            descuento: 0,
            tasaIva: 0,
            manual: true,
          });
        }

        setItems(nuevosItems);
      }

      // 3. Mapear Cliente
      if (facturaOrigen.codigoCliente) {
        try {
          const contactoCompleto = await ObtenerContactoApi(
            facturaOrigen.codigoCliente,
          );
          if (contactoCompleto) {
            setClienteSeleccionado(contactoCompleto);
            setBusquedaCliente(
              contactoCompleto.razonSocial ||
                `${contactoCompleto.nombre} ${contactoCompleto.apellido}`,
            );
          }
        } catch (e) {
          console.error("Error recuperando contacto para vinculación:", e);
        }
      } else if (facturaOrigen.receptor) {
        // Fallback si no hay ID pero hay datos de receptor
        setReceptorVinculado(facturaOrigen.receptor);
        setBusquedaCliente(
          facturaOrigen.receptor.razonSocial || "CONSUMIDOR FINAL",
        );
      }

      // 4. Ajuste Inteligente de Tipo de Documento
      const letraOriginal = facturaOrigen.letraComprobante || "B";
      const letra = letraOriginal.slice(-1).toUpperCase(); // Tomamos siempre la última letra (A, B o C) para ser retrocompatibles
      const mapaNC = { A: 3, B: 8, C: 13 };
      const mapaND = { A: 2, B: 7, C: 12 };
      const mapaRec = { A: 4, B: 9, C: 15 };

      // Sincronizar Modo Fiscal y Tipo de Comprobante según la Factura Origen
      setEnBlanco(facturaOrigen.fiscal ? "si" : "no");

      // Verificamos intención actual (NC vs ND vs RECIBO)
      const esNDActual = [2, 7, 12].includes(Number(tipoDocumento));
      const esRecActual = [4, 9, 15].includes(Number(tipoDocumento));

      // Si el usuario está en ND, mantenemos ND. Si es Recibo, mantenemos Recibo. Si no, forzamos NC.
      if (esNDActual) {
        if (mapaND[letra]) setTipoDocumento(mapaND[letra]);
      } else if (esRecActual) {
        if (mapaRec[letra]) setTipoDocumento(mapaRec[letra]);
      } else {
        if (mapaNC[letra]) setTipoDocumento(mapaNC[letra]);
      }

      // 5. Sincronizar Modo Fiscal
      setEnBlanco(facturaOrigen.fiscal ? "si" : "no");

      // 6. Condición de Venta
      if (facturaOrigen.condicionVenta) {
        setCondicionVenta(facturaOrigen.condicionVenta.toLowerCase());
      }

      // 7. Heredar Periodo
      if (facturaOrigen.periodo) {
        setPeriodo(facturaOrigen.periodo);
      }

      agregarAlerta({
        title: "Comprobante Vinculado",
        message: `Se han cargado los datos de la ${facturaOrigen.letraComprobante} ${comprobanteAsociado} automáticamente.`,
        type: "success",
      });
    };

    autoRellenar();
  }, [comprobanteAsociado]);

  const limpiarCaptura = useCallback(() => {
    setCodigoBusqueda("");
    setCantidadInput("1");
    setProductoEncontrado(null);
    inputCodigoRef.current?.focus();
  }, []);

  // === 4.1 AGREGAR ITEM MANUAL ===
  const [nombreManual, setNombreManual] = useState("");
  const [precioManual, setPrecioManual] = useState("");
  const [mostrandoManual, setMostrandoManual] = useState(false);

  const agregarItemManual = useCallback(() => {
    if (!nombreManual || !precioManual) {
      agregarAlerta({
        title: "Datos incompletos",
        message: "Escriba un nombre y precio para el producto manual",
        type: "warning",
      });
      return;
    }

    const nuevoItem = {
      codigoSecuencial: Date.now(), // ID temporal
      nombre: nombreManual.toUpperCase(),
      cantidad: parseFloat(cantidadInput) || 1,
      precioVenta: parseFloat(precioManual),
      precioBase: parseFloat(precioManual),
      esManual: true,
    };

    setItems((prev) => [...prev, nuevoItem]);
    setNombreManual("");
    setPrecioManual("");
    setMostrandoManual(false);
    inputCodigoRef.current?.focus();
  }, [nombreManual, precioManual, cantidadInput, agregarAlerta]);

  const handleCodigoKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const maxIndex =
          codigoBusqueda.length > 0 ? productos.length : productos.length - 1;
        setHighlightedIndex((p) => (p < maxIndex ? p + 1 : p));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((p) => (p > 0 ? p - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const queryTrimmed = codigoBusqueda.trim();
        let p =
          highlightedIndex >= 0
            ? highlightedIndex < productos.length
              ? productos[highlightedIndex]
              : queryTrimmed
                ? {
                    id: `m-${Date.now()}`,
                    codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
                    nombre: queryTrimmed.toUpperCase(),
                    descripcion: "ITEM MANUAL",
                    manual: true,
                  }
                : null
            : productos[0] ||
              (queryTrimmed
                ? {
                    id: `m-${Date.now()}`,
                    codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
                    nombre: queryTrimmed.toUpperCase(),
                    descripcion: "ITEM MANUAL",
                    manual: true,
                  }
                : null);

        if (p) {
          agregarItem(p, 1);
          setMostrarDropdownProducto(false);
        }
      } else if (e.key === "Escape") setMostrarDropdownProducto(false);
    },
    [
      codigoBusqueda,
      productos,
      highlightedIndex,
      busquedaClaveProducto,
      agregarItem,
    ],
  );

  const handleClienteKeyDown = useCallback(
    (e) => {
      if (!mostrarDropdownCliente) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndexCliente((p) =>
          p < clientesFiltrados.length - 1 ? p + 1 : p,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndexCliente((p) => (p > 0 ? p - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (
          highlightedIndexCliente >= 0 &&
          highlightedIndexCliente < clientesFiltrados.length
        ) {
          const c = clientesFiltrados[highlightedIndexCliente];
          setClienteSeleccionado(c);
          setBusquedaCliente(`${c.razonSocial || c.nombre + " " + c.apellido}`);
          setMostrarDropdownCliente(false);
          setHighlightedIndexCliente(-1);
        }
      } else if (e.key === "Escape") {
        setMostrarDropdownCliente(false);
        setHighlightedIndexCliente(-1);
      }
    },
    [mostrarDropdownCliente, clientesFiltrados, highlightedIndexCliente],
  );

  const handleFinalizar = useCallback(() => {
    if (cart.items.length === 0) {
      agregarAlerta({
        title: "Carrito vacío",
        message: "Agregue al menos un producto para facturar",
        type: "warning",
      });
      return;
    }
    setMostrarPreview(true);
  }, [cart.items.length, agregarAlerta]);

  const confirmarVentaFinal = useCallback(async () => {
    if (mutationGenerar.isPending) return;

    const r2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const itemsProcesados = cart.items.map((i) => {
      const subtotalLinea = r2(calcularTotalItem(i));
      const netoLinea = r2(calcularNetoItem(i, fiscal.aplicaIva));
      const ivaLinea = r2(subtotalLinea - netoLinea);
      const precioUnitarioNeto = r2(netoLinea / (i.cantidad || 1));

      return {
        rawId: i.codigoSecuencial || i.id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: precioUnitarioNeto,
        descuento: i.descuento || 0,
        tasaIva: i.tasaIva || 0,
        subtotal: subtotalLinea,
        neto: netoLinea,
        iva: ivaLinea,
      };
    });

    const body = {
      puntoVenta: Number(unidadActiva?.puntoVenta || 1),
      codigoUsuario: Number(usuario?.codigoUsuario || usuario?.id || 1),
      codigoCliente: clienteSeleccionado?.codigoSecuencial || null,
      tipoDocumento: Number(fiscal.tipoDocumento),
      letraComprobante: fiscal.enBlanco === "si"
        ? obtenerLetraDeComprobante(fiscal.tipoDocumento)
        : "X",
      metodoPago: pagos.metodoPago,
      pagos: pagos.listaPagos.map((p) => ({
        metodo: p.metodo,
        monto: r2(p.monto),
        referencia: p.referencia,
        detalles: p.detalles || "",
      })),
      condicionVenta: condicionVenta,
      items: cart.items.map((item) => {
        const pUnit = r2(item.precioUnitario || item.precioVenta);
        const cant = Number(item.cantidad);
        return {
          codigoProducto: Number(item.id_producto || item.id) || undefined,
          nombre: item.nombre || item.descripcion,
          cantidad: cant,
          precioUnitario: pUnit,
          subtotal: r2(pUnit * cant),
          tasaIva: 21, // O el que corresponda
        };
      }),
      totales: {
        total: r2(cart.totales.total),
        iva: r2(cart.totales.iva),
        subtotal: r2(cart.totales.subtotal),
      },
      fiscal: fiscal.enBlanco === "si",
      comprobantesAsociados: comprobanteAsociado
        ? [
            {
              tipo: 1, // Por ahora fijo, luego se puede mapear
              ptoVta: Number(comprobanteAsociado.split("-")[0]),
              nro: Number(comprobanteAsociado.split("-")[1]),
            },
          ]
        : [],
      observaciones: observaciones || "",
      periodo: periodo || null,
    };

    console.log("Enviando DTO Final:", body);

    mutationGenerar.mutate(
      {
        dto: body,
        codigoEmpresa: Number(usuario?.codigoEmpresa || 1),
        codigoUnidadNegocio: Number(unidadLocal),
      },
      {
        onSuccess: () => {
          agregarAlerta({
            title: "Venta Exitosa",
            message: "Comprobante generado correctamente",
            type: "success",
          });
          cart.setItems([]);
          pagos.setListaPagos([]);
          setClienteSeleccionado(null);
          setBusquedaCliente("");
          setComprobanteAsociado("");
          setObservaciones("");
          setMostrarPreview(false);
          limpiarCaptura();
        },
        onError: (err) => {
          console.error("Error al generar venta:", err);
        },
      },
    );
  }, [
    cart,
    fiscal,
    pagos,
    clienteSeleccionado,
    condicionVenta,
    comprobanteAsociado,
    observaciones,
    periodo,
    unidadLocal,
    mutationGenerar,
    agregarAlerta,
    limpiarCaptura,
    usuario,
    unidadActiva, // AÑADIDAS DEPENDENCIAS CRÍTICAS
  ]);

  return {
    ...cart,
    ...fiscal,
    ...pagos,
    usuario,
    unidadLocal,
    setUnidadLocal,
    entidades,
    entidadSeleccionada,
    setEntidadSeleccionada,
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    setClienteSeleccionado,
    mostrarDropdownCliente,
    setMostrarDropdownCliente,
    highlightedIndexCliente,
    setHighlightedIndexCliente,
    clientesFiltrados,
    filtrosProductos,
    setFiltrosProductos,
    busquedaClaveProducto,
    setBusquedaClaveProducto,
    codigoBusqueda,
    setCodigoBusqueda,
    cantidadInput,
    setCantidadInput,
    mostrarDropdownProducto,
    setMostrarDropdownProducto,
    highlightedIndex,
    setHighlightedIndex,
    productos,
    cargandoProductos,
    comprobanteAsociado,
    setComprobanteAsociado,
    busquedaFactura,
    setBusquedaFactura,
    mostrarDropdownFactura,
    setMostrarDropdownFactura,
    mostrarPreview,
    setMostrarPreview,
    tabActiva,
    setTabActiva,
    observaciones,
    setObservaciones,
    camposDinamicos,
    cargandoConfigs,
    columnaPrecioSeleccionada,
    setColumnaPrecioSeleccionada,
    periodo,
    inputCodigoRef,
    inputCantidadRef,
    handleCodigoKeyDown,
    handleClienteKeyDown,
    handleFinalizar,
    confirmarVentaFinal,
    condicionVenta,
    setCondicionVenta,
    cargandoCobro: mutationGenerar.isPending,
    paso,
    setPaso,
    siguientePaso,
    anteriorPaso,
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
  };
};
