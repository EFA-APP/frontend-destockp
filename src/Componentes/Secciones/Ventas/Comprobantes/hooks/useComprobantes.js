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
import { useFacturarEnvios } from "../../../../../Backend/Articulos/queries/Transporte/useTransporte";
import { usePlanDeCuentas } from "../../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import {
  calcularNetoItem,
  calcularTotalItem,
  getPrecio,
} from "../utils/fiscal.utils";

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

const MOCK_CUENTAS_CONTABLES = [
  { value: 10101, label: "1.01.01 - Caja General", codigo: "1.01.01", nombre: "Caja General" },
  { value: 10102, label: "1.01.02 - Banco Nación", codigo: "1.01.02", nombre: "Banco Nación" },
  { value: 10103, label: "1.01.03 - Banco Galicia", codigo: "1.01.03", nombre: "Banco Galicia" },
  { value: 10104, label: "1.01.04 - Valores a Depositar (Cheques)", codigo: "1.01.04", nombre: "Valores a Depositar (Cheques)" },
  { value: 11201, label: "1.01.12 - Deudores por Ventas", codigo: "1.01.12", nombre: "Deudores por Ventas" },
  { value: 460, label: "4.01.01 - Ingreso por Cuotas", codigo: "4.01.01", nombre: "INGRESO POR CUOTAS" },
  { value: 40102, label: "4.01.02 - Ventas de Servicios", codigo: "4.01.02", nombre: "Ventas de Servicios" },
  { value: 50101, label: "5.01.01 - Costo de Mercaderías Vendidas", codigo: "5.01.01", nombre: "Costo de Mercaderías Vendidas" },
];

