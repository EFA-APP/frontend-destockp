import { InventarioIcono } from "../../../assets/Icons";

const productoConfig = {
  title: "Detalle del producto",
  icon: <InventarioIcono size={18} />,
  sections: [
    {
      label: "Producto",
      key: "nombre",
      sub: (p) => `CODE: ${p.codigoSecuencial}`,
      editable: true,
    },
    {
      label: "Descripción",
      key: "descripcion",
      editable: true,
      type: "textarea"
    },
    {
      label: "Unidad",
      key: "unidadMedida",
      editable: true,
      type: "select",
      options: [
        { label: "PAQUETE", value: "PAQUETE" },
        { label: "FRASCO", value: "FRASCO" }
      ]
    },
    {
      label: "Stock Disponible",
      key: "stock",
      editable: true,
      type: "number"
    },
    {
      label: "Cant. p/ Paquete",
      key: "cantidadPorPaquete",
      editable: true,
      type: "number"
    },
    {
      label: "Estado Activo",
      key: "activo",
      editable: true,
      type: "boolean"
    }
  ],
  metrics: [
    { label: "Stock Total", value: "stock" },
    { label: "Paquetes", value: "cantidadDePaquetesActuales" },
    { label: "Por Paquete", value: "cantidadPorPaquete" }
  ],
};

export default productoConfig;
