import { ComprobanteIcono } from "../../../assets/Icons";

const facturaProveedorConfig = {
  title: "Detalle de factura",
  icon: <ComprobanteIcono size={18} />,
  sections: [
    { label: "Cliente", key: "razonSocial" },
    { label: "Tipo", key: "tipo" },
    { label: "Fecha Emisión", key: "fechaEmision" },
    { label: "Fecha Vto", key: "fechaVencimiento" },
    { label: "cae", key: "CAE" },
    { label: "Estado", key: "estado" },
  ],
  metrics: [
    {
      label: "Total",
      value: (f) => `$${f.total}`,
    },
  ],
};

export default facturaProveedorConfig;
