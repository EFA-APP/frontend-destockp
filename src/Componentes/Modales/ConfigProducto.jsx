import { InventarioIcono } from "../../assets/Icons";

const productoConfig = {
  title: "Detalle del producto",
  icon: <InventarioIcono size={18} />,
  sections: [
    {
      label: "Producto",
      key: "nombre",
      sub: (p) => `Código: ${p.codigo}`,
    },
  ],
  metrics: [
    { label: "Stock", value: "stock" },
    { label: "Paquetes", value: "paquetes" },
    {
      label: "Peso total",
      value: (p) => `${p.pesoTotal} kg`,
    },
    {
      label: "Valor total",
      value: (p) => `$${p.precioTotal}`,
    },
  ],
};

export default productoConfig;
