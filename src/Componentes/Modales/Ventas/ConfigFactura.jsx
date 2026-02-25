import { ComprobanteIcono } from "../../../assets/Icons";

export const facturaConfig = {
  title: "Detalle de factura",
  icon: <ComprobanteIcono size={18} />,
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

