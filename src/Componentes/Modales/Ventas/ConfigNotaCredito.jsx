import { NotaCreditoIcono } from "../../../assets/Icons";

const notaCreditoConfig = {
  title: "Detalle Nota de crédito",
  icon: <NotaCreditoIcono size={18} />,
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

export default notaCreditoConfig;
