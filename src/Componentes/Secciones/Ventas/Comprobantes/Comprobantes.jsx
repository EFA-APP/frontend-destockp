import { useState, useRef, useEffect, useMemo } from "react";
import { ListarConfiguracionCamposApi } from "../../../../Backend/Articulos/api/Producto/producto.api";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useClientes } from "../../../../Backend/hooks/Clientes/useClientes";
import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useArcaStore } from "../../../../store/useArcaStore";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CarritoIcono,
  ComprobanteIcono,
  DineroIcono,
} from "../../../../assets/Icons";

// Importar Sub-componentes
import BusquedaProducto from "./BusquedaProducto";
import TablaTicket from "./TablaTicket";
import PanelPago from "./PanelPago";
import ResumenVentaMobile from "./ResumenVentaMobile";
import ModalConfirmacionCobro from "./ModalConfirmacionCobro";

const Comprobantes = () => {
  // === ESTADOS DE BÚSQUEDA AL BACKEND (PRODUCTOS) ===
  const [filtrosProductos, setFiltrosProductos] = useState({
    pagina: 1,
    limite: 10,
  });
  const [busquedaClaveProducto, setBusquedaClaveProducto] = useState("nombre"); // 'nombre' o 'codigo'

  // === HOOKS Y DATOS ===
  const { productos, cargando: cargandoProductos } =
    useProductoUI(filtrosProductos);
  const { clientes } = useClientes();
  const { facturas } = useFacturas();
  const usuario = useAuthStore((state) => state.usuario);

  // === ESTADOS DEL TICKET (ITEMS) ===
  const { conectado: arcaConectado, infoIva } = useArcaStore();
  const [items, setItems] = useState([]);

  // === ESTADOS DE BÚSQUEDA Y CAPTURA ===
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [cantidadInput, setCantidadInput] = useState("1");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // === ESTADOS DE COMPROBANTES DINÁMICOS (ARCA) ===
  const [tiposComprobante, setTiposComprobante] = useState([]);

  // === ESTADOS DE BUSCADORES DE LA BARRA LATERAL ===
  const [busquedaFactura, setBusquedaFactura] = useState("");
  const [mostrarDropdownFactura, setMostrarDropdownFactura] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [mostrarDropdownCliente, setMostrarDropdownCliente] = useState(false);

  // === ESTADOS DE CAMPOS DINÁMICOS (LISTAS DE PRECIOS) ===
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] =
    useState("");

  // === ESTADOS DE FACTURACIÓN ===
  const [tipoDocumento, setTipoDocumento] = useState("factura");
  const [comprobanteAsociado, setComprobanteAsociado] = useState("");
  const [enBlanco, setEnBlanco] = useState("si");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [condicionVenta, setCondicionVenta] = useState("contado");
  // Determinar si aplica IVA de forma automática según la sesión de ARCA
  const aplicaIva = arcaConectado && enBlanco === "si" && !!infoIva?.facturaConIva;
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [tabActiva, setTabActiva] = useState("productos"); // 'productos' o 'pago'

  // === REFERENCIAS PARA FOCO (TECLADO) ===
  const inputCodigoRef = useRef(null);
  const inputCantidadRef = useRef(null);

  // === CARGA DE CAMPOS DINÁMICOS PARA PRECIOS ===
  useEffect(() => {
    const cargarConfigs = async () => {
      try {
        const data = await ListarConfiguracionCamposApi("PRODUCTO");
        setCamposDinamicos(data || []);
        if (data && data.length > 0) {
          const tienePrecioVenta = data.find(
            (c) => c.claveCampo === "precioVenta",
          );
          if (tienePrecioVenta) {
            setColumnaPrecioSeleccionada("precioVenta");
          } else {
            setColumnaPrecioSeleccionada(data[0].claveCampo);
          }
        }
      } catch (e) {
        console.error("Error cargando configs de campos dinámicos:", e);
      }
    };
    cargarConfigs();
  }, []);

  // === CARGA DE COMPROBANTES DINÁMICOS (ARCA) ===
  useEffect(() => {
    const cargarVouchers = async () => {
      try {
        if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;

          if (Array.isArray(vouchersRaw)) {
            // Filtrar FchHasta === null y mapear
            const filtrados = vouchersRaw?.map((v) => ({
              id: v.Id,
              label: v.Desc,
            }));
            setTiposComprobante(filtrados);

            // Seleccionar el primero por defecto si no hay nada seleccionado
            if (filtrados.length > 0 && !tipoDocumento) {
              setTipoDocumento(filtrados[0].id);
            }
          }
        }
      } catch (e) {
        console.error("Error cargando tipos de comprobante:", e);
      }
    };
    cargarVouchers();
  }, [usuario]);

  // === SYNC TIPO DOCUMENTO CON MODO (X = 99) ===
  useEffect(() => {
    if (enBlanco === "no") {
      setTipoDocumento(99);
      // Resetear IVA en items existentes
      setItems((prev) => prev.map((item) => ({ ...item, iva: 0 })));
    } else if (enBlanco === "si" && tipoDocumento === 99) {
      if (tiposComprobante.length > 0) {
        setTipoDocumento(tiposComprobante[0].id);
      }
    }
  }, [enBlanco, tipoDocumento]);

  // Sincronizar el tipo de documento inicial con la preferencia de ARCA
  useEffect(() => {
    if (arcaConectado && infoIva?.tipoFacturaDefault) {
      setTipoDocumento(infoIva.tipoFacturaDefault);
    }
  }, [arcaConectado, infoIva]);


  // === FOCO INICIAL ===
  useEffect(() => {
    if (inputCodigoRef.current) {
      inputCodigoRef.current.focus();
    }
  }, []);

  // === FUNCIONES DE BÚSQUEDA ===
  // Helper para extraer precio de forma segura (soporta números encadenados como string "1.500,00" y atributos anidados)
  const getPrecio = (prod, col) => {
    if (!prod || !col) return 0;

    let attr = prod.atributos?.[col];

    // Por seguridad, si el backend devuleve un stringificado de todo JSON:
    if (typeof prod.atributos === "string") {
      try {
        const parsed = JSON.parse(prod.atributos);
        attr = parsed[col];
      } catch (e) { }
    }

    // Intento de fallback si, por alguna razón, guardan el precio dinámico como propiedad raíz
    if (attr === undefined && prod[col] !== undefined) {
      attr = prod[col];
    }

    if (attr !== undefined && attr !== null && attr !== "") {
      if (typeof attr === "number") return attr;
      if (typeof attr === "string") {
        const clean = attr.replace(/\./g, "").replace(",", ".");
        const val = parseFloat(clean);
        if (!isNaN(val)) return val;
      }
    }

    // Default 0 en caso de no ser encontrado
    return 0;
  };

  // Auto-scroll del dropdown al usar las flechitas
  useEffect(() => {
    if (mostrarDropdownProducto && highlightedIndex >= 0) {
      const el = document.getElementById(
        `prod-search-item-${highlightedIndex}`,
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [highlightedIndex, mostrarDropdownProducto]);

  // Reset del resaltado cuando cambia la búsqueda
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [codigoBusqueda, productos]);

  // Debounce para aplicar la búsqueda al backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosProductos((prev) => {
        const nuevos = { ...prev, pagina: 1 };
        delete nuevos.buscarPorNombre;
        delete nuevos.buscarPorCodigo;

        if (codigoBusqueda) {
          if (busquedaClaveProducto === "nombre") {
            nuevos.buscarPorNombre = codigoBusqueda;
          } else if (busquedaClaveProducto === "codigo") {
            const num = Number(codigoBusqueda);
            if (!isNaN(num)) nuevos.buscarPorCodigo = num;
          }
        }
        return nuevos;
      });
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [codigoBusqueda, busquedaClaveProducto]);

  // Actualización global de precios en el ticket cuando se cambia la lista
  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        precioUnitario: getPrecio(item, columnaPrecioSeleccionada),
      })),
    );
  }, [columnaPrecioSeleccionada]);

  // === MANEJADORES DE EVENTOS TECLADO ===
  const handleCodigoKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (mostrarDropdownProducto) {
        // Permitimos resaltar hasta productos.length (la opción de item manual)
        const maxIndex =
          codigoBusqueda.length > 0 ? productos.length : productos.length - 1;
        setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (mostrarDropdownProducto) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      let prodToUse = productoEncontrado;

      if (mostrarDropdownProducto && highlightedIndex >= 0) {
        if (highlightedIndex < productos.length) {
          // Producto real de la base de datos
          prodToUse = productos[highlightedIndex];
        } else if (
          highlightedIndex === productos.length &&
          codigoBusqueda.length > 0
        ) {
          // Item manual
          prodToUse = {
            id: `manual-${Date.now()}`,
            codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
            nombre: codigoBusqueda.toUpperCase(),
            descripcion: "ITEM MANUAL",
            precioVenta: 0,
            stock: 0,
            manual: true,
          };
        }

        if (prodToUse) {
          setProductoEncontrado(prodToUse);
          setCodigoBusqueda(
            prodToUse.manual
              ? prodToUse.nombre
              : `[${prodToUse.codigoSecuencial}] ${prodToUse.nombre}`,
          );
        }
      } else if (!prodToUse && productos.length > 0) {
        // Fallback al primero de la lista
        prodToUse = productos[0];
        setProductoEncontrado(prodToUse);
        setCodigoBusqueda(
          `[${prodToUse.codigoSecuencial}] ${prodToUse.nombre}`,
        );
      } else if (!prodToUse && codigoBusqueda.length > 0) {
        // Fallback a manual si no hay nada más
        prodToUse = {
          id: `manual-${Date.now()}`,
          codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
          nombre: codigoBusqueda.toUpperCase(),
          descripcion: "ITEM MANUAL / SERVICIO",
          precioVenta: 0,
          stock: 0,
          manual: true,
        };
        setProductoEncontrado(prodToUse);
        setCodigoBusqueda(prodToUse.nombre);
      }

      if (prodToUse) {
        setMostrarDropdownProducto(false);
        inputCantidadRef.current?.focus();
        inputCantidadRef.current?.select();
      }
    } else if (e.key === "Escape") {
      setMostrarDropdownProducto(false);
    }
  };

  const handleCantidadKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarItem();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setCodigoBusqueda("");
      setCantidadInput("1");
      inputCodigoRef.current?.focus();
    }
  };

  // === LÓGICA DEL CARRITO ===
  const agregarItem = () => {
    if (!productoEncontrado) return;

    const cantidad = parseFloat(cantidadInput);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Cantidad inválida");
      return;
    }

    // Buscamos si ya está en el carrito
    const itemIndex = items.findIndex(
      (i) => i.codigoSecuencial === productoEncontrado.codigoSecuencial,
    );

    if (itemIndex > -1) {
      // Sumar cantidad al existente
      const nuevosItems = [...items];
      nuevosItems[itemIndex].cantidad += cantidad;
      setItems(nuevosItems);
    } else {
      // Agregar como nuevo
      let precioVenta = getPrecio(
        productoEncontrado,
        columnaPrecioSeleccionada,
      );

      setItems([
        ...items,
        {
          ...productoEncontrado,
          cantidad: cantidad,
          precioUnitario: precioVenta,
          descuento: 0,
          tasaIva: parseFloat(productoEncontrado.tasaIva || productoEncontrado.atributos?.tasaIva) || 21,
        },
      ]);
    }

    // Resetear inputs y volver foco
    setCodigoBusqueda("");
    setCantidadInput("1");
    setProductoEncontrado(null);
    inputCodigoRef.current?.focus();
  };

  const eliminarItem = (index) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
    inputCodigoRef.current?.focus();
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index][campo] = valor;
    setItems(nuevosItems);
  };

  // === CÁLCULOS FINANCIEROS ===
  const calcularIVA = (item) => {
    if (!aplicaIva) return 0;
    const totalConDescuento = calcularTotalItem(item);
    const tasa = parseFloat(item.tasaIva) || 0;
    const neto = totalConDescuento / (1 + tasa / 100);
    return totalConDescuento - neto;
  };

  const calcularTotalItem = (item) => {
    const bruto = (item.cantidad || 0) * (item.precioUnitario || 0);
    const desc = bruto * ((item.descuento || 0) / 100);
    return bruto - desc;
  };

  const calcularNetoItem = (item) => {
    const total = calcularTotalItem(item);
    if (!aplicaIva) return total;
    const tasa = parseFloat(item.tasaIva) || 0;
    return total / (1 + tasa / 100);
  };

  const totales = useMemo(() => {
    let subtotal = 0;
    let iva = 0;
    let total = 0;

    items.forEach((item) => {
      const neto = calcularNetoItem(item);
      const impuesto = calcularIVA(item);
      const bruto = calcularTotalItem(item);

      subtotal += neto;
      iva += impuesto;
      total += bruto;
    });

    return { subtotal, iva, total };
  }, [items, aplicaIva]);

  // === GENERACIÓN ===
  const handleFacturar = () => {
    if (items.length === 0) {
      alert("No hay productos en la factura.");
      return;
    }
    console.log("Abriendo vista previa...");
    setMostrarPreview(true);
  };

  const confirmarVentaFinal = () => {
    const letraDerivada = [1, 2, 3, 4, 5].includes(Number(tipoDocumento)) ? "A" :
                          [6, 7, 8, 9, 10].includes(Number(tipoDocumento)) ? "B" : "C";

    const payload = {
      tipoDocumento,
      comprobanteAsociado:
        tipoDocumento !== "factura" ? comprobanteAsociado : null,
      letraComprobante: letraDerivada,
      fiscal: enBlanco === "si",
      clienteId: clienteSeleccionado || null,
      condicionVenta,
      metodoPago,
      totales,
      items: items.map((i) => ({
        codigoProducto: i.codigoSecuencial,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        descuento: i.descuento,
        iva: i.iva,
        subtotal: calcularTotalItem(i),
      })),
    };

    console.log("VENTA CONFIRMADA (PAYLOAD):", payload);
    alert(
      `✅ VENTA CONFIRMADA\nTotal cobrado: $${totales.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
    );

    // Limpiar ticket y estados auxiliares
    setItems([]);
    setCodigoBusqueda("");
    setCantidadInput("1");
    setBusquedaCliente("");
    setBusquedaFactura("");
    setClienteSeleccionado("");
    setComprobanteAsociado("");
    setMostrarPreview(false);
    inputCodigoRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-screen md:h-screen w-full bg-[var(--fill)] overflow-hidden pt-4 md:py-6 px-2">
      {/* HEADER GLOBLAL REDUCIDO */}
      <EncabezadoSeccion
        ruta={"Comprobantes"}
        icono={<ComprobanteIcono />}
        volver={true}
      />

      {/* SELECTOR DE TABS (SOLO MOBILE) - ESTILO PREMIUM SEGMENTED */}
      <div className="md:hidden flex bg-[#080808] p-1 gap-1.5 shrink-0 mb-6 rounded-lg mx-4 border border-white/10 relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden mt-3">
        {/* Indicador Deslizante con Gradiente y Glow */}
        <div
          className={`absolute inset-y-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-gradient-to-br from-white/20 to-white/5 border border-white/20 rounded-md shadow-[0_0_15px_rgba(255,255,255,0.05)] ${tabActiva === "productos" ? "left-1 w-[calc(50%-0.25rem)]" : "left-[50%] w-[calc(50%-0.25rem)]"}`}
        />

        <button
          onClick={() => setTabActiva("productos")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2.5 transition-all duration-300 ${tabActiva === "productos" ? "text-white scale-[1.02]" : "text-[var(--text-muted)] hover:text-white/80"}`}
        >
          <div
            className={`transition-all duration-300 ${tabActiva === "productos" ? "text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" : "opacity-50"}`}
          >
            <CarritoIcono size={18} />
          </div>
          <span
            className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all ${tabActiva === "productos" ? "opacity-100" : "opacity-60"}`}
          >
            Productos
            {items.length > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black ${tabActiva === "productos" ? "bg-[var(--primary)] text-black" : "bg-white/10 text-white"}`}
              >
                {items.length}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setTabActiva("pago")}
          className={`flex-1 relative z-10 py-3 flex items-center justify-center gap-2.5 transition-all duration-300 ${tabActiva === "pago" ? "text-white scale-[1.02]" : "text-[var(--text-muted)] hover:text-white/80"}`}
        >
          <div
            className={`transition-all duration-300 ${tabActiva === "pago" ? "text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" : "opacity-50"}`}
          >
            <DineroIcono size={18} />
          </div>
          <span
            className={`text-[11px] font-black uppercase tracking-[0.1em] transition-all ${tabActiva === "pago" ? "opacity-100" : "opacity-60"}`}
          >
            Pago
          </span>
        </button>
      </div>

      {/* CUERPO SPLIT-SCREEN */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================= */}
        {/* PANEL IZQUIERDO: CAPTURA Y TICKET                         */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col min-w-0 border-r border-[var(--border-subtle)] bg-[var(--fill2)] ${tabActiva !== "productos" ? "hidden md:flex" : "flex"}`}
        >
          {/* AREA DE ENTRADA / ESCANER */}
          <BusquedaProducto
            inputCodigoRef={inputCodigoRef}
            inputCantidadRef={inputCantidadRef}
            codigoBusqueda={codigoBusqueda}
            setCodigoBusqueda={setCodigoBusqueda}
            busquedaClaveProducto={busquedaClaveProducto}
            setBusquedaClaveProducto={setBusquedaClaveProducto}
            camposDinamicos={camposDinamicos}
            columnaPrecioSeleccionada={columnaPrecioSeleccionada}
            setColumnaPrecioSeleccionada={setColumnaPrecioSeleccionada}
            cargandoProductos={cargandoProductos}
            productos={productos}
            highlightedIndex={highlightedIndex}
            setHighlightedIndex={setHighlightedIndex}
            setProductoEncontrado={setProductoEncontrado}
            mostrarDropdownProducto={mostrarDropdownProducto}
            setMostrarDropdownProducto={setMostrarDropdownProducto}
            handleCodigoKeyDown={handleCodigoKeyDown}
            handleCantidadKeyDown={handleCantidadKeyDown}
            cantidadInput={cantidadInput}
            setCantidadInput={setCantidadInput}
            getPrecio={getPrecio}
          />

          {/* TABLA DE TICKET */}
          <TablaTicket
            items={items}
            actualizarItem={actualizarItem}
            eliminarItem={eliminarItem}
            calcularSubtotal={calcularTotalItem}
          />
        </div>


        {/* ========================================================= */}
        {/* PANEL DERECHO: OP. Y PAGO (ANCHO FIJO)                    */}
        {/* ========================================================= */}
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
          handleFacturar={handleFacturar}
          items={items}
          tiposComprobante={tiposComprobante}
          usuario={usuario}
        />
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <ModalConfirmacionCobro
        mostrarPreview={mostrarPreview}
        setMostrarPreview={setMostrarPreview}
        items={items}
        clienteSeleccionado={clienteSeleccionado}
        metodoPago={metodoPago}
        totales={totales}
        confirmarVentaFinal={confirmarVentaFinal}
        enBlanco={enBlanco}
        aplicaIva={aplicaIva}
        tipoDocumento={tipoDocumento}
      />

      {/* BARRA FLOTANTE MOBILE */}
      <ResumenVentaMobile
        items={items}
        totales={totales}
        tabActiva={tabActiva}
        setTabActiva={setTabActiva}
        handleFacturar={handleFacturar}
      />
    </div>
  );
};

export default Comprobantes;
