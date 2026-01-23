import { OrdenDeVentaIcono } from "../../../assets/Icons";

const ordenDeVentaConfig = {
  title: "Detalle Orden de venta",
  icon: <OrdenDeVentaIcono size={18} />,
  sections: [
    { label: "Cliente", key: "cliente" },
    { label: "Tipo", key: "tipo" },
    { label: "Fecha", key: "fecha" },
    { label: "Estado", key: "estado" },
  ],
  metrics: [
    {
      label: "Total",
      value: (f) => `$${f.total}`,
    },
  ],
};

export default ordenDeVentaConfig;
