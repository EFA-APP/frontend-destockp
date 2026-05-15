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
import { calcularNetoItem, calcularTotalItem, getPrecio } from "../utils/fiscal.utils";

// Sub-hooks refactorizados
import { useVentaCart } from "./useVentaCart";
import { useVentaFiscal } from "./useVentaFiscal";
import { useVentaPagos } from "./useVentaPagos";

import {
  obtenerLetraPorTipo,
  esNotaCredito,
  esNotaDebito,
  esRecibo,
  CONDICION_IVA,
} from "../reglas/reglasFiscales";
import { obtenerAjusteCorrespondiente } from "../reglas/reglasComprobantes";
import { validarOperacionFiscal } from "../reglas/reglasValidacion";

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

  // === 2. ESTADOS DE CLIENTE Y ENTIDADES (Mantenidos aquí para evitar ReferenceError en módulos) ===
  const entidades = useMemo(() => usuario?.unidadesNegocio || [], [usuario]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [mostrarFormularioContacto, setMostrarFormularioContacto] =
    useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [highlightedIndexCliente, setHighlightedIndexCliente] = useState(-1);

  // === 3. MODULOS REFACTORIZADOS ===
  const fiscal = useVentaFiscal(usuario, arcaConectado);
  const cart = useVentaCart(agregarAlerta, "precioVenta", fiscal.aplicaIva);
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const pagos = useVentaPagos(
    cart.totales.total,
    condicionVenta,
    setCondicionVenta,
    agregarAlerta,
  );

  // Destructuración para lógica interna
  const { items, setItems, agregarItem } = cart;
  const { listaPagos, setListaPagos } = pagos;
  const { tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco } = fiscal;

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
  const [esEmisionPago, setEsEmisionPago] = useState(false);

  // === 4. ESTADOS DE CAMPOS DINÁMICOS ===
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [cargandoConfigs, setCargandoConfigs] = useState(false);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] =
    useState("precioVenta");
  const [periodo, setPeriodo] = useState(null);

  // === 5.5 GESTIÓN DE PASOS (STEPPER) ===
  const [paso, setPaso] = useState(1);
  const [modalContabilidad, setModalContabilidad] = useState({ show: false, message: "" }); // 1: Productos, 2: Config/Cliente, 3: Pagos, 4: Preview

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

      // 3. Setear Periodo (para conciliación automática con cuotas)
      if (location.state.periodo) {
        const periodoStr = location.state.periodo; // ej: "2026-04"
        setPeriodo(periodoStr);
        // Nota: el periodo viaja como campo dedicado en el DTO, no en observaciones
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

  // === EFECTO: Carga desde Tabla de Comprobantes (Emitir Pago / Ajuste) ===
  useEffect(() => {
    if (location.state?.comprobanteAsociado) {
      const data = location.state.comprobanteAsociado;

      if (typeof data === "object") {
        const nro = `${String(data.puntoVenta).padStart(5, "0")}-${String(data.numeroComprobante).padStart(8, "0")}`;
        setComprobanteAsociado(nro);
        setFacturaPrevia(data); // Nuevo estado para guardar el objeto completo sin buscarlo
        if (data.codigoUnidadNegocio) setUnidadLocal(data.codigoUnidadNegocio);
      } else {
        setComprobanteAsociado(data);
      }

      if (location.state.emitirPago) {
        setEsEmisionPago(true);
      }

      if (location.state.emitirNC) {
        setEsNotaCreditoNav(true);
      }

      if (location.state.emitirND) {
        setEsNotaDebitoNav(true);
      }

      // Limpiar el estado de history para evitar recargas infinitas
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.comprobanteAsociado]);

  // Nuevos estados para modos de navegación
  const [esNotaCreditoNav, setEsNotaCreditoNav] = useState(false);
  const [esNotaDebitoNav, setEsNotaDebitoNav] = useState(false);

  // Nuevo estado para evitar búsquedas si ya tenemos la data
  const [facturaPrevia, setFacturaPrevia] = useState(null);

  // === EFECTO: Vinculación Inteligente (Autocompletar al asociar) ===
  useEffect(() => {
    if (!comprobanteAsociado) return;

    // 1. Buscar la factura original (Prioridad a la data inyectada directamente)
    const facturaOrigen =
      facturaPrevia ||
      facturas.find((f) => {
        const nro = `${String(f.puntoVenta).padStart(5, "0")}-${String(f.numeroComprobante).padStart(8, "0")}`;
        return (
          nro === comprobanteAsociado ||
          f.numeroComprobante === Number(comprobanteAsociado)
        );
      });

    if (!facturaOrigen) return;

    const autoRellenar = async () => {
      // === AJUSTE DE SALDO PENDIENTE (CONCILIACIÓN) ===
      const totalVoucher = Number(facturaOrigen.total || 0);
      // Usamos el campo estructural de la DB si existe, si no, calculamos el pagado inicial
      const saldoReal =
        facturaOrigen.saldoPendiente !== undefined
          ? Number(facturaOrigen.saldoPendiente)
          : totalVoucher -
            (facturaOrigen.pagos?.reduce((acc, p) => acc + (p.monto || 0), 0) ||
              0);

      if (esEmisionPago || location.state?.emitirPago) {
        // MODO EMISIÓN DE PAGO: Un solo item manual
        const labelItem = esNotaCreditoNav
          ? "ANULACIÓN"
          : esNotaDebitoNav
            ? "AJUSTE DÉBITO"
            : "PAGO";

        // Si es NC, usamos el total total para poder anular el comprobante madre
        // Si es Pago o ND, usamos el saldo pendiente
        const montoItem = esNotaCreditoNav ? totalVoucher : saldoReal;

        setItems([
          {
            id: `m-pago-${Date.now()}`,
            codigoSecuencial: `${labelItem}-${Date.now().toString().slice(-4)}`,
            nombre: `${labelItem} DE COMPROBANTE ${comprobanteAsociado}`,
            descripcion: "ABONO/PAGO/AJUSTE",
            cantidad: 1,
            precioUnitario: montoItem,
            precioVenta: montoItem,
            precioBase: montoItem,
            descuento: 0,
            tasaIva: 0,
            manual: true,
            esManual: true,
          },
        ]);
      } else {
        // 2. Mapear Items del carrito (Mantenido para Notas de Crédito/Débito)
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

          const yaPagado = totalVoucher - saldoReal;

          // Si es Nota de Crédito y tiene pagos previos, los cargamos automáticamente
          // Esto evita tener que registrar el cobro manualmente para el reintegro.
          if (
            esNotaCreditoNav &&
            Array.isArray(facturaOrigen.pagos) &&
            facturaOrigen.pagos.length > 0
          ) {
            setListaPagos(
              facturaOrigen.pagos.map((p, idx) => ({
                id: `ref-nc-${Date.now()}-${idx}`,
                tipo: p.metodo || p.tipo,
                monto: p.monto,
                detalles: p.detalles || "REINTEGRO AUTOMÁTICO",
                referencia:
                  p.referencia || `REF-ORIG-${facturaOrigen.numeroComprobante}`,
              })),
            );
          } else if (yaPagado > 0.01 && !esNotaCreditoNav) {
            // Para otros casos (como ND o Pagos), mantenemos el item de ajuste si corresponde
            nuevosItems.push({
              id: `adj-pago-${Date.now()}`,
              nombre: "- PAGOS REGISTRADOS ANTERIORMENTE",
              cantidad: 1,
              precioUnitario: -yaPagado,
              descuento: 0,
              tasaIva: 0,
              manual: true,
              esManual: true,
            });
          }

          setItems(nuevosItems);
        }
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

      // Sincronizar Modo Fiscal y Tipo de Comprobante según la Factura Origen
      setEnBlanco(facturaOrigen.fiscal ? "si" : "no");

      // Verificamos intención actual (NC vs ND vs RECIBO)
      const esNDActual = esNotaDebito(tipoDocumento) || esNotaDebitoNav;
      const esRecActual = esRecibo(tipoDocumento) || esEmisionPago;

      let tipoAjuste = "NC";
      if (esNDActual) tipoAjuste = "ND";
      if (esRecActual) tipoAjuste = "RECIBO";

      const nuevoTipo = obtenerAjusteCorrespondiente(
        facturaOrigen.tipoDocumento,
        tipoAjuste,
      );
      if (nuevoTipo) setTipoDocumento(nuevoTipo);

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

      // 8. Notificar éxito
      const labelAlerta = esNotaCreditoNav
        ? "Nota de Crédito"
        : esNotaDebitoNav
          ? "Nota de Débito"
          : "Recibo/Pago";

      agregarAlerta({
        title: `${labelAlerta} Vinculada`,
        message: `Se han cargado los datos para emitir un ajuste tipo ${labelAlerta} sobre la ${facturaOrigen.letraComprobante} ${comprobanteAsociado}.`,
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
      id: `manual-${Date.now()}`,
      codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
      nombre: nombreManual.toUpperCase(),
      descripcion: "PRODUCTO MANUAL",
      cantidad: parseFloat(cantidadInput) || 1,
      precioUnitario: parseFloat(precioManual),
      precioVenta: parseFloat(precioManual),
      precioBase: parseFloat(precioManual),
      tasaIva: 21,
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
          const precio = getPrecio(p, columnaPrecioSeleccionada);
          agregarItem(p, 1, (index) => {
            if (precio <= 0) {
              setTimeout(() => {
                const el = document.getElementById(`price-input-${index}`);
                if (el) {
                  el.focus();
                  el.select();
                }
              }, 100);
            }
          });
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

    if (condicionVenta === "contado" && listaPagos.length === 0) {
      agregarAlerta({
        title: "Pago requerido",
        message: "Debe registrar al menos un pago para ventas al contado",
        type: "warning",
      });
      return;
    }

    setMostrarPreview(true);
  }, [cart.items.length, condicionVenta, listaPagos.length, agregarAlerta]);

  const confirmarVentaFinal = useCallback(
    async (opciones = {}) => {
      if (mutationGenerar.isPending) return;

      const r2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

      const itemsProcesados = cart.items.map((i) => {
        const subtotalLinea = r2(calcularTotalItem(i));
        const netoLinea = r2(calcularNetoItem(i, fiscal.aplicaIva));
        const ivaLinea = r2(subtotalLinea - netoLinea);
        const precioUnitarioNeto = r2(netoLinea / (i.cantidad || 1));

        return {
          codigoProducto: Number(i.codigoSecuencial || i.id) || undefined,
          tipoArticulo: i.tipoArticulo || "PRODUCTO",
          nombre: i.nombre,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precioUnitario: precioUnitarioNeto,
          descuento: i.descuento || 0,
          tasaIva: i.tasaIva || 0,
          subtotal: subtotalLinea,
          metadata: i.atributos || i.metadata || {},
        };
      });
      console.log(
        "Punto de venta unidad negocio",
        unidadActiva?.configuracion?.puntoVenta,
      );
      // Buscar la unidad seleccionada en el selector (puede diferir de la activa globalmente)
      const unidadSeleccionada =
        entidades.find((u) => u.codigoSecuencial === Number(unidadLocal)) ||
        unidadActiva;

      // --- VALIDACIÓN DE COHERENCIA DE COMPROBANTE ---
      if (esNotaCreditoNav && !esNotaCredito(fiscal.tipoDocumento)) {
        agregarAlerta({
          title: "Tipo Inválido",
          message:
            "Debe seleccionar un tipo de Nota de Crédito para realizar esta anulación/ajuste.",
          type: "warning",
        });
        return;
      }

      if (esNotaDebitoNav && !esNotaDebito(fiscal.tipoDocumento)) {
        agregarAlerta({
          title: "Tipo Inválido",
          message:
            "Debe seleccionar un tipo de Nota de Débito para realizar este ajuste.",
          type: "warning",
        });
        return;
      }

      if (esEmisionPago && !esRecibo(fiscal.tipoDocumento)) {
        agregarAlerta({
          title: "Tipo Inválido",
          message:
            "Debe seleccionar un tipo de Recibo o Pago para registrar este cobro.",
          type: "warning",
        });
        return;
      }

      const body = {
        puntoVenta: Number(
          fiscal.enBlanco === "si"
            ? unidadSeleccionada?.configuracion?.puntoVenta ||
                unidadActiva?.configuracion?.puntoVenta ||
                1
            : 99, // Internos siempre en PtoVta 99 (sin conflicto con AFIP)
        ),
        codigoUsuario: Number(usuario?.codigoUsuario || usuario?.id || 1),
        codigoCliente: clienteSeleccionado?.codigoSecuencial || null,
        tipoDocumento: Number(fiscal.tipoDocumento),
        letraComprobante:
          fiscal.enBlanco === "si"
            ? obtenerLetraPorTipo(fiscal.tipoDocumento)
            : "X",
        pagos:
          opciones.manejoSaldoNC === "favor"
            ? []
            : pagos.listaPagos.map((p) => ({
                metodo: p.tipo || p.metodo || "EFECTIVO",
                monto: r2(p.monto),
                referencia: p.referencia,
                detalles: p.detalles || p.entidadId || "",
              })),
        condicionVenta: condicionVenta,
        items: itemsProcesados,
        totales: {
          total: r2(cart.totales.total),
          iva: r2(cart.totales.iva),
          subtotal: r2(cart.totales.subtotal),
        },
        fiscal: fiscal.enBlanco === "si",
        comprobantesAsociados: comprobanteAsociado
          ? [
              {
                tipo: Number(
                  facturaPrevia?.tipoDocumento ||
                    facturas.find(
                      (f) =>
                        `${String(f.puntoVenta).padStart(5, "0")}-${String(f.numeroComprobante).padStart(8, "0")}` ===
                          comprobanteAsociado ||
                        f.numeroComprobante === Number(comprobanteAsociado),
                    )?.tipoDocumento ||
                    1,
                ),
                ptoVta: Number(comprobanteAsociado.split("-")[0]),
                nro: Number(comprobanteAsociado.split("-")[1]),
              },
            ]
          : [],
        receptor: (() => {
            const contacto = clienteSeleccionado || receptorVinculado;
            const ente = contacto?.enteFacturacion;
            const fuente = ente || contacto; // Si hay ente, los datos legales vienen del ente

            return contacto
              ? {
                  razonSocial:
                    fuente.razonSocial ||
                    `${fuente.nombre || ""} ${fuente.apellido || ""}`.trim() ||
                    "CONSUMIDOR FINAL",
                  nombre: fuente.nombre || "",
                  apellido: fuente.apellido || "",
                  DocTipo: Number(
                    fuente.tipoDocumento || fuente.DocTipo || fuente.tipoDocumentoId || 99,
                  ),
                  DocNro: Number(
                    fuente.documento || fuente.DocNro || fuente.numeroDocumento || 0,
                  ),
                  CondicionIVAReceptorId: Number(
                    fuente.CondicionIVAReceptorId ||
                      fuente.condicionIvaId ||
                      5,
                  ),
                  domicilio: fuente.domicilio || fuente.direccion || "",
                  enteFacturacion: ente || null,
                }
              : {
                  razonSocial: "CONSUMIDOR FINAL",
                  DocTipo: 99,
                  DocNro: 0,
                  CondicionIVAReceptorId: 5,
                };
          })(),
        observaciones:
          `${observaciones || ""}${opciones.manejoSaldoNC ? ` [MODO NC: ${opciones.manejoSaldoNC === "favor" ? "SALDO A FAVOR" : "ANULACIÓN/REINTEGRO"}]` : ""}`.trim(),
        periodo: periodo || null,
        meta: {
          manejoSaldoNC: opciones.manejoSaldoNC,
        },
        tipoEntidad: (clienteSeleccionado || receptorVinculado)?.enteFacturacion?.tipoEntidad || (clienteSeleccionado || receptorVinculado)?.tipoEntidad || null,
        codigoDeposito: unidadSeleccionada?.configuracion?.codigoDeposito ? Number(unidadSeleccionada.configuracion.codigoDeposito) : undefined,
        usaContabilidad: !!usuario?.usaContabilidad,
      };

      // --- VALIDACIÓN FISCAL DINÁMICA ---
      const errorFiscal = validarOperacionFiscal(body);
      if (errorFiscal) {
        agregarAlerta({
          title: "Error Fiscal",
          message: errorFiscal,
          type: "warning",
        });
        return;
      }

      console.log("[POS] DTO Final a enviar:", JSON.stringify(body, null, 2));
      console.log("[POS] Cliente Seleccionado:", clienteSeleccionado);
      console.log(
        "[POS] Ente Facturación:",
        clienteSeleccionado?.enteFacturacion,
      );

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
            setPaso(1);
            limpiarCaptura();
          },
          onError: (err) => {
            console.error("Error al generar venta:", err);
            const msg = err?.response?.data?.message || "";
            if (
              msg.includes("configurar los asientos automáticos") || 
              msg.includes("servicio de contabilidad") ||
              msg.includes("error contable") ||
              msg.includes("Configuración incompleta")
            ) {
              setModalContabilidad({ show: true, message: msg });
            }
          },
        },
      );
    },
    [
      cart,
      fiscal,
      pagos,
      clienteSeleccionado,
      condicionVenta,
      comprobanteAsociado,
      observaciones,
      periodo,
      unidadLocal,
      entidades,
      mutationGenerar,
      agregarAlerta,
      limpiarCaptura,
      usuario,
      unidadActiva,
      esNotaCreditoNav,
      esNotaDebitoNav,
      esEmisionPago,
    ],
  );

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
    modalContabilidad,
    setModalContabilidad,
    siguientePaso,
    anteriorPaso,
    // Modos de Ajuste
    esEmisionPago,
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
  };
};
