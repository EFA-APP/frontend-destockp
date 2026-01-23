import { NotaDebitoIcono } from "../../../assets/Icons";

const notaDebitoConfig = {
  title: "Detalle Nota de debito",
  icon: <NotaDebitoIcono size={18} />,
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

export default notaDebitoConfig;
