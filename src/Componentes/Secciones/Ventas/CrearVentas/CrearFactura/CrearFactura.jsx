import { useState, useRef, useEffect, useMemo } from "react";
import { ListarConfiguracionCamposApi } from "../../../../../Backend/Articulos/api/Producto/producto.api";
import { useProductoUI } from "../../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { useClientes } from "../../../../../Backend/hooks/Clientes/useClientes";
import { useFacturas } from "../../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  ArcaIcono,
  AgregarIcono,
  BorrarIcono,
  BuscadorIcono,
  CarritoIcono,
  CerrarIcono,
  CheckIcono,
  ComprobanteIcono,
  CuentaIcono,
  DineroIcono,
  TarjetaIcono,
  VentasIcono,
} from "../../../../../assets/Icons";

const CrearFactura = () => {
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

  // === ESTADOS DEL TICKET (ITEMS) ===
  const [items, setItems] = useState([]);

  // === ESTADOS DE BÚSQUEDA Y CAPTURA ===
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [cantidadInput, setCantidadInput] = useState("1");
  const [productoEncontrado, setProductoEncontrado] = useState(null);
  const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

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
  const [letraComprobante, setLetraComprobante] = useState("B");
  const [comprobanteAsociado, setComprobanteAsociado] = useState("");
  const [enBlanco, setEnBlanco] = useState("si");
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [condicionVenta, setCondicionVenta] = useState("contado");
  const [aplicaIva, setAplicaIva] = useState(false);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [tabActiva, setTabActiva] = useState("productos"); // 'productos' o 'pago'

  // === ESTADO MENÚ CONTEXTUAL (CLIC DERECHO) ===
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    index: -1,
  });

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
      } catch (e) {}
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

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickAfuera = () => {
      if (contextMenu.visible)
        setContextMenu({ ...contextMenu, visible: false });
    };
    window.addEventListener("click", handleClickAfuera);
    return () => window.removeEventListener("click", handleClickAfuera);
  }, [contextMenu.visible]);

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
          iva: aplicaIva ? 21 : 0,
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
  const calcularSubtotal = (item) => {
    const subtotalBase = item.cantidad * item.precioUnitario;
    const descuentoValor = subtotalBase * ((item.descuento || 0) / 100);
    return subtotalBase - descuentoValor;
  };

  const calcularIVA = (item) => {
    const sub = calcularSubtotal(item);
    return sub * ((item.iva || 0) / 100);
  };

  const totales = useMemo(() => {
    let subtotal = 0;
    let iva = 0;
    let total = 0;

    items.forEach((item) => {
      const sub = calcularSubtotal(item);
      const impuesto = calcularIVA(item);
      subtotal += sub;
      iva += impuesto;
      total += sub + impuesto;
    });

    return { subtotal, iva, total };
  }, [items]);

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
    const payload = {
      tipoDocumento,
      comprobanteAsociado:
        tipoDocumento !== "factura" ? comprobanteAsociado : null,
      letraComprobante,
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
        subtotal: calcularSubtotal(i),
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
        ruta={"Punto de Venta"}
        icono={<VentasIcono />}
        volver={true}
        otroIcono={{
          icono: <ComprobanteIcono />,
          ruta: "/panel/ventas/facturas",
          titulo: "Comprobantes",
        }}
      />

      {/* SELECTOR DE TABS (SOLO MOBILE) */}
      <div className="md:hidden flex bg-[#1a1a1a] border-b border-white/5 p-1 gap-1 shrink-0 mb-4 rounded-xl mx-2 shadow-lg">
        <button
          onClick={() => setTabActiva("productos")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-tight rounded-lg transition-all ${tabActiva === "productos" ? "bg-[var(--primary)] text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "text-[var(--text-muted)] hover:text-white"}`}
        >
          1. Productos
        </button>
        <button
          onClick={() => setTabActiva("pago")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-tight rounded-lg transition-all ${tabActiva === "pago" ? "bg-[var(--primary)] text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "text-[var(--text-muted)] hover:text-white"}`}
        >
          2. Pago
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
          <div className="shrink-0 p-4 bg-[var(--surface-active)] shadow-sm z-10 flex flex-col gap-3 relative">
            {/* FILA 1: SELECTORES (Responsive: se apilan o acompañan) */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              {/* SELECTOR DE LISTA DE PRECIOS */}
              <select
                value={columnaPrecioSeleccionada}
                onChange={(e) => {
                  setColumnaPrecioSeleccionada(e.target.value);
                  setTimeout(() => inputCodigoRef.current?.focus(), 50);
                }}
                title="Lista de Precio (Columna Dinámica)"
                className="flex-1 md:w-32 h-12 bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md px-2 text-[10px] md:text-xs font-black text-emerald-500 focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer appearance-none text-center truncate"
              >
                {camposDinamicos.length === 0 && (
                  <option value="">Sin Listas</option>
                )}
                {camposDinamicos.map((c) => (
                  <option key={c.claveCampo} value={c.claveCampo}>
                    {c.nombreCampo.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* FILA 2 (En mobile) / MISMA FILA (En desktop): BUSCADOR + CANTIDAD */}
              <div className="flex flex-[2] gap-2 w-full md:w-auto relative items-center">
                {/* INPUT CÓDIGO CON SELECTOR INTEGRADO */}
                <div className="relative flex-1 group flex bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md focus-within:border-[var(--primary)] transition-colors shadow-inner h-12">
                  {/* SELECTOR MÉTODO DE BÚSQUEDA INTEGRADO */}
                  <select
                    value={busquedaClaveProducto}
                    onChange={(e) => {
                      setBusquedaClaveProducto(e.target.value);
                      setTimeout(() => inputCodigoRef.current?.focus(), 50);
                    }}
                    className="bg-[var(--fill)] border-r border-[var(--border-medium)] px-2 h-full text-[9px] font-black text-[var(--primary)] focus:outline-none cursor-pointer appearance-none hover:bg-[var(--surface-hover)] transition-colors uppercase tracking-tighter rounded-l-[4px]"
                  >
                    <option value="nombre">NOM</option>
                    <option value="codigo">COD</option>
                  </select>

                  <div className="absolute inset-y-0 left-12 pl-1 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors">
                    <BuscadorIcono size={18} />
                  </div>
                  <input
                    ref={inputCodigoRef}
                    type="text"
                    value={codigoBusqueda}
                    onChange={(e) => {
                      setCodigoBusqueda(e.target.value);
                      setProductoEncontrado(null); // Resetear al escribir
                      setMostrarDropdownProducto(true);
                    }}
                    onFocus={() => setMostrarDropdownProducto(true)}
                    onBlur={() =>
                      setTimeout(() => setMostrarDropdownProducto(false), 200)
                    }
                    onKeyDown={handleCodigoKeyDown}
                    placeholder={`Buscar (ENTER)`}
                    className="w-full bg-transparent border-none pl-12 pr-4 text-base font-bold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)] placeholder:font-normal placeholder:text-white/30"
                  />

                  {/* Desplegable de Productos */}
                  {mostrarDropdownProducto && codigoBusqueda && (
                    <div className="absolute top-full mt-1 left-0 right-0 max-h-64 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-white/10 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[100] p-1 flex flex-col">
                      {cargandoProductos && (
                        <div className="px-3 py-2 text-xs text-[var(--primary)] font-bold animate-pulse text-center">
                          Buscando en base de datos...
                        </div>
                      )}
                      {!cargandoProductos && productos.length === 0 && (
                        <div className="px-3 py-2 text-xs text-red-400 font-bold text-center">
                          No se encontraron productos para "{codigoBusqueda}"
                        </div>
                      )}
                      {!cargandoProductos &&
                        productos.length > 0 &&
                        productos.map((p, index) => {
                          const isHighlighted = index === highlightedIndex;
                          const stockClass =
                            p.stock > 0
                              ? "text-emerald-500 bg-emerald-500/10"
                              : "text-red-500 bg-red-500/10";
                          return (
                            <div
                              id={`prod-search-item-${index}`}
                              key={p.codigoSecuencial}
                              onMouseEnter={() => setHighlightedIndex(index)}
                              onClick={() => {
                                setProductoEncontrado(p);
                                setCodigoBusqueda(
                                  `[${p.codigoSecuencial}] ${p.nombre}`,
                                );
                                setMostrarDropdownProducto(false);
                                inputCantidadRef.current?.focus();
                                inputCantidadRef.current?.select();
                              }}
                              className={`px-3 py-3 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer rounded transition-colors group ${isHighlighted ? "bg-[var(--surface-hover)] border-l-2 border-l-[var(--primary)]" : "hover:bg-[var(--surface-hover)]"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                  <span className="font-black text-sm text-white transition-colors">
                                    {p.nombre}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)]/70 mt-0.5 whitespace-normal break-words line-clamp-2">
                                    {p.descripcion
                                      ? p.descripcion
                                      : "Sin Descripción"}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[11px] font-black text-[var(--primary-light)]">
                                    $
                                    {getPrecio(
                                      p,
                                      columnaPrecioSeleccionada,
                                    ).toLocaleString("es-AR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                  <span
                                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${stockClass}`}
                                  >
                                    Stock: {p.stock || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* OPCIÓN: ITEM MANUAL */}
                      {codigoBusqueda.length > 0 && (
                        <div
                          id={`prod-search-item-${productos.length}`}
                          onMouseEnter={() =>
                            setHighlightedIndex(productos.length)
                          }
                          onClick={() => {
                            const prodManual = {
                              id: `manual-${Date.now()}`,
                              codigoSecuencial: `M-${Date.now().toString().slice(-4)}`,
                              nombre: codigoBusqueda.toUpperCase(),
                              descripcion: "ITEM MANUAL / SERVICIO",
                              precioVenta: 0,
                              stock: 0,
                              manual: true,
                            };
                            setProductoEncontrado(prodManual);
                            setCodigoBusqueda(prodManual.nombre);
                            setMostrarDropdownProducto(false);
                            inputCantidadRef.current?.focus();
                            inputCantidadRef.current?.select();
                          }}
                          className={`px-3 py-3 border-t border-[var(--border-subtle)] cursor-pointer rounded transition-colors group ${highlightedIndex === productos.length ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : "hover:bg-emerald-500/5"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                              <AgregarIcono size={14} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-xs text-emerald-400 uppercase tracking-widest">
                                Usar como item manual
                              </span>
                              <span className="text-[10px] text-white/40 font-bold truncate max-w-[200px]">
                                "{codigoBusqueda}"
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* INPUT CANTIDAD */}
                <div className="w-24 md:w-28 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--primary)] font-black text-sm">
                    x
                  </div>
                  <input
                    ref={inputCantidadRef}
                    type="number"
                    value={cantidadInput}
                    onChange={(e) => setCantidadInput(e.target.value)}
                    onKeyDown={handleCantidadKeyDown}
                    min="0.1"
                    step="1"
                    placeholder="Cant"
                    className="w-full h-12 bg-[var(--surface)] border-2 border-[var(--border-medium)] rounded-md pl-6 md:pl-8 pr-2 text-center text-lg font-black text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Previsualización del producto debajo de la barra */}
            <div className="h-6 flex items-center px-2">
              {productoEncontrado ? (
                <div className="flex items-center gap-2 text-sm text-[var(--text-primary)] font-medium animate-in fade-in">
                  <span className="text-[var(--primary)] font-black">
                    [{productoEncontrado.codigoSecuencial}]
                  </span>
                  {productoEncontrado.nombre}
                  <span className="text-[var(--text-muted)] ml-2 bg-[var(--surface-hover)] px-2 py-0.5 rounded text-xs font-bold">
                    Stock: {productoEncontrado.stock || 0}
                  </span>
                  <span className="text-emerald-500 ml-2 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-black">
                    $ {getPrecio(productoEncontrado, columnaPrecioSeleccionada)}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest flex items-center gap-1">
                  Teclado: Busque, seleccione (o{" "}
                  <kbd className="bg-[var(--surface-hover)] px-1 rounded border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    ENTER
                  </kbd>{" "}
                  para tomar el primero)
                </span>
              )}
            </div>
          </div>

          {/* TABLA DE TICKET (LLENA EL ESPACIO RESTANTE) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] shadow-sm overflow-hidden min-h-full flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#151515] sticky top-0 border-b border-white/5 shadow-sm">
                  <tr className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="px-4 py-3 w-12 text-center">Cant</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-right hidden lg:table-cell">
                      P. Unit
                    </th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-2 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="h-[30vh] text-center">
                        <div className="flex flex-col items-center justify-center opacity-30 text-[var(--text-primary)] gap-3">
                          <CarritoIcono size={48} />
                          <span className="text-sm font-bold uppercase tracking-widest">
                            Ticket Vacío
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const subtotalItem = calcularSubtotal(item);
                      return (
                        <tr
                          key={index}
                          className={`hover:bg-[var(--surface-hover)] transition-colors group ${contextMenu.visible && contextMenu.index === index ? "bg-[var(--surface-hover)]" : ""}`}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setContextMenu({
                              visible: true,
                              x: e.pageX,
                              y: e.pageY,
                              index: index,
                            });
                          }}
                          onClick={(e) => {
                            // En mobile, un clic normal también abre el menú
                            if (window.innerWidth < 768) {
                              setContextMenu({
                                visible: true,
                                x: e.pageX,
                                y: e.pageY,
                                index: index,
                              });
                            }
                          }}
                        >
                          {/* Cantidad Editable */}
                          <td className="px-2 py-2 w-20 text-center relative border-r border-[var(--border-subtle)]/50">
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
                              className="w-full bg-transparent text-center font-black text-[var(--text-primary)] text-sm focus:outline-none focus:bg-[var(--fill)] rounded py-1"
                            />
                          </td>

                          {/* Descripción / Nombre Editable */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
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
                                className="bg-transparent text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:bg-[var(--fill)] rounded w-full border-none p-0 group-hover:text-[var(--primary)] transition-colors"
                              />
                              <input
                                type="text"
                                value={item.descripcion || ""}
                                placeholder="Agregar detalle..."
                                onChange={(e) =>
                                  actualizarItem(
                                    index,
                                    "descripcion",
                                    e.target.value,
                                  )
                                }
                                className="bg-transparent text-[10px] font-medium text-[var(--primary-light)] uppercase tracking-widest focus:outline-none focus:bg-[var(--fill)] rounded w-full border-none p-0"
                              />
                            </div>
                          </td>

                          {/* Precio Unitario Editable (Oculto en móviles pequeños) */}
                          <td className="px-3 py-2 text-right w-28 hidden lg:table-cell">
                            <div className="relative flex items-center justify-end">
                              <span className="absolute left-2 text-[10px] text-[var(--text-muted)]">
                                $
                              </span>
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
                                className="w-full bg-transparent text-right font-bold text-[var(--text-primary)] focus:outline-none focus:bg-[var(--fill)] rounded pl-4 pr-1 py-1"
                              />
                            </div>
                          </td>

                          {/* Subtotal Total del Item */}
                          <td className="px-4 py-3 text-right">
                            <span className="font-black text-[var(--text-primary)]">
                              $
                              {subtotalItem.toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>

                          {/* Acción Borrar */}
                          <td className="px-2 py-2 text-center">
                            <button
                              onClick={() => eliminarItem(index)}
                              className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                              title="Quitar item"
                            >
                              <BorrarIcono size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL DERECHO: OP. Y PAGO (ANCHO FIJO)                    */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-[380px] shrink-0 bg-[#0a0a0a] border-l border-[var(--border-subtle)] flex flex-col shadow-[-10px_0_20px_max(rgba(0,0,0,0.2))] z-20 ${tabActiva !== "pago" ? "hidden md:flex" : "flex"}`}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-3 md:pb-1 flex flex-col gap-4">
            {/* 1. CONFIG FISCAL RAPIDA */}
            <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
                <ComprobanteIcono size={16} />
                <h3 className="text-[11px] font-black uppercase tracking-widest">
                  Documento
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEnBlanco("si")}
                  className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "si" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
                >
                  {enBlanco === "si" && <ArcaIcono size={14} />} FACTURA (ARCA)
                </button>
                <button
                  type="button"
                  onClick={() => setEnBlanco("no")}
                  className={`py-2 rounded-md text-xs font-bold border transition-all flex justify-center items-center gap-1 ${enBlanco === "no" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-transparent text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]"}`}
                >
                  {enBlanco === "no" && <CheckIcono size={14} />} COMPROBANTE X
                </button>
              </div>

              <div className="flex gap-2 bg-[var(--surface-active)] p-1 rounded-lg">
                {[
                  { id: "factura", label: "FAC" },
                  { id: "nota_credito", label: "NC" },
                  { id: "nota_debito", label: "ND" },
                ].map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setTipoDocumento(doc.id)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-black transition-all ${tipoDocumento === doc.id ? "bg-[var(--primary)] text-white shadow-md" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"}`}
                  >
                    {doc.label}
                  </button>
                ))}
              </div>

              {tipoDocumento !== "factura" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 relative">
                  <input
                    type="text"
                    value={busquedaFactura}
                    onChange={(e) => {
                      setBusquedaFactura(e.target.value);
                      setComprobanteAsociado(e.target.value);
                      setMostrarDropdownFactura(true);
                    }}
                    onFocus={() => setMostrarDropdownFactura(true)}
                    onBlur={() =>
                      setTimeout(() => setMostrarDropdownFactura(false), 200)
                    }
                    placeholder="Buscador de comprobante (Ej: 0001 o San Martin)"
                    className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:font-normal"
                  />
                  {mostrarDropdownFactura && busquedaFactura && (
                    <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1">
                      {facturas
                        .filter((f) =>
                          `${f.prefijo}-${f.numero} ${f.cliente}`
                            .toLowerCase()
                            .includes(busquedaFactura.toLowerCase()),
                        )
                        .map((f) => {
                          const nroCompleto = `${f.prefijo}-${f.numero}`;
                          return (
                            <div
                              key={f.id}
                              onClick={() => {
                                setComprobanteAsociado(nroCompleto);
                                setBusquedaFactura(nroCompleto);
                                setMostrarDropdownFactura(false);
                              }}
                              className="px-3 py-2 flex flex-col hover:bg-[var(--primary)] hover:text-white cursor-pointer rounded-md transition-colors"
                            >
                              <span className="text-xs font-bold">
                                {nroCompleto}
                              </span>
                              <span className="text-[10px] opacity-70 truncate">
                                {f.cliente} • ${f.total}
                              </span>
                            </div>
                          );
                        })}
                      {facturas.filter((f) =>
                        `${f.prefijo}-${f.numero} ${f.cliente}`
                          .toLowerCase()
                          .includes(busquedaFactura.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {["A", "B", "C"].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setLetraComprobante(tipo)}
                    className={`flex-1 py-1.5 rounded text-sm font-black border transition-all ${letraComprobante === tipo ? "bg-[var(--primary)]/20 border-[var(--primary)]/50 text-[var(--primary)]" : "bg-[var(--surface-active)] border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"}`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>

              {/* CHECKBOX IVA */}
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="chkIva"
                  checked={aplicaIva}
                  onChange={(e) => setAplicaIva(e.target.checked)}
                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                />
                <label
                  htmlFor="chkIva"
                  className="text-xs font-bold text-[var(--text-primary)] cursor-pointer"
                >
                  Aplicar IVA (21%)
                </label>
              </div>
            </div>

            {/* 2. MÉTODO DE PAGO */}
            <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center gap-2 mb-1 text-[var(--text-muted)]">
                <DineroIcono size={16} />
                <h3 className="text-[11px] font-black uppercase tracking-widest">
                  Método de Pago
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "efectivo", label: "EFECTIVO" },
                  { id: "debito", label: "DÉBITO" },
                  { id: "credito", label: "CRÉDITO" },
                  { id: "transferencia", label: "TRANSF." },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`py-3 rounded-md text-[11px] md:text-[10px] font-black border transition-all ${metodoPago === m.id ? "bg-[var(--primary)] text-black border-[var(--primary)] shadow-lg" : "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-hover)]"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CLIENTE */}
            <div className="bg-[var(--surface)] p-4 rounded-md border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <div className="flex items-center gap-2 mb-1">
                  <CuentaIcono size={16} />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">
                    Cliente
                  </h3>
                </div>
              </div>

              {/* Buscador de Cliente */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar Cliente..."
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setClienteSeleccionado(""); // Reinicia el ID de cliente si tipea manualmente
                    setMostrarDropdownCliente(true);
                  }}
                  onFocus={() => setMostrarDropdownCliente(true)}
                  onBlur={() =>
                    setTimeout(() => setMostrarDropdownCliente(false), 200)
                  }
                  className="w-full bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />

                {/* Visual feedback de que no hay cliente (Consumidor Final) */}
                {!clienteSeleccionado && !busquedaCliente && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-[var(--text-muted)] pointer-events-none bg-[var(--surface-active)] pl-2">
                    Consumidor Final
                  </span>
                )}

                {/* Botón para vaciar si hay algo seleccionado */}
                {(clienteSeleccionado || busquedaCliente) && (
                  <button
                    onClick={() => {
                      setClienteSeleccionado("");
                      setBusquedaCliente("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    title="Quitar cliente (Consumidor Final)"
                  >
                    <BorrarIcono size={16} />
                  </button>
                )}

                {/* Dropdown del Autocomplete */}
                {mostrarDropdownCliente && busquedaCliente && (
                  <div className="absolute top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto custom-scrollbar bg-[var(--surface-active)] border border-[var(--border-subtle)] rounded-md shadow-2xl z-50 p-1 flex flex-col">
                    {Array.isArray(clientes?.data) &&
                      clientes.data
                        .filter((c) =>
                          `${c.nombre} ${c.apellido} ${c.codigoSecuencial}`
                            .toLowerCase()
                            .includes(busquedaCliente.toLowerCase()),
                        )
                        .map((c) => (
                          <div
                            key={c.codigoSecuencial}
                            onClick={() => {
                              setClienteSeleccionado(c.codigoSecuencial);
                              setBusquedaCliente(`${c.nombre} ${c.apellido}`);
                              setMostrarDropdownCliente(false);
                            }}
                            className="px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-white cursor-pointer rounded-md font-medium"
                          >
                            <span className="font-bold opacity-50 mr-2">
                              [{c.codigoSecuencial}]
                            </span>
                            {c.nombre} {c.apellido}
                          </div>
                        ))}
                    {/* Empty state si no encuentra coincidencias */}
                    {Array.isArray(clientes?.data) &&
                      clientes.data.filter((c) =>
                        `${c.nombre} ${c.apellido} ${c.codigoSecuencial}`
                          .toLowerCase()
                          .includes(busquedaCliente.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-3 py-2 text-xs text-[var(--text-muted)] text-center">
                          No se encontraron clientes
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-white">
                  <TarjetaIcono size={14} />
                  <select
                    value={condicionVenta}
                    onChange={(e) => setCondicionVenta(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider focus:outline-none cursor-pointer p-0 m-0 border-none flex-1"
                  >
                    <option value="contado" className="bg-[#151515]">
                      PAGO AL CONTADO
                    </option>
                    <option value="cuenta_corriente" className="bg-[#151515]">
                      CUENTA CORRIENTE
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. FOOTER TOTALES Y BOTÓN (Solo Desktop) */}
          <div className="hidden md:flex shrink-0 p-5 bg-[var(--surface)] border-t border-[var(--border-subtle)] flex-col gap-4">
            {/* Desglose */}
            <div className="space-y-1.5 px-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Subtotal</span>
                <span>
                  $
                  {totales.subtotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Impuestos (IVA)</span>
                <span>
                  $
                  {totales.iva.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Gran Total */}
            <div className="flex items-end justify-between px-1">
              <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-1">
                Total
              </span>
              <span className="text-2xl font-black tabular-nums tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                $
                {totales.total.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Action Button */}
            <button
              onClick={handleFacturar}
              disabled={items.length === 0}
              className={`w-full h-14 rounded-md flex items-center justify-center gap-3 font-black text-xl uppercase tracking-widest transition-all duration-300 shadow-xl border
                        ${
                          items.length === 0
                            ? "bg-[var(--surface-active)] text-[var(--text-muted)] border-transparent cursor-not-allowed opacity-50"
                            : "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1"
                        }
                    `}
            >
              {items.length > 0 && <VentasIcono size={24} />}
              COBRAR (F2)
            </button>
          </div>
        </div>
      </div>
      {/* MENÚ CONTEXTUAL (CLIC DERECHO) */}
      {contextMenu.visible && (
        <div
          className="fixed bg-[#1a1a1a] border border-white/10 rounded-md shadow-2xl z-[999] p-1 w-40 animate-in fade-in zoom-in duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              // "Editar" simplemente enfoca la fila (usando un selector CSS o similar para scroll/clic)
              // Aquí simulamos scroll o simplemente cerramos menú ya que la fila ya es editable
              alert(`Editando: ${items[contextMenu.index]?.nombre}`);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-2 text-xs font-bold text-white hover:bg-[var(--primary)] rounded transition-colors flex items-center justify-between"
          >
            Editar Cantidad <CarritoIcono size={14} className="opacity-50" />
          </button>
          <div className="h-px bg-white/5 my-1" />
          <button
            onClick={() => {
              eliminarItem(contextMenu.index);
              setContextMenu({ ...contextMenu, visible: false });
            }}
            className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors flex items-center justify-between"
          >
            Eliminar Item <BorrarIcono size={14} className="opacity-50" />
          </button>
        </div>
      )}

      {/* DRAWER LATERAL DE CONFIRMACIÓN DE COBRO */}
      {mostrarPreview && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setMostrarPreview(false)}
          />
          {/* Drawer Content */}
          <div className="relative w-full md:w-[450px] bg-[#111] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header del Drawer */}
            <div className="p-6 border-b border-white/5 bg-[#151515] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                  Confirmar Cobro
                </h2>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                  Resumen previo a facturación
                </p>
              </div>
              <button
                onClick={() => setMostrarPreview(false)}
                className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                title="Cerrar vista previa"
              >
                <CerrarIcono size={24} />
              </button>
            </div>

            {/* Listado de Items en el resumen */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[var(--primary-light)] mb-4">
                  <CarritoIcono size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Detalle de Venta
                  </span>
                </div>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start border-b border-white/5 pb-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">
                        {item.cantidad} x {item.nombre}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        P. Unit: ${item.precioUnitario.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-black text-white/90">
                      ${(item.cantidad * item.precioUnitario).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Datos del Cliente y Método */}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-md border border-white/5">
                  <span className="block text-[9px] text-[var(--text-muted)] font-black uppercase mb-1">
                    Cliente
                  </span>
                  <span className="text-xs font-bold text-white truncate block">
                    {clienteSeleccionado || "Consumidor Final"}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-md border border-white/5">
                  <span className="block text-[9px] text-[var(--text-muted)] font-black uppercase mb-1">
                    Pago
                  </span>
                  <span className="text-xs font-bold text-emerald-400 uppercase">
                    {metodoPago}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel de Totales y Botón Final */}
            <div className="p-6 bg-[#0a0a0a] border-top border-white/10 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-white/50 text-xs">
                  <span>SUBTOTAL</span>
                  <span>
                    $
                    {totales.subtotal.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-white/50 text-xs">
                  <span>IVA (21%)</span>
                  <span>
                    $
                    {totales.iva.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-white text-3xl font-black mt-2 pt-2 border-t border-white/5">
                  <span className="tracking-tighter">TOTAL</span>
                  <span className="text-emerald-500">
                    $
                    {totales.total.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={confirmarVentaFinal}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-xl font-black text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 uppercase tracking-tighter active:scale-95"
              >
                <CheckIcono size={24} /> Confirmar y Cobrar
              </button>

              <button
                onClick={() => setMostrarPreview(false)}
                className="w-full text-[var(--text-muted)] hover:text-white py-2 text-xs font-bold transition-colors uppercase tracking-widest"
              >
                Volver al ticket
              </button>
            </div>
          </div>
        </div>
      )}
      {/* BARRA FLOTANTE INFERIOR (SOLO MOBILE) */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-1 left-1 right-1 bg-[#111] border-t-2 border-[var(--primary)] p-4 flex items-center justify-between z-[400] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300 rounded-t-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
              Total Venta
            </span>
            <span className="text-2xl font-black text-emerald-400 leading-none">
              $
              {totales.total.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {tabActiva === "productos" ? (
            <button
              onClick={() => setTabActiva("pago")}
              className="bg-white text-black px-6 py-3 rounded-xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
            >
              Siguiente <VentasIcono size={18} />
            </button>
          ) : (
            <button
              onClick={handleFacturar}
              className="bg-[var(--primary)] text-black px-8 py-3 rounded-xl font-black text-sm uppercase tracking-tighter flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] active:scale-95 transition-transform animate-pulse"
            >
              COBRAR <CheckIcono size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CrearFactura;
