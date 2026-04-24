import { useState, useCallback, useMemo } from "react";
import { calcularNetoItem, calcularIVA, calcularTotalItem, getPrecio } from "../utils/fiscal.utils";

export const useVentaCart = (agregarAlerta, columnaPrecioSeleccionada, aplicaIva) => {
  const [items, setItems] = useState([]);

  const totales = useMemo(() => {
    let subtotal = 0, iva = 0, total = 0;
    items.forEach((item) => {
      subtotal += calcularNetoItem(item, aplicaIva);
      iva += calcularIVA(item, aplicaIva);
      total += calcularTotalItem(item);
    });
    return { subtotal, iva, total };
  }, [items, aplicaIva]);

  const eliminarItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const actualizarItem = useCallback((index, campo, valor) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    );
  }, []);

  const agregarItem = useCallback((product, cantidad, onFinalize = null) => {
    if (!product) return;
    const cant = parseFloat(cantidad);
    
    if (isNaN(cant) || cant <= 0) {
      agregarAlerta?.({
        title: "Advertencia",
        message: "La cantidad debe ser mayor a 0",
        type: "warning",
      });
      return;
    }

    let finalIndex = -1;
    setItems((prev) => {
      const itemIndex = prev.findIndex(
        (i) => i.codigoSecuencial === product.codigoSecuencial
      );
      if (itemIndex > -1) {
        finalIndex = itemIndex;
        const nuevosItems = [...prev];
        nuevosItems[itemIndex] = {
          ...nuevosItems[itemIndex],
          cantidad: nuevosItems[itemIndex].cantidad + cant,
        };
        return nuevosItems;
      }

      finalIndex = prev.length;
      return [
        ...prev,
        {
          ...product,
          cantidad: cant,
          precioUnitario: getPrecio(product, columnaPrecioSeleccionada),
          descuento: 0,
          tasaIva: parseFloat(product.tasaIva) || 0,
        },
      ];
    });

    if (onFinalize) onFinalize(finalIndex);
  }, [agregarAlerta, columnaPrecioSeleccionada]);

  return {
    items,
    setItems,
    totales,
    agregarItem,
    eliminarItem,
    actualizarItem,
  };
};
