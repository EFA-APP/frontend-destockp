import { useContactos } from "../../../../../Backend/Contactos/hooks/useContactos";
import {
  ListarEntidadesApi,
  ObtenerContactoApi,
} from "../../../../../Backend/Contactos/api/contactos.api";
import { ListarConfiguracionCamposApi } from "../../../../../Backend/Articulos/api/Producto/producto.api";
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

  // === 1.1 ESTADO LOCAL DE UNIDAD DE NEGOCIO ===
  // Permite que el POS opere en una unidad distinta a la global (BarraNavegacion)
  const [unidadLocal, setUnidadLocal] = useState(
    unidadActiva?.codigoSecuencial || 0,
  );

  // Sincronizar unidadLocal con unidadActiva global solo al cargar si no se ha seleccionado nada aún
  useEffect(() => {
    if (!unidadLocal && unidadActiva?.codigoSecuencial) {
      setUnidadLocal(unidadActiva.codigoSecuencial);
    }
  }, [unidadActiva]);

  // === 2. ESTADOS DE ENTIDADES Y CONTACTOS ===
  const [entidades, setEntidades] = useState([]);
  const [entidadSeleccionada, setEntidadSeleccionada] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
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
      enabled: !!(
        filtrosProductos.buscarPorNombre || filtrosProductos.buscarPorCodigo
      ),
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

  // === 3. ESTADOS FISCALES Y DE FACTURACIÓN ===
  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [cargandoVouchers, setCargandoVouchers] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState(99);
  const [enBlanco, setEnBlanco] = useState("si");
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [listaPagos, setListaPagos] = useState([]);
  const [nuevoPago, setNuevoPago] = useState({
    metodo: "efectivo",
    monto: 0,
    pagaCon: 0, // <--- Importe recibido para calcular vuelto
    detalles: "",
    referencia: "",
  });
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

  // === 5. EL TICKET (ITEMS) ===
  const [items, setItems] = useState([]);

  // === 6. REFERENCIAS PARA FOCO ===
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);

  // === 6.1 MUTACIONES ===
  const mutationGenerar = useGenerarComprobante();

  // === 7. DERIVACIONES FISCALES ===
  const aplicaIva = arcaConectado && enBlanco === "si"; // Simplificamos: si es fiscal y hay conexión, aplicamos desglose si tasaIva > 0

  const totales = useMemo(() => {
    let subtotal = 0,
      iva = 0,
      total = 0;
    items.forEach((item) => {
      subtotal += calcularNetoItem(item, aplicaIva);
      iva += calcularIVA(item, aplicaIva);
      total += calcularTotalItem(item);
    });
    return { subtotal, iva, total };
  }, [items, aplicaIva]);

  const vuelto = useMemo(() => {
    if (nuevoPago.metodo !== "efectivo" || !nuevoPago.pagaCon) return 0;
    const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0);
    const restante = totales.total - totalPagado;
    return Math.max(0, nuevoPago.pagaCon - restante);
  }, [nuevoPago.pagaCon, nuevoPago.metodo, totales.total, listaPagos]);

  // === 8. EFECTOS DE INICIALIZACIÓN Y SINCRONIZACIÓN ===

  // Carga de campos dinámicos y Entidades
  useEffect(() => {
    const cargarConfigs = async () => {
      setCargandoConfigs(true);
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        setCamposDinamicos(data || []);
        setColumnaPrecioSeleccionada("precioVenta");

        // Cargar entidades activas para el dropdown
        const entData = await ListarEntidadesApi();
        setEntidades(entData || []);
      } catch (e) {
        console.error("Error configs:", e);
      } finally {
        setCargandoConfigs(false);
      }
    };
    cargarConfigs();
  }, [unidadLocal]); // <--- Escuchar unidadLocal en lugar de la global

  // Limpiar carrito al cambiar de unidad de negocio para evitar inconsistencias
  useEffect(() => {
    if (items.length > 0) {
      setItems([]);
      agregarAlerta({
        title: "Contexto Cambiado",
        message:
          "Se ha vaciado el carrito debido al cambio de Unidad de Negocio.",
        type: "info",
      });
    }
    // Refrescar configs cuando cambia la unidad local
  }, [unidadLocal]);

  // Carga de Tipos de Comprobante ARCA
  useEffect(() => {
    const cargarVouchers = async () => {
      if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
        setCargandoVouchers(true);
        try {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;
          if (Array.isArray(vouchersRaw)) {
            const filtrados = vouchersRaw.map((v) => ({
              id: v.Id,
              label: v.Desc,
            }));
            setTiposComprobante(filtrados);
            if (filtrados.length > 0 && !tipoDocumento)
              setTipoDocumento(filtrados[0].id);
          }
        } catch (e) {
          console.error("Error vouchers:", e);
        } finally {
          setCargandoVouchers(false);
        }
      }
    };
    cargarVouchers();
  }, [usuario]);

  // Sync Modo (X vs ARCA)
  useEffect(() => {
    if (enBlanco === "no") {
      setTipoDocumento(99);
      setItems((prev) => prev.map((i) => ({ ...i, iva: 0 })));
    } else if (enBlanco === "si" && tipoDocumento === 99) {
      if (tiposComprobante.length > 0) setTipoDocumento(tiposComprobante[0].id);
    }
  }, [enBlanco, tiposComprobante]);

  // Sync automático con preferencia de ARCA
  useEffect(() => {
    if (arcaConectado && infoIva?.tipoFacturaDefault) {
      setTipoDocumento(infoIva.tipoFacturaDefault);
    }
  }, [arcaConectado, infoIva]);

  // Sugerencia automática de Tipo de Comprobante según el Cliente seleccionado
  useEffect(() => {
    if (
      clienteSeleccionado &&
      enBlanco === "si" &&
      tiposComprobante.length > 0
    ) {
      const condicion = (
        clienteSeleccionado.condicionIva ||
        clienteSeleccionado.condicionIVA ||
        ""
      ).toUpperCase();

      // Si el cliente es Responsable Inscripto, sugerimos Factura A (ID 1)
      // Siempre que estemos en una factura normal (no nota de crédito/débito vinculada)
      const esFacturaNormal = [1, 6, 11, 99].includes(Number(tipoDocumento));

      if (esFacturaNormal) {
        if (condicion === "RI") {
          setTipoDocumento(1); // Factura A
        } else {
          setTipoDocumento(6); // Factura B
        }
      }
    }
  }, [clienteSeleccionado, enBlanco, tiposComprobante]);

  // Debounce búsqueda productos
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosProductos((prev) => {
        const nuevos = { ...prev, pagina: 1 };
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;
        if (codigoBusqueda) {
          if (busquedaClaveProducto === "nombre")
            nuevos.buscarPorNombre = codigoBusqueda;
          else if (
            busquedaClaveProducto === "codigo" &&
            !isNaN(Number(codigoBusqueda))
          )
            nuevos.buscarPorCodigo = Number(codigoBusqueda);
        }
        return nuevos;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [codigoBusqueda, busquedaClaveProducto]);

  // Actualizar precios si cambia la columna seleccionada
  useEffect(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        precioUnitario: getPrecio(item, columnaPrecioSeleccionada),
      })),
    );
  }, [columnaPrecioSeleccionada]);

  // Actualizar monto sugerido del nuevo pago y automatizar condición de venta
  useEffect(() => {
    const totalPagado = listaPagos.reduce((acc, p) => acc + p.monto, 0);
    const restante = Math.max(0, totales.total - totalPagado);

    // Automatización: Si el monto pagado cubre el total, cambiar de Cuenta Corriente a Contado
    if (
      totalPagado >= totales.total - 0.01 &&
      condicionVenta === "cuenta_corriente"
    ) {
      setCondicionVenta("contado");
    }

    setNuevoPago((prev) => ({
      ...prev,
      monto: Math.round(restante * 100) / 100,
    }));
  }, [totales.total, listaPagos, condicionVenta]);

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

  const agregarItem = useCallback((p = null, c = null) => {
    const targetProduct = p || productoEncontrado;
    if (!targetProduct) return;

    const cantidad = c !== null ? parseFloat(c) : parseFloat(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      agregarAlerta({
        title: "Advertencia",
        message: "La cantidad debe ser mayor a 0",
        type: "warning",
      });
      return;
    }

    let finalIndex = -1;
    setItems((prev) => {
      const itemIndex = prev.findIndex(
        (i) => i.codigoSecuencial === targetProduct.codigoSecuencial,
      );
      if (itemIndex > -1) {
        finalIndex = itemIndex;
        const nuevosItems = [...prev];
        nuevosItems[itemIndex] = {
          ...nuevosItems[itemIndex],
          cantidad: nuevosItems[itemIndex].cantidad + cantidad,
        };
        return nuevosItems;
      }

      finalIndex = prev.length;
      return [
        ...prev,
        {
          ...targetProduct,
          cantidad,
          precioUnitario: getPrecio(targetProduct, columnaPrecioSeleccionada),
          descuento: 0,
          tasaIva: parseFloat(targetProduct.tasaIva) || 0,
        },
      ];
    });

    limpiarCaptura();

    // Notificar enfoque al componente TablaTicket (después del render)
    setTimeout(() => {
      const input = document.getElementById(`input-cant-${finalIndex}`);
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }, [
    productoEncontrado,
    cantidadInput,
    agregarAlerta,
    columnaPrecioSeleccionada,
    limpiarCaptura,
  ]);

  const eliminarItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    inputCodigoRef.current?.focus();
  }, []);

  const actualizarItem = useCallback((index, campo, valor) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)),
    );
  }, []);

  const agregarPagoConVuelto = useCallback((recibido, montoAImputar, vueltoCalculado) => {
    if (recibido <= 0) return;

    const nuevosPagos = [
      {
        id: `recibido-${Date.now()}`,
        metodo: "efectivo",
        monto: recibido,
        detalles: "DINERO RECIBIDO",
      },
    ];

    if (vueltoCalculado > 0) {
      nuevosPagos.push({
        id: `vuelto-${Date.now() + 1}`,
        metodo: "efectivo",
        monto: -vueltoCalculado,
        detalles: "VUELTO ENTREGADO",
      });
    }

    setListaPagos((prev) => [...prev, ...nuevosPagos]);

    // Limpiar campos de pago
    setNuevoPago((prev) => ({
      ...prev,
      monto: 0,
      pagaCon: 0,
    }));
  }, []);

  const agregarPago = useCallback(() => {
    if (nuevoPago.monto <= 0) return;
    setListaPagos((prev) => [...prev, { ...nuevoPago, id: Date.now() }]);
    setNuevoPago({
      metodo: "efectivo",
      monto: 0,
      pagaCon: 0,
      detalles: "",
      referencia: "",
    });
  }, [nuevoPago]);

  const eliminarPago = useCallback((index) => {
    setListaPagos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCodigoKeyDown = useCallback((e) => {
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
  }, [
    codigoBusqueda,
    productos,
    highlightedIndex,
    busquedaClaveProducto,
    agregarItem,
  ]);

  const handleClienteKeyDown = useCallback((e) => {
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
  }, [
    mostrarDropdownCliente,
    clientesFiltrados,
    highlightedIndexCliente,
  ]);

  const handleFinalizar = useCallback(() => {
    if (items.length === 0) {
      agregarAlerta({
        title: "Carrito vacío",
        message: "Agregue al menos un producto para facturar",
        type: "warning",
      });
      return;
    }
    setMostrarPreview(true);
  }, [items.length, agregarAlerta]);

  const confirmarVentaFinal = useCallback(async () => {
    if (mutationGenerar.isPending) return;

    const letraDerivada =
      tipoDocumento === 99
        ? "X"
        : [1, 2, 3, 4, 5].includes(Number(tipoDocumento))
          ? "A"
          : [6, 7, 8, 9, 10].includes(Number(tipoDocumento))
            ? "B"
            : "C";

    // Función auxiliar para redondear a 2 decimales
    const r2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    // Recalculamos los items asegurando el desglose Neto/IVA para AFIP
    const itemsProcesados = items.map((i) => {
      const subtotalLinea = r2(calcularTotalItem(i)); // ANTES NO ESTABA REDONDEADO
      const netoLinea = r2(calcularNetoItem(i, aplicaIva));
      const ivaLinea = r2(subtotalLinea - netoLinea);
      const precioUnitarioNeto = r2(netoLinea / (i.cantidad || 1));

      // Obtenemos el ID original para saber si es manual o de DB
      const rawId = i.codigoSecuencial || i.id;

      return {
        rawId,
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

    // Recalculamos totales globales para que coincidan EXACTO con la suma de los items redondeados
    const totalNetoFinal = r2(
      itemsProcesados.reduce((acc, i) => acc + i.neto, 0),
    );
    const totalIvaFinal = r2(
      itemsProcesados.reduce((acc, i) => acc + (i.iva || 0), 0),
    );
    const totalVentaFinal = r2(totalNetoFinal + totalIvaFinal);

    console.log("clienteSeleccionado", clienteSeleccionado);
    // VALIDACIÓN PREVIA PARA FACTURA A
    if (
      letraDerivada === "A" &&
      (!clienteSeleccionado ||
        (clienteSeleccionado.condicionIva !== "RI" &&
          clienteSeleccionado.condicionIVA !== "RI"))
    ) {
      agregarAlerta({
        title: "Cliente No Válido",
        message:
          "Para emitir una Factura A es obligatorio seleccionar un cliente que sea Responsable Inscripto.",
        type: "error",
      });
      return;
    }

    // La venta solo puede ser fiscal si el modo está en "si" Y el usuario tiene permiso/conexión real
    const esFiscalFinal = enBlanco === "si" && usuario?.conexionArca === true;

    console.log(
      "[POS] Generando comprobante. Cliente:",
      clienteSeleccionado?.codigoSecuencial || "NULO",
      "Periodo:",
      periodo,
    );

    // Mapeo detallado del DTO para el backend
    const dto = {
      puntoVenta: tipoDocumento === 99 ? 99 : 1,
      codigoUsuario: usuario?.id || 1,
      tipoDocumento: Number(tipoDocumento),
      letraComprobante: letraDerivada,
      fiscal: esFiscalFinal,
      codigoCliente: clienteSeleccionado?.codigoSecuencial || null,
      condicionVenta: condicionVenta || "Contado",
      observaciones: observaciones,
      periodo: periodo, // CAMPO ESTRUCTURADO
      pagos: listaPagos.map((p) => ({
        metodo: p.metodo.toUpperCase(),
        monto: p.monto,
        detalles: p.detalles,
        referencia: p.referencia,
      })),
      totales: {
        subtotal: totalNetoFinal,
        iva: totalIvaFinal,
        total: totalVentaFinal,
      },
      items: itemsProcesados.map((i) => {
        // Aseguramos que el codigoProducto sea numérico o null para que el DTO valide bien
        const rawIdStr = String(i.rawId || "");
        const isManual = rawIdStr.toLowerCase().startsWith("m-");
        const codigoNumerico = isManual ? null : Number(i.rawId);

        return {
          codigoProducto:
            codigoNumerico && !isNaN(codigoNumerico) ? codigoNumerico : null,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          tasaIva: i.tasaIva,
          subtotal: i.subtotal,
        };
      }),
      comprobantesAsociados: (() => {
        if (!comprobanteAsociado) return undefined;
        // Buscamos la factura origen para sacar los datos técnicos (Tipo, PtoVta, Nro)
        const facturaOrigen = facturas.find((f) => {
          const nroFormateado = `${String(f.puntoVenta).padStart(5, "0")}-${String(f.numeroComprobante).padStart(8, "0")}`;
          return nroFormateado === comprobanteAsociado;
        });

        if (facturaOrigen) {
          return [
            {
              tipo: Number(facturaOrigen.tipoDocumento),
              ptoVta: Number(facturaOrigen.puntoVenta),
              nro: Number(facturaOrigen.numeroComprobante),
            },
          ];
        }
        return undefined;
      })(),
      receptor: clienteSeleccionado
        ? (() => {
            // Si el alumno tiene un ente facturador (responsable), le facturamos a él
            // pero el código de cliente que enviamos al backend sigue siendo el del alumno
            const ente = clienteSeleccionado.enteFacturacion;
            const target = ente?.codigoSecuencial ? ente : clienteSeleccionado;

            // Mapeo de Condicion IVA (Sigla -> ID AFIP)
            const mapaIva = {
              RI: 1, // Responsable Inscripto
              RM: 4, // Responsable Monotributo
              MO: 4, // Monotributista
              EX: 6, // IVA Sujeto Exento
              CF: 5, // Consumidor Final
            };

            const nroDoc =
              Number(target.documento?.toString().replace(/-/g, "")) || 0;

            return {
              razonSocial:
                target.razonSocial || `${target.nombre} ${target.apellido}`,
              DocTipo:
                nroDoc === 0
                  ? 99 // Consumidor Final (Requerido por AFIP si nro es 0)
                  : letraDerivada === "A"
                    ? 80
                    : nroDoc.toString().length > 8
                      ? 80
                      : 96,
              DocNro: nroDoc,
              CondicionIVAReceptorId:
                nroDoc === 0
                  ? 5
                  : mapaIva[target.condicionIva] ||
                    mapaIva[target.condicionIVA] ||
                    5,
              domicilio: target.domicilio || target.direccion || "",
            };
          })()
        : receptorVinculado
          ? {
              razonSocial: receptorVinculado.razonSocial || "CONSUMIDOR FINAL",
              DocTipo: Number(receptorVinculado.DocTipo) || 99,
              DocNro: Number(receptorVinculado.DocNro) || 0,
              CondicionIVAReceptorId:
                Number(receptorVinculado.CondicionIVAReceptorId) || 5,
              domicilio: receptorVinculado.domicilio || "",
            }
          : {
              razonSocial: "CONSUMIDOR FINAL",
              DocTipo: 99,
              DocNro: 0,
              CondicionIVAReceptorId: 5,
              domicilio: "",
            },
    };

    console.log(dto);

    try {
      await mutationGenerar.mutateAsync({
        dto,
        codigoEmpresa: usuario?.codigoEmpresa || 1,
        codigoUnidadNegocio: unidadLocal || 0, // <--- Usamos la local
      });

      // Si la petición es exitosa:
      setItems([]);
      setObservaciones("");
      setMostrarPreview(false);
      limpiarCaptura();
    } catch (error) {
      console.error("Error al procesar la venta en el frontend:", error);
    }
  }, [
    mutationGenerar,
    tipoDocumento,
    items,
    clienteSeleccionado,
    enBlanco,
    usuario,
    periodo,
    condicionVenta,
    observaciones,
    listaPagos,
    comprobanteAsociado,
    facturas,
    receptorVinculado,
    aplicaIva,
    unidadLocal,
    limpiarCaptura,
    agregarAlerta,
  ]);

  // Exponer API del hook
  return {
    // Datos
    items,
    totales,
    productos,
    cargandoProductos,
    tiposComprobante,
    cargandoVouchers,
    clientes: clientesRaw,
    facturas,
    usuario,
    entidades,
    // Estados UI
    codigoBusqueda,
    setCodigoBusqueda,
    cantidadInput,
    setCantidadInput,
    product: productoEncontrado,
    mostrarDropdownProducto,
    setMostrarDropdownProducto,
    highlightedIndex,
    setHighlightedIndex,
    busquedaClaveProducto,
    setBusquedaClaveProducto,
    columnaPrecioSeleccionada,
    setColumnaPrecioSeleccionada,
    camposDinamicos,
    cargandoConfigs,
    tipoDocumento,
    setTipoDocumento,
    enBlanco,
    setEnBlanco,
    aplicaIva,
    metodoPago,
    setMetodoPago,
    clienteSeleccionado,
    setClienteSeleccionado,
    busquedaCliente,
    setBusquedaCliente,
    mostrarDropdownCliente,
    setMostrarDropdownCliente,
    condicionVenta,
    setCondicionVenta,
    entidadSeleccionada,
    setEntidadSeleccionada,
    clientesFiltrados,
    highlightedIndexCliente,
    setHighlightedIndexCliente,
    observaciones,
    setObservaciones,
    // Pagos multiples
    listaPagos,
    setListaPagos,
    vuelto,
    nuevoPago,
    setNuevoPago,
    agregarPago,
    agregarPagoConVuelto,
    eliminarPago,
    busquedaFactura,
    setBusquedaFactura,
    comprobanteAsociado,
    setComprobanteAsociado,
    mostrarDropdownFactura,
    setMostrarDropdownFactura,
    mostrarPreview,
    setMostrarPreview,
    tabActiva,
    setTabActiva,
    unidadLocal,
    setUnidadLocal,
    // Refs
    inputCodigoRef,
    inputCantidadRef,
    // Handlers
    agregarItem,
    eliminarItem,
    actualizarItem,
    handleCodigoKeyDown,
    handleClienteKeyDown,
    handleFinalizar,
    confirmarVentaFinal,
    cargandoCobro: mutationGenerar.isPending,
  };
};
