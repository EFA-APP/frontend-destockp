import { useState, useEffect, useMemo } from "react";
import { useProductoUI } from "../Articulos/hooks/Producto/useProductoUI";
import { useObtenerCuentasImputablesQuery } from "../Contabilidad/queries/useCuentas.query";
import { useAuthStore } from "../Autenticacion/store/authenticacion.store";

// Tasas de IVA habituales en Argentina. Ajustá esta lista si tu negocio
// trabaja con otras alícuotas. Se usa tanto en el modal como en el carrito.
export const TASAS_IVA = [0, 10.5, 21, 27];

export const TIPO_FISCAL_OPTIONS = {
  GRAVADO:    "Gravado 0%",
  EXENTO:     "Exento",
  NO_GRAVADO: "No Gravado",
};

export const useDetalleComprobante = (tipoOperacion = "INGRESO") => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [tipoDetalle, setTipoDetalle] = useState("PRODUCTO"); // MATERIA_PRIMA / CUENTA_CONTABLE

  const tipoCuentaContable =
    tipoOperacion === "EGRESO" ? "RESULTADO_NEGATIVO" : "RESULTADO_POSITIVO";

  const [filtrosProductos, setFiltrosProductos] = useState({
    pagina: 1,
    limite: 10,
  });
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [busquedaCCDebounced, setBusquedaCCDebounced] = useState("");
  const [columnaPrecioSeleccionada, setColumnaPrecioSeleccionada] =
    useState("precioVenta");
  const [items, setItems] = useState([]);

  // ───────────────────────── BÚSQUEDA: PRODUCTO / MATERIA PRIMA ─────────────────────────
  const productUI =
    useProductoUI(filtrosProductos, {
      enabled: !!filtrosProductos.buscarPorGeneral,
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
    }) || {};
  const productos = Array.isArray(productUI.productos)
    ? productUI.productos
    : [];
  const cargandoProductos = !!productUI.cargando;

  // ───────────────────────── BÚSQUEDA: CUENTA CONTABLE ─────────────────────────
  const { data: dataCuentas, isLoading: cargandoCuentasContables } =
    useObtenerCuentasImputablesQuery(
      tipoDetalle === "CUENTA_CONTABLE" ? tipoCuentaContable : null,
      busquedaCCDebounced || undefined,
      codigoEmpresa,
    );
  const cuentasContables = Array.isArray(dataCuentas) ? dataCuentas : [];

  // Resultado y estado de carga genéricos: el modal no necesita saber
  // de dónde vienen, solo qué mostrar según tipoDetalle.
  const resultadosBusqueda =
    tipoDetalle === "CUENTA_CONTABLE" ? cuentasContables : productos;
  const cargandoBusqueda =
    tipoDetalle === "CUENTA_CONTABLE"
      ? cargandoCuentasContables
      : cargandoProductos;

  // Debounce compartido para la búsqueda de productos/materia prima y cuentas contables
  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltrosProductos((prev) => ({
        ...prev,
        buscarPorGeneral: codigoBusqueda || undefined,
      }));
      setBusquedaCCDebounced(codigoBusqueda);
    }, 300);

    return () => clearTimeout(handler);
  }, [codigoBusqueda]);

  // ───────────────────────── CARRITO ─────────────────────────

  /**
   * Agrega un item al carrito.
   * `opciones.tasaIva` permite fijar el IVA con el que se agrega (si no se
   * pasa, usa el tasaIva propio del item o 0).
   * `opciones.precioUnitario` permite forzar el precio (lo usa, por ejemplo,
   * el "Importe" que se tipea a mano para una Cuenta Contable).
   */
  const agregarItem = (item, cantidad, opciones = {}) => {
    if (!item) return;
    const cant = parseFloat(cantidad) || 1;
    const tasaIva =
      opciones.tasaIva !== undefined
        ? parseFloat(opciones.tasaIva) || 0
        : parseFloat(item.tasaIva) || 0;
    const precioUnitario =
      opciones.precioUnitario !== undefined
        ? parseFloat(opciones.precioUnitario) || 0
        : item.precioVenta || parseFloat(item.precio) || 0;

    setItems((prev) => {
      const itemIndex = prev.findIndex(
        (i) =>
          i.codigo === item.codigo &&
          i.tipoDetalle === tipoDetalle,
      );
      if (itemIndex > -1) {
        const nuevosItems = [...prev];
        nuevosItems[itemIndex] = {
          ...nuevosItems[itemIndex],
          cantidad: nuevosItems[itemIndex].cantidad + cant,
        };
        return nuevosItems;
      }
      return [
        ...prev,
        {
          ...item,
          // Guardamos con qué tipo de búsqueda se agregó (PRODUCTO /
          // MATERIA_PRIMA / CUENTA_CONTABLE) para poder renderizarlo
          // distinto en el carrito y no mezclar ítems iguales de orígenes
          // distintos.
          tipoDetalle,
          cantidad: cant,
          precioUnitario,
          descuento: 0,
          tasaIva,
          tipoFiscal: opciones.tipoFiscal || "GRAVADO",
          codigoDeposito: opciones.codigoDeposito ?? 0,
        },
      ];
    });
  };

  const actualizarCantidadItem = (codigo, cantidad) => {
    const cant = Math.max(0, parseFloat(cantidad) || 0);
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo ? { ...i, cantidad: cant } : i,
      ),
    );
  };

  const actualizarTasaIvaItem = (codigo, tasaIva) => {
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo
          ? { ...i, tasaIva: parseFloat(tasaIva) || 0 }
          : i,
      ),
    );
  };

  const actualizarTipoFiscalItem = (codigo, tipoFiscal) => {
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo
          ? { ...i, tipoFiscal }
          : i,
      ),
    );
  };

  const actualizarPrecioItem = (codigo, precioUnitario) => {
    const precio = Math.max(0, parseFloat(precioUnitario) || 0);
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo
          ? { ...i, precioUnitario: precio }
          : i,
      ),
    );
  };

  const quitarItem = (codigo) => {
    setItems((prev) =>
      prev.filter((i) => i.codigo !== codigo),
    );
  };

  const actualizarDevolverAStockItem = (codigo, valor) => {
    setItems((prev) =>
      prev.map((i) =>
        i.codigo === codigo ? { ...i, devolverAStock: !!valor } : i,
      ),
    );
  };

  /**
   * Vuelve el detalle (carrito + búsquedas) al mismo estado inicial que
   * tenía al montar el componente, para dejar el formulario listo para
   * cargar un comprobante nuevo después de guardar exitosamente.
   */
  const reset = () => {
    setItems([]);
    setTipoDetalle("PRODUCTO");
    setCodigoBusqueda("");
    setBusquedaCCDebounced("");
    setFiltrosProductos({ pagina: 1, limite: 10 });
    setColumnaPrecioSeleccionada("precioVenta");
  };

  // ───────────────────────── TOTALES ─────────────────────────
  // Cada total vive en su propia variable: nunca se mezcla el precio del
  // producto con el IVA dentro del mismo número.

  // 1) Lo que vale lo agregado, SIN IVA (cantidad x precio - descuento)
  const subtotalSinIva = useMemo(
    () =>
      items.reduce((acc, i) => {
        const base = i.precioUnitario * i.cantidad - (i.descuento || 0);
        return acc + Math.max(0, base);
      }, 0),
    [items],
  );

  // 2) El IVA de todo lo agregado, calculado por línea y sumado aparte
  const totalIva = useMemo(
    () =>
      items.reduce((acc, i) => {
        const base = i.precioUnitario * i.cantidad - (i.descuento || 0);
        const iva = Math.max(0, base) * ((i.tasaIva || 0) / 100);
        return acc + iva;
      }, 0),
    [items],
  );

  // 3) Lo que efectivamente se cobra: precio + IVA
  const totalGeneral = subtotalSinIva + totalIva;

  return {
    tipoDetalle,
    setTipoDetalle,
    codigoBusqueda,
    setCodigoBusqueda,
    resultadosBusqueda,
    cargandoBusqueda,
    columnaPrecioSeleccionada,
    setColumnaPrecioSeleccionada,
    items,
    setItems,
    agregarItem,
    actualizarCantidadItem,
    actualizarPrecioItem,
    actualizarTasaIvaItem,
    actualizarTipoFiscalItem,
    actualizarDevolverAStockItem,
    quitarItem,
    reset,
    subtotalSinIva,
    totalIva,
    totalGeneral,
    TIPO_FISCAL_OPTIONS,
  };
};