const MOCK_BANCOS = [
  { value: 475, label: "Banco Galicia SA" },
  { value: 476, label: "Banco Nación Argentina" },
  { value: 477, label: "Banco Provincia de Buenos Aires" },
  { value: 478, label: "Banco Macro" },
  { value: 479, label: "Banco Santander" },
  { value: 480, label: "Banco de Córdoba" },
];

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

  // === TABS DE OPERACIÓN (VENTAS = INGRESO, COMPRAS = EGRESO) ===
  const [tipoOperacion, setTipoOperacion] = useState("INGRESO");

  // === CAMPOS DE COMPRAS (EGRESO) ===
  const [cae, setCae] = useState("");
  const [vtoCae, setVtoCae] = useState("");
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [materiaPrimaCheck, setMateriaPrimaCheck] = useState(false);

  // === GESTIÓN DE PRODUCTO / CUENTA CONTABLE ===
  const [tipoItemAgregar, setTipoItemAgregar] = useState("PRODUCTO"); // PRODUCTO / CUENTA_CONTABLE
  const [cuentaContableSeleccionada, setCuentaContableSeleccionada] = useState("");
  const [precioCuentaContable, setPrecioCuentaContable] = useState("");
  const [nombreCuentaContable, setNombreCuentaContable] = useState("");
  const [ivaCuentaContable, setIvaCuentaContable] = useState(21);

  // === COMPROBANTES ASOCIADOS (MÚLTIPLES) ===
  const [comprobantesAsociados, setComprobantesAsociados] = useState([]);

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
  const planDeCuentas = usePlanDeCuentas();
  const fiscal = useVentaFiscal(usuario, arcaConectado);
  const letraComprobante = useMemo(() => {
    return fiscal.enBlanco === "si"
      ? obtenerLetraPorTipo(fiscal.tipoDocumento)
      : "X";
  }, [fiscal.enBlanco, fiscal.tipoDocumento]);

  const cart = useVentaCart(agregarAlerta, "precioVenta", fiscal.aplicaIva, letraComprobante);
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const pagos = useVentaPagos(
    cart.totales.total,
    condicionVenta,
    setCondicionVenta,
    agregarAlerta,
  );

  // Destructuración para lógica interna
  const { items, setItems, agregarItem } = cart;
  const { listaPagos, setListaPagos, vuelto } = pagos;
  const { tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco } = fiscal;

  const cuentasContables = useMemo(() => {
    if (planDeCuentas?.cuentasImputables && planDeCuentas.cuentasImputables.length > 0) {
      return planDeCuentas.cuentasImputables;
    }
    return MOCK_CUENTAS_CONTABLES;
  }, [planDeCuentas?.cuentasImputables]);

  const { contactos: clientesRaw } = useContactos({
    tipoEntidad: entidadSeleccionada || (tipoOperacion === "EGRESO" ? "PROV" : "CLIE"),
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
  const [guiasIds, setGuiasIds] = useState([]);

  // === 4. ESTADOS DE CAMPOS DINÁMICOS ===
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [cargandoConfigs, setCargandoConfigs] = useState(false);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] =
    useState("precioVenta");
  const [periodo, setPeriodo] = useState(null);

  // === 5.5 GESTIÓN DE PASOS (STEPPER) ===
  const [paso, setPaso] = useState(1);
  const [modalContabilidad, setModalContabilidad] = useState({
    show: false,
    message: "",
  }); // 1: Productos, 2: Config/Cliente, 3: Pagos, 4: Preview

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
  const mutationFacturarEnvios = useFacturarEnvios();

  const puedeHacerFiscal =
    usuario?.conexionArca || usuario?.configuracionArca?.activo;

  // Forzar Interno si no puede hacer fiscal
  useEffect(() => {
    if (!puedeHacerFiscal && enBlanco === "si") {
      setEnBlanco("no");
    }
  }, [puedeHacerFiscal, enBlanco, setEnBlanco]);

  // === EFECTO: Carga desde Navegación (Ej: Escuela -> POS o Transporte -> POS) ===
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
    } else if (
      location.state?.origen === "TRANSPORTE_GUIAS" &&
      location.state?.itemsCobro
    ) {
      console.log(
        "[POS] Cargando datos desde Transporte (Guías)...",
        location.state,
      );

      const { cliente, itemsCobro, guiasIds: ids } = location.state;

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
          id: item.id || `m-transporte-${Date.now()}-${index}`, // ID temporal
          codigoSecuencial: item.codigoSecuencial || `TRA-${index}`,
          descuento: 0,
          atributos: {
            precioVenta: item.precioUnitario,
          },
          esManual: true,
        }));
        setItems(nuevosItems);
      }

      // 3. Cargar IDs de Guías
      if (Array.isArray(ids)) {
        setGuiasIds(ids);
      }

      agregarAlerta({
        title: "Cobro de Guías",
        message: "Se han cargado las guías seleccionadas en el punto de cobro.",
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

    const totalPagado = listaPagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);
    const difiere = Math.abs(totalPagado - cart.totales.total) > 0.01;

    if (tipoOperacion === "EGRESO" && difiere) {
      agregarAlerta({
        title: "Error de Conciliación",
        message: "En Compras (Egresos), el total registrado de pagos debe coincidir exactamente con el total del comprobante.",
        type: "danger",
      });
      return;
    }

    if (condicionVenta === "contado" && listaPagos.length === 0) {
      if (Number(tipoDocumento) !== 995) {
        agregarAlerta({
          title: "Pago requerido",
          message: "Debe registrar al menos un pago para ventas al contado",
          type: "warning",
        });
        return;
      }
    }

    setMostrarPreview(true);
  }, [
    cart.items.length,
    cart.totales.total,
    condicionVenta,
    listaPagos,
    tipoDocumento,
    tipoOperacion,
    agregarAlerta,
  ]);
     // === FUNCIÓN DE AGREGAR CUENTA CONTABLE ITEM ===
  const agregarCuentaContableItem = useCallback((cuentaId, nombre, precio, ivaPct) => {
    if (!cuentaId || !nombre || !precio) {
      agregarAlerta({
        title: "Datos incompletos",
        message: "Debe seleccionar una cuenta contable, ingresar un nombre y un precio",
        type: "warning",
      });
      return;
    }

    const pr = parseFloat(precio);
    if (isNaN(pr) || pr <= 0) {
      agregarAlerta({
        title: "Precio Inválido",
        message: "El precio debe ser mayor a 0",
        type: "warning",
      });
      return;
    }

    const nuevoItem = {
      id: `cuenta-${cuentaId}-${Date.now()}`,
      codigoSecuencial: Number(cuentaId),
      tipoDetalle: "CUENTA_CONTABLE",
      nombre: nombre.toUpperCase(),
      descripcion: "IMPUTACIÓN DIRECTA A CUENTA CONTABLE",
      cantidad: 1,
      precioUnitario: pr,
      descuento: 0,
      tasaIva: parseFloat(ivaPct) || 0,
    };

    setItems((prev) => [...prev, nuevoItem]);
    setCuentaContableSeleccionada("");
    setPrecioCuentaContable("");
    setNombreCuentaContable("");
    agregarAlerta({
      title: "Cuenta agregada",
      message: `Se agregó la imputación contable por ${formatPrice(pr)}`,
      type: "success",
    });
  }, [agregarAlerta, setItems]);

  // === GESTIÓN DE COMPROBANTES ASOCIADOS ===
  const agregarComprobanteAsociado = useCallback((comp) => {
    if (!comp) return;
    const yaExiste = comprobantesAsociados.some(
      (c) => c.numeroComprobante === comp.numeroComprobante && c.codigoTipoComprobante === (comp.tipoDocumento || comp.codigoTipoComprobante)
    );
    if (yaExiste) {
      agregarAlerta({
        title: "Ya asociado",
        message: "Este comprobante ya se encuentra asociado",
        type: "warning",
      });
      return;
    }

    const nuevoAsociado = {
      codigoComprobante: comp.id || comp.codigoSecuencial || null,
      tipoDescripcionComprobante: comp.tipoDescripcionComprobante || "FACTURA",
      tipoRelacion: esNotaCredito(tipoDocumento) ? "NOTA_CREDITO" : esNotaDebito(tipoDocumento) ? "NOTA_DEBITO" : "APLICA_PAGO",
      numeroComprobante: comp.numeroComprobante,
      codigoTipoComprobante: comp.tipoDocumento || comp.codigoTipoComprobante || 11,
      importeAplicado: comp.saldoPendiente !== undefined ? Number(comp.saldoPendiente) : Number(comp.total || 0),
      codigoUnidadNegocio: comp.codigoUnidadNegocio || Number(unidadLocal) || 1,
    };
    setComprobantesAsociados((prev) => [...prev, nuevoAsociado]);
  }, [comprobantesAsociados, tipoDocumento, unidadLocal, agregarAlerta]);

  const eliminarComprobanteAsociado = useCallback((index) => {
    setComprobantesAsociados((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarImporteAsociado = useCallback((index, valor) => {
    setComprobantesAsociados((prev) =>
      prev.map((c, i) => (i === index ? { ...c, importeAplicado: parseFloat(valor) || 0 } : c))
    );
  }, []);

  const [vueltoMetodo, setVueltoMetodo] = useState("EFECTIVO");
  const [vueltoBancoDestino, setVueltoBancoDestino] = useState("");

  const tipoDescripcionComprobante = useMemo(() => {
    if (esNotaCredito(tipoDocumento)) return "NOTA_CREDITO";
    if (esNotaDebito(tipoDocumento)) return "NOTA_DEBITO";
    if (esRecibo(tipoDocumento)) {
      return tipoOperacion === "EGRESO" ? "ORDEN_PAGO" : "RECIBO";
    }
    return "FACTURA";
  }, [tipoDocumento, tipoOperacion]);

  const tipoOperacionFinal = useMemo(() => {
    if (tipoDescripcionComprobante === "NOTA_CREDITO") {
      return tipoOperacion === "EGRESO" ? "ANULACION_EGRESO" : "ANULACION_INGRESO";
    }
    return tipoOperacion; // INGRESO or EGRESO
  }, [tipoOperacion, tipoDescripcionComprobante]);

  const tiposComprobante = useMemo(() => {
    if (enBlanco === "no") {
      if (tipoOperacion === "EGRESO") {
        return [
          { id: 991, label: "COMPROBANTE DE COMPRA (I)" },
          { id: 993, label: "NOTA DE CRÉDITO (I)" },
          { id: 994, label: "NOTA DE DÉBITO (I)" },
          { id: 992, label: "ORDEN DE PAGO (I)" },
        ];
      }
      return [
        { id: 991, label: "COMPROBANTE DE VENTA (I)" },
        { id: 992, label: "RECIBO DE COBRO (I)" },
        { id: 993, label: "NOTA DE CRÉDITO (I)" },
        { id: 994, label: "NOTA DE DÉBITO (I)" },
      ];
    }
    return fiscal.tiposComprobante;
  }, [fiscal.tiposComprobante, enBlanco, tipoOperacion]);

  const confirmarVentaFinal = useCallback(
    async (opciones = {}) => {
      const r2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

      const itemsProcesados = cart.items.map((i) => {
        const subtotalLinea = r2(calcularTotalItem(i, fiscal.aplicaIva, letraComprobante));
        const netoLinea = r2(calcularNetoItem(i, fiscal.aplicaIva, letraComprobante));
        const ivaLinea = r2(subtotalLinea - netoLinea);
        const precioUnitarioNeto = r2(netoLinea / (i.cantidad || 1));

        return {
          tipoDetalle: i.tipoDetalle || "PRODUCTO",
          codigoDetalle: Number(i.codigoSecuencial || i.id) || 1,
          nombre: i.nombre,
          descripcion: i.descripcion || "",
          codigoDeposito: i.codigoDeposito || 2,
          cantidad: Number(i.cantidad) || 1,
          descuento: Number(i.descuento) || 0,
          precioUnitario: Number(precioUnitarioNeto),
          iva: Number(ivaLinea),
          subtotal: Number(subtotalLinea),
          ...(i.atributos ? { metadata: i.atributos } : {})
        };
      });

      const totalPagos = pagos.listaPagos.reduce((a, p) => a + Number(p.monto || 0), 0);
      const conditionFinal = totalPagos > 0 && totalPagos < cart.totales.total - 0.01
        ? "CUENTA_CORRIENTE"
        : totalPagos === 0
          ? "CUENTA_CORRIENTE"
          : condicionVenta.toUpperCase();

      const receptorObj = (() => {
        const contacto = clienteSeleccionado || receptorVinculado;
        const ente = contacto?.enteFacturacion;
        const fuente = ente || contacto;

        return contacto
          ? {
              razonSocial: fuente.razonSocial || `${fuente.nombre || ""} ${fuente.apellido || ""}`.trim() || "CONSUMIDOR FINAL",
              nombre: fuente.nombre || "",
              apellido: fuente.apellido || "",
              DocTipo: Number(fuente.tipoDocumento || fuente.DocTipo || fuente.tipoDocumentoId || 99),
              DocNro: Number(fuente.documento || fuente.DocNro || fuente.numeroDocumento || 0),
              CondicionIVAReceptorId: Number(fuente.CondicionIVAReceptorId || fuente.condicionIvaId || 5),
              domicilio: fuente.domicilio || fuente.direccion || "",
            }
          : {
              razonSocial: "CONSUMIDOR FINAL",
              DocTipo: 99,
              DocNro: 0,
              CondicionIVAReceptorId: 5,
            };
      })();

      // Mapping pagos to detallePagos
      const detallePagos = opciones.manejoSaldoNC === "favor"
        ? []
        : pagos.listaPagos.map((p) => {
            const mapped = {
              fechaPago: p.fechaPago || new Date().toISOString().split("T")[0],
              metodoPago: (() => {
                if (p.tipo === "CREDITO") return "TARJETA_CREDITO";
                if (p.tipo === "DEBITO") return "TARJETA_DEBITO";
                if (p.tipo === "TRANSFERENCIA") return "TRANSFERENCIA";
                if (p.tipo === "CHEQUE") {
                  return p.tipoCheque === "PROPIO" ? "CHEQUE_PROPIO" : "CHEQUE_TERCERO";
                }
                return "EFECTIVO";
              })(),
              monto: r2(p.monto),
            };

            if (p.codigoBancoDestino) {
              mapped.codigoBancoDestino = Number(p.codigoBancoDestino);
            }

            if (p.tipo === "CREDITO" || p.tipo === "DEBITO") {
              mapped.datosTarjeta = {
                tipoTarjeta: p.tipo === "CREDITO" ? "CREDITO" : "DEBITO",
                marca: p.entidadId || "VISA",
                cantidadCuotas: Number(p.cuotas) || 1,
                recargo: Number(p.recargo) || 0,
                cupon: p.cupon || "",
                lote: p.lote || "",
                autorizacion: p.autorizacion || "ACEPTADA",
                fechaAcreditacion: p.vencimientoCheque || new Date().toISOString().split("T")[0],
              };
            }

            if (p.tipo === "CHEQUE" && p.tipoCheque === "PROPIO") {
              mapped.chequePropio = {
                estado: "EMITIDO",
                tipoCheque: p.tipoChequePropio || "CORRIENTE",
                banco: p.bancoCheque || "",
                numero: p.numeroCheque || "",
                cuenta: p.cuentaCheque || "",
                fechaEmision: p.fechaEmisionCheque || new Date().toISOString().split("T")[0],
                fechaPago: p.vencimientoCheque || new Date().toISOString().split("T")[0],
                importe: r2(p.monto),
              };
            }

            if (p.tipo === "CHEQUE" && p.tipoCheque === "TERCERO") {
              mapped.chequeTercero = {
                estado: "RECIBIDO",
                banco: p.bancoCheque || "",
                numero: p.numeroCheque || "",
                cuitEmisor: p.cuitEmisorCheque || "",
                titular: p.titularCheque || "",
                fechaEmision: p.fechaEmisionCheque || new Date().toISOString().split("T")[0],
                fechaPago: p.vencimientoCheque || new Date().toISOString().split("T")[0],
                importe: r2(p.monto),
              };
            }

            return mapped;
          });

      // Vueltos mapping
      const vueltosPayload = vuelto > 0
        ? [
            {
              fechaEntregado: new Date().toISOString().split("T")[0],
              tipoMetodoPago: vueltoMetodo || "EFECTIVO",
              monto: r2(vuelto),
              ...(vueltoMetodo === "TRANSFERENCIA" && vueltoBancoDestino ? { codigoBancoDestino: Number(vueltoBancoDestino) } : {})
            }
          ]
        : [];

      const body = {
        tipoDescripcionComprobante,
        tipoOperacion: tipoOperacionFinal,
        fechaEmision: new Date().toISOString().split("T")[0],
        fechaVto: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        puntoVenta: Number(
          fiscal.enBlanco === "si"
            ? 1
            : 99,
        ),
        codigoReceptor: clienteSeleccionado?.codigoSecuencial || 1,
        entidadReceptor: tipoOperacion === "EGRESO" ? "PROV" : "CLIE",
        codigoTipoComprobante: Number(fiscal.tipoDocumento),
        condicionComprobante: conditionFinal,
        observaciones: observaciones || "nueva transacción",
        subtotal: r2(cart.totales.subtotal),
        iva: r2(cart.totales.iva),
        total: r2(cart.totales.total),
        detalle: itemsProcesados,
        detallePagos,
        vueltos: vueltosPayload,
        comprobantesAsociados: comprobantesAsociados,
        receptor: receptorObj,
      };

      if (tipoOperacion === "EGRESO") {
        body.cae = cae || undefined;
        body.vtoCae = vtoCae || undefined;
        body.numeroComprobante = Number(numeroComprobante) || undefined;
      }

      console.log("[POS CONFIRMATION MOCK SAVE] Payload DTO generated:", JSON.stringify(body, null, 2));

      agregarAlerta({
        title: `${tipoOperacion === "EGRESO" ? "Compra" : "Venta"} Guardada (Simulado)`,
        message: "El payload fue generado y logueado en la consola. Todo listo para la fase de integración.",
        type: "success",
      });

      // Reset states
      cart.setItems([]);
      pagos.setListaPagos([]);
      setClienteSeleccionado(null);
      setBusquedaCliente("");
      setComprobanteAsociado("");
      setComprobantesAsociados([]);
      setObservaciones("");
      setMostrarPreview(false);
      setCae("");
      setVtoCae("");
      setNumeroComprobante("");
      setVueltoMetodo("EFECTIVO");
      setVueltoBancoDestino("");
      setPaso(1);
      limpiarCaptura();

      // TODO: conectar con mutación real
      // mutationGenerar.mutate({ dto: body, ... })
    },
    [
      cart,
      fiscal,
      pagos,
      clienteSeleccionado,
      condicionVenta,
      comprobanteAsociado,
      comprobantesAsociados,
      observaciones,
      unidadLocal,
      tipoOperacion,
      tipoOperacionFinal,
      tipoDescripcionComprobante,
      cae,
      vtoCae,
      numeroComprobante,
      vueltoMetodo,
      vueltoBancoDestino,
      vuelto,
      letraComprobante,
      agregarAlerta,
      limpiarCaptura,
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
    // Guías de Transporte
    guiasIds,
    setGuiasIds,

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
    materiaPrimaCheck,
    setMateriaPrimaCheck,

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
    tiposComprobante,
    letraComprobante,
    facturas,
  };
};
