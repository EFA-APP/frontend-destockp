import { InventarioIcono } from "../../../assets/Icons";

const productoConfig = {
  title: "Detalle del producto",
  icon: <InventarioIcono size={18} />,
  sections: [
    {
      label: "Producto",
      key: "nombre",
      sub: (p) => `Código: ${p.codigoSecuencial}`,
      editable: true,
    },
    {
      label: "Unidad",
      key: "unidadMedida",
      editable: true,
    }
  ],
  metrics: [
    { label: "Stock Total", value: "stock" },
    { label: "Paquetes", value: "cantidadDePaquetesActuales" },
    {
       label: "Cant. p/ Paquete", 
       value: "cantidadPorPaquete" 
    }
  ],
};

export default productoConfig;
