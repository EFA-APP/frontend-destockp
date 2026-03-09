import { CanastaIcono } from "../../../assets/Icons";

const materiaPrimaConfig = {
  title: "Detalle de Materia Prima",
  icon: <CanastaIcono size={18} />,
  sections: [
    {
      label: "Materia Prima",
      key: "nombre",
      sub: (p) => `Cód: #${p.codigoSecuencial}`,
      editable: true,
      type: "text",
    },
    {
      label: "Tipo de Materia Prima",
      key: "tipo",
      editable: true,
      type: "select",
      options: [
        { value: "INSUMO", label: "INSUMO" },
        { value: "FRUTA", label: "FRUTA" },
      ],
    },
    {
      label: "Unidad de Medida",
      key: "unidadMedida",
      editable: true,
      type: "select",
      options: [
        { value: "KG", label: "Kilogramos (KG)" },
        { value: "GR", label: "Gramos (GR)" },
        { value: "UND", label: "Unidades (UND)" },
        { value: "LT", label: "Litros (LT)" },
        { value: "ML", label: "Mililitros (ML)" },
      ],
    },
    { 
      label: "Stock Actual", 
      key: "stock", 
      editable: true, 
      type: "number",
      ocultar: true 
    },
    { 
      label: "Cantidad por Paquete", 
      key: "cantidadPorPaquete", 
      editable: true, 
      type: "number",
      ocultar: true 
    },
  ],
  metrics: [
    { label: "Stock Registrado", value: (p) => `${p.stock} ${p.unidadMedida}` },
    { label: "Medida Pack", value: (p) => p.cantidadPorPaquete ? `${p.cantidadPorPaquete} ${p.unidadMedida}` : "Individual" },
    { label: "Categoría", value: "tipo" },
  ],
};

export default materiaPrimaConfig;
