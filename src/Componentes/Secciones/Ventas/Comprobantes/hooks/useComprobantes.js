import { useState, useRef, useEffect, useMemo } from "react";
import { ListarConfiguracionCamposApi } from "../../../../../Backend/Articulos/api/Producto/producto.api";
import { useProductoUI } from "../../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useClientes } from "../../../../../Backend/hooks/Clientes/useClientes";
import { useFacturas } from "../../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import { useAuthStore } from "../../../../../Backend/Autenticacion/store/authenticacion.store";
import { useArcaStore } from "../../../../../store/useArcaStore";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";
import { useAlertas } from "../../../../../store/useAlertas";
import {
  getPrecio,
  calcularIVA,
  calcularNetoItem,
  calcularTotalItem,
} from "../utils/fiscal.utils";
import { useGenerarComprobante } from "../../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";

/**
 * Hook maestro para la gestión de la lógica de Comprobantes.
 * Encapsula la búsqueda de productos, gestión de tickets, cálculos fiscales y estados de ARCA.
 */
export const useComprobantes = () => {
  // === 1. DATOS Y CONTEXTO EXTERNO ===
  const usuario = useAuthStore((state) => state.usuario);
  const unidadActiva = useAuthStore((state) => state.unidadActiva);
  const { conectado: arcaConectado, infoIva } = useArcaStore();
  const { clientes } = useClientes();
  const { facturas } = useFacturas();
  const { agregarAlerta } = useAlertas();

  // === 2. ESTADOS DE BÚSQUEDA Y CAPTURA ===
  const [filtrosProductos, setFiltrosProductos] = useState({ pagina: 1, limite: 10 });
  const [busquedaClaveProducto, setBusquedaClaveProducto] = useState("nombre"); // 'nombre' o 'codigo'
  
  // Garantizamos que productos sea siempre un array y cargando un booleano. 
  // Solo habilitamos la búsqueda si hay algo escrito para evitar el fetch inicial masivo.
  const productUI = useProductoUI(filtrosProductos, {
    enabled: !!(filtrosProductos.buscarPorNombre || filtrosProductos.buscarPorCodigo),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache para evitar re-fetch constante
  }) || {};
  const productos = Array.isArray(productUI.productos) ? productUI.productos : [];
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
  const [cargandoConfigs, setCargandoConfigs] = useState(false);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] = useState("");

  // === 5. EL TICKET (ITEMS) ===
  const [items, setItems] = useState([]);

  // === 6. REFERENCIAS PARA FOCO ===
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);

  // === 6.1 MUTACIONES ===
  const mutationGenerar = useGenerarComprobante();

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
      setCargandoConfigs(true);
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        setCamposDinamicos(data || []);
        if (data?.length > 0) {
          const defaultCol = data.find(c => c.claveCampo === "precioVenta") ? "precioVenta" : data[0].claveCampo;
          setColumnaPrecioSeleccionada(defaultCol);
        }
      } catch (e) { console.error("Error configs:", e); }
      finally { setCargandoConfigs(false); }
    };
    cargarConfigs();
  }, [unidadActiva?.codigoSecuencial]);

  // Carga de Tipos de Comprobante ARCA
  useEffect(() => {
    const cargarVouchers = async () => {
      if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
        setCargandoVouchers(true);
        try {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;
          if (Array.isArray(vouchersRaw)) {
            const filtrados = vouchersRaw.map(v => ({ id: v.Id, label: v.Desc }));
            setTiposComprobante(filtrados);
            if (filtrados.length > 0 && !tipoDocumento) setTipoDocumento(filtrados[0].id);
          }
        } catch (e) { console.error("Error vouchers:", e); }
        finally { setCargandoVouchers(false); }
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
    if (isNaN(cantidad) || cantidad <= 0) {
      agregarAlerta({ title: "Advertencia", message: "La cantidad debe ser mayor a 0", type: "warning" });
      return;
    }

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
        tasaIva: parseFloat(productoEncontrado.tasaIva) || 0,
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
    if (items.length === 0) {
      agregarAlerta({ title: "Carrito vacío", message: "Agregue al menos un producto para facturar", type: "warning" });
      return;
    }
    setMostrarPreview(true);
  };

  const confirmarVentaFinal = async () => {
    if (mutationGenerar.isPending) return;

    const letraDerivada = tipoDocumento === 99 ? "X" : [1, 2, 3, 4, 5].includes(Number(tipoDocumento)) ? "A" :
                          [6, 7, 8, 9, 10].includes(Number(tipoDocumento)) ? "B" : "C";

    
    // Función auxiliar para redondear a 2 decimales
    const r2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    // Recalculamos los items asegurando el desglose Neto/IVA para AFIP
    const itemsProcesados = items.map(i => {
      const subtotalLinea = r2(calcularTotalItem(i)); // ANTES NO ESTABA REDONDEADO
      const netoLinea = r2(calcularNetoItem(i, aplicaIva));
      const ivaLinea = r2(subtotalLinea - netoLinea);
      const precioUnitarioNeto = r2(netoLinea / (i.cantidad || 1));

      return {
        codigoProducto: i.id || 0,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: precioUnitarioNeto, 
        descuento: i.descuento || 0,
        tasaIva: i.tasaIva || 0,
        subtotal: subtotalLinea, 
        neto: netoLinea,
        iva: ivaLinea
      };
    });

    // Recalculamos totales globales para que coincidan EXACTO con la suma de los items redondeados
    const totalNetoFinal = r2(itemsProcesados.reduce((acc, i) => acc + i.neto, 0));
    const totalIvaFinal = r2(itemsProcesados.reduce((acc, i) => acc + (i.iva || 0), 0));
    const totalVentaFinal = r2(totalNetoFinal + totalIvaFinal);

    // VALIDACIÓN PREVIA PARA FACTURA A
    if (letraDerivada === "A" && (!clienteSeleccionado || clienteSeleccionado.condicionIVA !== "Responsable Inscripto")) {
       agregarAlerta({ 
         title: "Cliente Requerido", 
         message: "Para emitir una Factura A es obligatorio seleccionar un cliente Responsable Inscripto con CUIT.", 
         type: "error" 
       });
       return;
    }

    // La venta solo puede ser fiscal si el modo está en "si" Y el usuario tiene permiso/conexión real
    const esFiscalFinal = (enBlanco === "si" && usuario?.conexionArca === true);

    // Mapeo detallado del DTO para el backend
    const dto = {
      puntoVenta: 1, 
      codigoUsuario: usuario?.id || 1,
      tipoDocumento: Number(tipoDocumento),
      letraComprobante: letraDerivada,
      fiscal: esFiscalFinal,
      codigoCliente: clienteSeleccionado?.id || null,
      condicionVenta: condicionVenta || "Contado",
      metodoPago: metodoPago || "Efectivo",
      totales: {
        subtotal: totalNetoFinal,
        iva: totalIvaFinal,
        total: totalVentaFinal,
      },
      items: itemsProcesados.map(i => {
        // Aseguramos que el codigoProducto sea numérico o null para que el DTO valide bien
        const codigoNumerico = (typeof i.id === 'string' && i.id.startsWith('m-')) ? null : Number(i.id);
        
        return {
          codigoProducto: isNaN(codigoNumerico) ? null : codigoNumerico,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          descuento: i.descuento,
          tasaIva: i.tasaIva,
          subtotal: i.subtotal
        };
      }),
      receptor: !clienteSeleccionado ? {
        razonSocial: "CONSUMIDOR FINAL",
        DocTipo: 99,
        DocNro: 0,
        CondicionIVAReceptorId: 5,
        domicilio: ""
      } : {
        razonSocial: clienteSeleccionado.nombre,
        DocTipo: letraDerivada === "A" ? 80 : (clienteSeleccionado.documento?.length > 8 ? 80 : 96),
        DocNro: Number(clienteSeleccionado.documento?.replace(/-/g, "")) || 0,
        CondicionIVAReceptorId: clienteSeleccionado.condicionIVA === "Responsable Inscripto" ? 1 : 5,
        domicilio: clienteSeleccionado.direccion || ""
      }
    };

    try {
      await mutationGenerar.mutateAsync({ 
        dto, 
        codigoEmpresa: usuario?.codigoEmpresa || 1 
      });
      
      // Si la petición es exitosa:
      setItems([]); 
      setMostrarPreview(false);
      limpiarCaptura();
    } catch (error) {
      console.error("Error al procesar la venta en el frontend:", error);
    }
  };

  // Exponer API del hook
  return {
    // Datos
    items, totales, productos, cargandoProductos, tiposComprobante, cargandoVouchers, 
    clientes, facturas, usuario, 
    // Estados UI
    codigoBusqueda, setCodigoBusqueda, cantidadInput, setCantidadInput, product: productoEncontrado,
    mostrarDropdownProducto, setMostrarDropdownProducto, highlightedIndex, setHighlightedIndex,
    busquedaClaveProducto, setBusquedaClaveProducto, columnaPrecioSeleccionada, setColumnaPrecioSeleccionada,
    camposDinamicos, cargandoConfigs, tipoDocumento, setTipoDocumento, enBlanco, setEnBlanco, aplicaIva,
    metodoPago, setMetodoPago, clienteSeleccionado, setClienteSeleccionado, busquedaCliente, setBusquedaCliente,
    mostrarDropdownCliente, setMostrarDropdownCliente, condicionVenta, setCondicionVenta,
    busquedaFactura, setBusquedaFactura, comprobanteAsociado, setComprobanteAsociado,
    mostrarDropdownFactura, setMostrarDropdownFactura, mostrarPreview, setMostrarPreview, tabActiva, setTabActiva,
    // Refs
    inputCodigoRef, inputCantidadRef,
    // Handlers
    agregarItem, eliminarItem, actualizarItem, handleCodigoKeyDown, handleFinalizar, confirmarVentaFinal,
    cargandoCobro: mutationGenerar.isPending
  };
};
