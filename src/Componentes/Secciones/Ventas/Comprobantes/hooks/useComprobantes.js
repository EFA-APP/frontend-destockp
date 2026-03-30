import { useState, useRef, useEffect, useMemo } from "react";
import { ListarConfiguracionCamposApi } from "../../../../../Backend/Articulos/api/Producto/producto.api";
import { useProductoUI } from "../../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useClientes } from "../../../../../Backend/hooks/Clientes/useClientes";
import { useFacturas } from "../../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import { useAuthStore } from "../../../../../Backend/Autenticacion/store/authenticacion.store";
import { useArcaStore } from "../../../../../store/useArcaStore";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";
import {
  getPrecio,
  calcularIVA,
  calcularNetoItem,
  calcularTotalItem,
} from "../utils/fiscal.utils";

/**
 * Hook maestro para la gestión de la lógica de Comprobantes.
 * Encapsula la búsqueda de productos, gestión de tickets, cálculos fiscales y estados de ARCA.
 */
export const useComprobantes = () => {
  // === 1. DATOS Y CONTEXTO EXTERNO ===
  const usuario = useAuthStore((state) => state.usuario);
  const { conectado: arcaConectado, infoIva } = useArcaStore();
  const { clientes } = useClientes();
  const { facturas } = useFacturas();

  // === 2. ESTADOS DE BÚSQUEDA Y CAPTURA ===
  const [filtrosProductos, setFiltrosProductos] = useState({ pagina: 1, limite: 10 });
  const [busquedaClaveProducto, setBusquedaClaveProducto] = useState("nombre"); // 'nombre' o 'codigo'
  const { productos, cargando: cargandoProductos } = useProductoUI(filtrosProductos);
  
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [cantidadInput, setCantidadInput] = useState("1");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // === 3. ESTADOS FISCALES Y DE FACTURACIÓN ===
  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [tipoDocumento, setTipoDocumento] = useState("factura");
  const [enBlanco, setEnBlanco] = useState("si");
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [comprobanteAsociado, setComprobanteAsociado] = useState("");
  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [mostrarDropdownFactura, setMostrarDropdownFactura] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [tabActiva, setTabActiva] = useState("productos");

  // === 4. ESTADOS DE CAMPOS DINÁMICOS ===
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] = useState("");

  // === 5. EL TICKET (ITEMS) ===
  const [items, setItems] = useState([]);

  // === 6. REFERENCIAS PARA FOCO ===
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);

  // === 7. DERIVACIONES FISCALES ===
  const aplicaIva = arcaConectado && enBlanco === "si" && !!infoIva?.facturaConIva;
  
  const totales = useMemo(() => {
    let subtotal = 0, iva = 0, total = 0;
    items.forEach((item) => {
      subtotal += calcularNetoItem(item, aplicaIva);
      iva += calcularIVA(item, aplicaIva);
      total += calcularTotalItem(item);
    });
    return { subtotal, iva, total };
  }, [items, aplicaIva]);

  // === 8. EFECTOS DE INICIALIZACIÓN Y SINCRONIZACIÓN ===

  // Carga de campos dinámicos
  useEffect(() => {
    const cargarConfigs = async () => {
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        setCamposDinamicos(data || []);
        if (data?.length > 0) {
          const defaultCol = data.find(c => c.claveCampo === "precioVenta") ? "precioVenta" : data[0].claveCampo;
          setColumnaPrecioSeleccionada(defaultCol);
        }
      } catch (e) { console.error("Error configs:", e); }
    };
    cargarConfigs();
  }, []);

  // Carga de Tipos de Comprobante ARCA
  useEffect(() => {
    const cargarVouchers = async () => {
      if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
        try {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;
          if (Array.isArray(vouchersRaw)) {
            const filtrados = vouchersRaw.map(v => ({ id: v.Id, label: v.Desc }));
            setTiposComprobante(filtrados);
            if (filtrados.length > 0 && !tipoDocumento) setTipoDocumento(filtrados[0].id);
          }
        } catch (e) { console.error("Error vouchers:", e); }
      }
    };
    cargarVouchers();
  }, [usuario]);

  // Sync Modo (X vs ARCA)
  useEffect(() => {
    if (enBlanco === "no") {
      setTipoDocumento(99);
      setItems(prev => prev.map(i => ({ ...i, iva: 0 })));
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

  // Debounce búsqueda productos
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosProductos(prev => {
        const nuevos = { ...prev, pagina: 1 };
        delete nuevos.buscarPorNombre; delete nuevos.buscarPorCodigo;
        if (codigoBusqueda) {
          if (busquedaClaveProducto === "nombre") nuevos.buscarPorNombre = codigoBusqueda;
          else if (busquedaClaveProducto === "codigo" && !isNaN(Number(codigoBusqueda))) nuevos.buscarPorCodigo = Number(codigoBusqueda);
        }
        return nuevos;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [codigoBusqueda, busquedaClaveProducto]);

  // Actualizar precios si cambia la columna seleccionada
  useEffect(() => {
    setItems(prev => prev.map(item => ({
      ...item,
      precioUnitario: getPrecio(item, columnaPrecioSeleccionada)
    })));
  }, [columnaPrecioSeleccionada]);

  // === 9. MANEJADORES DE ACCIONES ===

  const agregarItem = () => {
    if (!productoEncontrado) return;
    const cantidad = parseFloat(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) return alert("Cantidad inválida");

    const itemIndex = items.findIndex(i => i.codigoSecuencial === productoEncontrado.codigoSecuencial);
    if (itemIndex > -1) {
      const nuevosItems = [...items];
      nuevosItems[itemIndex].cantidad += cantidad;
      setItems(nuevosItems);
    } else {

      setItems([...items, {
        ...productoEncontrado,
        cantidad,
        precioUnitario: getPrecio(productoEncontrado, columnaPrecioSeleccionada),
        descuento: 0,
        tasaIva: parseFloat(productoEncontrado.tasaIva) || 21,
      }]);
    }
    limpiarCaptura();
  };

  const limpiarCaptura = () => {
    setCodigoBusqueda("");
    setCantidadInput("1");
    setProductoEncontrado(null);
    inputCodigoRef.current?.focus();
  };

  const eliminarItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    inputCodigoRef.current?.focus();
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;
    setItems(nuevosItems);
  };

  const handleCodigoKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const maxIndex = codigoBusqueda.length > 0 ? productos.length : productos.length - 1;
      setHighlightedIndex(p => p < maxIndex ? p + 1 : p);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(p => p > 0 ? p - 1 : 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      let p = highlightedIndex >= 0 ? (highlightedIndex < productos.length ? productos[highlightedIndex] : {
        id: `m-${Date.now()}`, codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
        nombre: codigoBusqueda.toUpperCase(), descripcion: "ITEM MANUAL", manual: true
      }) : (productos[0] || (codigoBusqueda ? {
        id: `m-${Date.now()}`, codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
        nombre: codigoBusqueda.toUpperCase(), descripcion: "ITEM MANUAL", manual: true
      } : null));

      if (p) {
        setProductoEncontrado(p);
        setCodigoBusqueda(p.manual ? p.nombre : `[${p.codigoSecuencial}] ${p.nombre}`);
        setMostrarDropdownProducto(false);
        inputCantidadRef.current?.focus();
        inputCantidadRef.current?.select();
      }
    } else if (e.key === "Escape") setMostrarDropdownProducto(false);
  };

  const handleFinalizar = () => {
    if (items.length === 0) return alert("Ticket vacío");
    setMostrarPreview(true);
  };

  const confirmarVentaFinal = () => {
    const letraDerivada = [1, 2, 3, 4, 5].includes(Number(tipoDocumento)) ? "A" :
                          [6, 7, 8, 9, 10].includes(Number(tipoDocumento)) ? "B" : "C";
    const payload = {
      tipoDocumento,
      letraComprobante: letraDerivada,
      fiscal: enBlanco === "si",
      clienteId: clienteSeleccionado || null,
      items: items.map(i => ({ ...i, subtotal: calcularTotalItem(i) })),
      totales,
    };
    console.log("Venta finalizada:", payload);
    alert("Venta procesada con éxito");
    setItems([]); 
    setMostrarPreview(false);
    limpiarCaptura();
  };

  // Exponer API del hook
  return {
    // Datos
    items, totales, productos, cargandoProductos, tiposComprobante, clientes, facturas, usuario, 
    // Estados UI
    codigoBusqueda, setCodigoBusqueda, cantidadInput, setCantidadInput, product: productoEncontrado,
    mostrarDropdownProducto, setMostrarDropdownProducto, highlightedIndex, setHighlightedIndex,
    busquedaClaveProducto, setBusquedaClaveProducto, columnaPrecioSeleccionada, setColumnaPrecioSeleccionada,
    camposDinamicos, tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco, aplicaIva,
    metodoPago, setMetodoPago, clienteSeleccionado, setClienteSeleccionado, busquedaCliente, setBusquedaCliente,
    mostrarDropdownCliente, setMostrarDropdownCliente, condicionVenta, setCondicionVenta,
    busquedaFactura, setBusquedaFactura, comprobanteAsociado, setComprobanteAsociado,
    mostrarDropdownFactura, setMostrarDropdownFactura, mostrarPreview, setMostrarPreview, tabActiva, setTabActiva,
    // Refs
    inputCodigoRef, inputCantidadRef,
    // Handlers
    agregarItem, eliminarItem, actualizarItem, handleCodigoKeyDown, handleFinalizar, confirmarVentaFinal
  };
};
