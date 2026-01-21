import { CanastaIcono } from "../../../assets/Icons";

const materiaPrimaConfig = {
  title: "Detalle del Materia Prima",
  icon: <CanastaIcono size={18} />,
  sections: [
    {
      label: "Materia Prima",
      key: "nombre",
      sub: (p) => `Código: ${p.codigo}`,
      editable: true,
    },
    {
      label: "Descripción",
      key: "descripcion",
      editable: true,
    },
    { label: "Stock", key: "stock", editable: true, ocultar: true },
    { label: "Paquetes", key: "paquetes", editable: true, ocultar: true },
    { label: "Cant. Paquetes", key: "cantidadPorPaquete", editable: true, ocultar: true },
    {
      label: "Precio Unitario",
      key: "precioUnitario",
       editable: true, 
       ocultar: true 
    },
    {
      label: "Precio Total",
      key: "precioTotal",
      editable: true,
      ocultar: true
    },
  ],
  metrics: [
    { label: "Stock", value: "stock", editable: true },
    { label: "Paquetes", value: "paquetes", editable: true },
    { label: "Cant. Paquetes", value: "cantidadPorPaquete", editable: true },
    {
      label: "Precio Unitario",
      value: (p) => `${p.precioUnitario}`,
       editable: true
    },
    {
      label: "Precio Total",
      value: (p) => `$${p.precioTotal}`,
      editable: true,
    },
  ],
};

export default materiaPrimaConfig;
